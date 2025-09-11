import dotenv from 'dotenv';
import { FastMCP, type Logger } from 'fastmcp';
import { z } from 'zod';
import FirecrawlApp from '@mendable/firecrawl-js';
import type { IncomingHttpHeaders } from 'http';

dotenv.config();

interface SessionData {
  firecrawlApiKey: string;
  [key: string]: unknown;
}

function extractApiKey(headers: IncomingHttpHeaders): string | undefined {
  const headerAuth = headers['authorization'];
  const headerApiKey = (headers['x-firecrawl-api-key'] ||
    headers['x-api-key']) as string | string[] | undefined;

  if (headerApiKey) {
    return Array.isArray(headerApiKey) ? headerApiKey[0] : headerApiKey;
  }

  if (
    typeof headerAuth === 'string' &&
    headerAuth.toLowerCase().startsWith('bearer ')
  ) {
    return headerAuth.slice(7).trim();
  }

  return undefined;
}

function removeEmptyTopLevel<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (
      typeof v === 'object' &&
      !Array.isArray(v) &&
      Object.keys(v).length === 0
    )
      continue;
    // @ts-expect-error dynamic assignment
    out[k] = v;
  }
  return out;
}

class ConsoleLogger implements Logger {
  debug(...args: unknown[]): void {
    console.debug('[DEBUG]', new Date().toISOString(), ...args);
  }
  error(...args: unknown[]): void {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  }
  info(...args: unknown[]): void {
    console.log('[INFO]', new Date().toISOString(), ...args);
  }
  log(...args: unknown[]): void {
    console.log('[LOG]', new Date().toISOString(), ...args);
  }
  warn(...args: unknown[]): void {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  }
}

const server = new FastMCP<SessionData>({
  name: 'firecrawl-fastmcp',
  version: '2.0.0',
  logger: new ConsoleLogger(),
  roots: { enabled: false },
  authenticate: async (request): Promise<SessionData> => {
    if (process.env.CLOUD_SERVICE === 'true') {
      const apiKey = extractApiKey(request.headers);
      console.log('Authenticating request', apiKey);

      if (!apiKey) {
        console.error('Firecrawl API key is required');
        process.exit(1);
      }
      return { firecrawlApiKey: apiKey };
    } else {
      if (!process.env.FIRECRAWL_API_KEY) {
        console.error('Firecrawl API key is required');
        process.exit(1);
      }
      return { firecrawlApiKey: process.env.FIRECRAWL_API_KEY };
    }
  },
  // Lightweight health endpoint for LB checks
  health: {
    enabled: true,
    message: 'ok',
    path: '/health',
    status: 200,
  },
});

function createClient(apiKey: string): FirecrawlApp {
  return new FirecrawlApp({
    apiKey,
    ...(process.env.FIRECRAWL_API_URL && {
      apiUrl: process.env.FIRECRAWL_API_URL,
    }),
  });
}

const ORIGIN = 'mcp-fastmcp';

function getClient(session?: SessionData): FirecrawlApp {
  if (!session || !session.firecrawlApiKey) {
    console.error('Unauthorized');
    process.exit(1);
  }
  return createClient(session.firecrawlApiKey);
}

function asText(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

// scrape tool (v2 semantics, minimal args)
// Centralized scrape params (used by scrape, and referenced in search/crawl scrapeOptions)
const scrapeParamsSchema = z.object({
  url: z.string().url(),
  formats: z
    .array(
      z.union([
        z.enum([
          'markdown',
          'html',
          'rawHtml',
          'screenshot',
          'links',
          'summary',
          'changeTracking',
        ]),
        z.object({
          type: z.literal('json'),
          prompt: z.string().optional(),
          schema: z.record(z.string(), z.any()).optional(),
        }),
        z.object({
          type: z.literal('screenshot'),
          fullPage: z.boolean().optional(),
          quality: z.number().optional(),
          viewport: z
            .object({ width: z.number(), height: z.number() })
            .optional(),
        }),
      ])
    )
    .optional(),
  onlyMainContent: z.boolean().optional(),
  includeTags: z.array(z.string()).optional(),
  excludeTags: z.array(z.string()).optional(),
  waitFor: z.number().optional(),
  actions: z
    .array(
      z.object({
        type: z.enum([
          'wait',
          'click',
          'screenshot',
          'write',
          'press',
          'scroll',
          'scrape',
          'executeJavascript',
          'generatePDF',
        ]),
        selector: z.string().optional(),
        milliseconds: z.number().optional(),
        text: z.string().optional(),
        key: z.string().optional(),
        direction: z.enum(['up', 'down']).optional(),
        script: z.string().optional(),
        fullPage: z.boolean().optional(),
      })
    )
    .optional(),
  mobile: z.boolean().optional(),
  skipTlsVerification: z.boolean().optional(),
  removeBase64Images: z.boolean().optional(),
  location: z
    .object({
      country: z.string().optional(),
      languages: z.array(z.string()).optional(),
    })
    .optional(),
  storeInCache: z.boolean().optional(),
  maxAge: z.number().optional(),
});

server.addTool({
  name: 'firecrawl_scrape',
  description:
    'Scrape content from a single URL. Best for precise single-page extraction. Returns formats like markdown/html/rawHtml/links or JSON via { type: "json", prompt, schema }.',
  parameters: scrapeParamsSchema,
  execute: async (args, { session, log }) => {
    const { url, ...options } = args;
    const client = getClient(session);
    const cleaned = removeEmptyTopLevel(options);
    log.info('Scraping URL', { url });
    const res = await client.scrape(url, { ...cleaned, origin: ORIGIN } as any);
    return asText(res);
  },
});

// map tool (v2 semantics, minimal args)
server.addTool({
  name: 'firecrawl_map',
  description:
    'Map a website to discover indexed URLs. Best for enumerating pages before scraping/crawling.',
  parameters: z.object({
    url: z.string().url(),
    search: z.string().optional(),
    sitemap: z.enum(['include', 'skip', 'only']).optional(),
    includeSubdomains: z.boolean().optional(),
    limit: z.number().optional(),
    ignoreQueryParameters: z.boolean().optional(),
  }),
  execute: async (args, { session, log }) => {
    const { url, ...options } = args;
    const client = getClient(session);
    const cleaned = removeEmptyTopLevel(options);
    log.info('Mapping URL', { url });
    const res = await client.map(url, { ...cleaned, origin: ORIGIN } as any);
    return asText(res);
  },
});

// search tool (v2 semantics, minimal args)
server.addTool({
  name: 'firecrawl_search',
  description:
    'Search the web and optionally scrape results. Provide scrapeOptions.formats (strings or { type: "json", ... }) for per-result extraction.',
  parameters: z.object({
    query: z.string().min(1),
    limit: z.number().optional(),
    tbs: z.string().optional(),
    filter: z.string().optional(),
    location: z.string().optional(),
    sources: z
      .array(z.object({ type: z.enum(['web', 'images', 'news']) }))
      .optional(),
    scrapeOptions: scrapeParamsSchema.omit({ url: true }).partial().optional(),
  }),
  execute: async (args, { session, log }) => {
    const client = getClient(session);
    const { query, ...opts } = args as Record<string, unknown>;
    const cleaned = removeEmptyTopLevel(opts as Record<string, unknown>);
    log.info('Searching', { query: String(query) });
    const res = await client.search(query as string, {
      ...(cleaned as any),
      origin: ORIGIN,
    });
    return asText(res);
  },
});

// crawl tool (v2 semantics)
server.addTool({
  name: 'firecrawl_crawl',
  description:
    'Start a crawl job to discover and extract multiple pages. Returns an operation descriptor; use firecrawl_check_crawl_status for progress/results.',
  parameters: z.object({
    url: z.string(),
    prompt: z.string().optional(),
    excludePaths: z.array(z.string()).optional(),
    includePaths: z.array(z.string()).optional(),
    maxDiscoveryDepth: z.number().optional(),
    sitemap: z.enum(['skip', 'include', 'only']).optional(),
    limit: z.number().optional(),
    allowExternalLinks: z.boolean().optional(),
    allowSubdomains: z.boolean().optional(),
    crawlEntireDomain: z.boolean().optional(),
    delay: z.number().optional(),
    maxConcurrency: z.number().optional(),
    webhook: z
      .union([
        z.string(),
        z.object({
          url: z.string(),
          headers: z.record(z.string(), z.string()).optional(),
        }),
      ])
      .optional(),
    deduplicateSimilarURLs: z.boolean().optional(),
    ignoreQueryParameters: z.boolean().optional(),
    scrapeOptions: scrapeParamsSchema.omit({ url: true }).partial().optional(),
  }),
  execute: async (args, { session, log }) => {
    const { url, ...options } = args as Record<string, unknown>;
    const client = getClient(session);
    const cleaned = removeEmptyTopLevel(options as Record<string, unknown>);
    log.info('Starting crawl', { url: String(url) });
    const res = await client.crawl(String(url), {
      ...(cleaned as any),
      origin: ORIGIN,
    });
    return asText(res);
  },
});

// crawl status tool
server.addTool({
  name: 'firecrawl_check_crawl_status',
  description:
    'Check the status/progress of a crawl job and retrieve results when complete.',
  parameters: z.object({ id: z.string() }),
  execute: async (args, { session }) => {
    const client = getClient(session);
    const res = await client.getCrawlStatus((args as any).id as string);
    return asText(res);
  },
});

// extract tool (v2 semantics)
server.addTool({
  name: 'firecrawl_extract',
  description:
    'Extract structured data from one or more URLs using LLM extraction (prompt + schema).',
  parameters: z.object({
    urls: z.array(z.string()),
    prompt: z.string().optional(),
    schema: z.record(z.string(), z.any()).optional(),
    allowExternalLinks: z.boolean().optional(),
    enableWebSearch: z.boolean().optional(),
    includeSubdomains: z.boolean().optional(),
  }),
  execute: async (args, { session, log }) => {
    const client = getClient(session);
    const a = args as Record<string, unknown>;
    log.info('Extracting from URLs', {
      count: Array.isArray(a.urls) ? a.urls.length : 0,
    });
    const extractBody = removeEmptyTopLevel({
      urls: a.urls as string[],
      prompt: a.prompt as string | undefined,
      schema: (a.schema as Record<string, unknown>) || undefined,
      allowExternalLinks: a.allowExternalLinks as boolean | undefined,
      enableWebSearch: a.enableWebSearch as boolean | undefined,
      includeSubdomains: a.includeSubdomains as boolean | undefined,
      origin: ORIGIN,
    });
    const res = await client.extract(extractBody as any);
    return asText(res);
  },
});
console.log('process.env', process.env);
const PORT = Number(process.env.PORT || 3000);
const HOST =
  process.env.CLOUD_SERVICE === 'true'
    ? '0.0.0.0'
    : process.env.HOST || 'localhost';
type StartArgs = Parameters<typeof server.start>[0];
let args: StartArgs;

if (
  process.env.CLOUD_SERVICE === 'true' ||
  process.env.SSE_LOCAL === 'true' ||
  process.env.HTTP_STREAMABLE_SERVER === 'true'
) {
  args = {
    transportType: 'httpStream',
    httpStream: {
      port: PORT,
      host: HOST,
      stateless: true,
    },
  };
} else {
  // default: stdio
  args = {
    transportType: 'stdio',
  };
}

await server.start(args);
