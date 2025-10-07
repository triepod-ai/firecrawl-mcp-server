# Parameter Descriptions Enhancement

## Overview

This document details the comprehensive parameter description enhancement implemented in this fork. All parameters across 6 MCP tools now include detailed `.describe()` annotations to improve AI agent understanding, developer experience, and code documentation.

## Motivation

The upstream Firecrawl MCP server used Zod schemas without parameter descriptions, making it harder for:
- **LLMs/AI Agents**: To understand parameter purpose, format, and usage patterns
- **Developers**: To know expected values and formats without consulting external docs
- **IDEs**: To provide helpful tooltips and auto-complete suggestions

## Implementation Statistics

- **Total Parameters Enhanced**: 50+ parameters
- **Tools Enhanced**: 6 tools (100% coverage)
- **Schema Files Modified**: 1 (src/index.ts)
- **Lines Added**: ~50 description annotations
- **Nested Types Covered**: Union types, nested objects, conditional schemas

## Tools Enhanced

### 1. firecrawl_scrape (scrapeParamsSchema)

This schema is shared by `firecrawl_scrape`, `firecrawl_search` (scrapeOptions), and `firecrawl_crawl` (scrapeOptions).

**Parameters Enhanced: 18+**

| Parameter | Description Added |
|-----------|-------------------|
| `url` | "The URL to scrape content from" |
| `formats` | "Output formats to return. Can be format strings (markdown, html, rawHtml, screenshot, links, summary, changeTracking) or objects for JSON extraction or screenshot configuration" |
| `formats[].type` (json) | "Extract structured data using LLM" |
| `formats[].prompt` | "Custom prompt to guide LLM extraction" |
| `formats[].schema` | "JSON schema defining the structure of data to extract" |
| `formats[].type` (screenshot) | "Capture screenshot with custom settings" |
| `formats[].fullPage` | "Capture full page screenshot instead of just viewport" |
| `formats[].quality` | "Screenshot quality (0-100)" |
| `formats[].viewport` | "Custom viewport dimensions for screenshot" |
| `formats[].viewport.width` | "Viewport width in pixels" |
| `formats[].viewport.height` | "Viewport height in pixels" |
| `onlyMainContent` | "Extract only main content, removing headers/footers/navigation. Default: true" |
| `includeTags` | "HTML tags to include in extraction (e.g., ['article', 'main'])" |
| `excludeTags` | "HTML tags to exclude from extraction (e.g., ['nav', 'footer'])" |
| `waitFor` | "Milliseconds to wait before scraping. Useful for dynamic content that loads after page load" |
| `actions` | "Browser automation actions to perform before scraping. Execute actions sequentially to interact with the page" |
| `actions[].type` | "Action type to perform: wait, screenshot, scroll, scrape, click, write, press, executeJavascript, or generatePDF" |
| `actions[].selector` | "CSS selector for the element to interact with (required for click, write actions)" |
| `actions[].milliseconds` | "Duration in milliseconds (for wait action)" |
| `actions[].text` | "Text to type (for write action)" |
| `actions[].key` | "Key to press (for press action, e.g., 'Enter', 'Tab')" |
| `actions[].direction` | "Scroll direction (for scroll action)" |
| `actions[].script` | "JavaScript code to execute (for executeJavascript action)" |
| `actions[].fullPage` | "Capture full page (for screenshot action)" |
| `mobile` | "Emulate mobile device for scraping" |
| `skipTlsVerification` | "Skip TLS certificate verification (useful for self-signed certificates)" |
| `removeBase64Images` | "Remove base64-encoded images from output to reduce response size" |
| `location` | "Geographic location settings for scraping. Affects content localization" |
| `location.country` | "Country code for geographic location (e.g., 'US', 'GB')" |
| `location.languages` | "Language codes for content preferences (e.g., ['en', 'es'])" |
| `storeInCache` | "Whether to store result in Firecrawl cache for future fast retrieval" |
| `maxAge` | "Maximum cache age in milliseconds. Use cached results if available and younger than this value. Enables fast scraping (up to 500% faster). Example: 172800000 for 48 hours" |

**Key Innovation**: Performance optimization hints included (e.g., maxAge cache explanation with concrete example)

### 2. firecrawl_map

**Parameters Enhanced: 6**

| Parameter | Description Added |
|-----------|-------------------|
| `url` | "The website URL to map and discover all pages" |
| `search` | "Search term to filter discovered URLs" |
| `sitemap` | "How to handle sitemaps: 'include' (use if available), 'skip' (ignore), 'only' (only use sitemap)" |
| `includeSubdomains` | "Include URLs from subdomains in results" |
| `limit` | "Maximum number of URLs to return" |
| `ignoreQueryParameters` | "Treat URLs with different query parameters as the same page" |

**Key Innovation**: Enum value explanations inline (e.g., sitemap options clearly explained)

### 3. firecrawl_search

**Parameters Enhanced: 7**

| Parameter | Description Added |
|-----------|-------------------|
| `query` | "Search query. Supports operators like site:, inurl:, intitle:, - (exclude), quotes for exact match" |
| `limit` | "Maximum number of search results to return" |
| `tbs` | "Time-based search parameter (e.g., 'qdr:d' for past day, 'qdr:w' for past week, 'qdr:m' for past month, 'qdr:y' for past year)" |
| `filter` | "Additional filter for search results" |
| `location` | "Geographic location for search context (e.g., 'United States', 'London')" |
| `sources` | "Array of source types to search. Each object has 'type' field: 'web', 'images', or 'news'" |
| `sources[].type` | "Source type: 'web' for websites, 'images' for image search, 'news' for news articles" |
| `scrapeOptions` | "Optional parameters to scrape content from search results. Uses same schema as firecrawl_scrape" |

**Key Innovation**: Search operator examples provided inline, concrete time-based search values

### 4. firecrawl_crawl

**Parameters Enhanced: 15**

| Parameter | Description Added |
|-----------|-------------------|
| `url` | "Starting URL for the crawl. Can use wildcards (e.g., '/blog/*' to crawl all blog paths)" |
| `prompt` | "Custom prompt to guide what content to extract during crawl" |
| `excludePaths` | "Array of URL patterns to exclude from crawling (e.g., ['/admin/*', '/login'])" |
| `includePaths` | "Array of URL patterns to include in crawling (e.g., ['/blog/*', '/docs/*'])" |
| `maxDiscoveryDepth` | "Maximum depth to discover new links (affects how deep to follow links from starting URL)" |
| `sitemap` | "How to handle sitemaps: 'skip' (ignore), 'include' (use if available), 'only' (only use sitemap)" |
| `limit` | "Maximum number of pages to crawl. Be conservative to avoid token limits and long wait times" |
| `allowExternalLinks` | "Allow crawling links to external domains outside the starting domain" |
| `allowSubdomains` | "Allow crawling subdomains of the starting domain (e.g., blog.example.com when starting at example.com)" |
| `crawlEntireDomain` | "Crawl all pages on the domain, not just paths under starting URL" |
| `delay` | "Milliseconds to wait between page crawls to avoid overwhelming the target server" |
| `maxConcurrency` | "Maximum number of concurrent page crawls to run in parallel" |
| `webhook` | "Webhook URL or config object to receive crawl progress updates. Only available when SAFE_MODE is false" |
| `webhook.url` | "Webhook URL to receive crawl progress updates" |
| `webhook.headers` | "Custom HTTP headers to include in webhook requests" |
| `deduplicateSimilarURLs` | "Remove similar/duplicate URLs from crawl (e.g., URLs that differ only in tracking parameters)" |
| `ignoreQueryParameters` | "Treat URLs with different query parameters as the same page" |
| `scrapeOptions` | "Scraping parameters to apply to each crawled page. Uses same schema as firecrawl_scrape" |

**Key Innovation**: Pattern examples with concrete paths, performance warnings included

### 5. firecrawl_check_crawl_status

**Parameters Enhanced: 1**

| Parameter | Description Added |
|-----------|-------------------|
| `id` | "The crawl job ID returned from firecrawl_crawl to check status and retrieve results" |

**Key Innovation**: Cross-references related tool (firecrawl_crawl)

### 6. firecrawl_extract

**Parameters Enhanced: 6**

| Parameter | Description Added |
|-----------|-------------------|
| `urls` | "Array of URLs to extract structured data from" |
| `prompt` | "Custom prompt describing what information to extract from the pages" |
| `schema` | "JSON schema defining the structure of data to extract (e.g., properties, types, required fields)" |
| `allowExternalLinks` | "Allow extraction from external links found on the specified pages" |
| `enableWebSearch` | "Enable web search to gather additional context for extraction" |
| `includeSubdomains` | "Include pages from subdomains in extraction" |

**Key Innovation**: Schema structure hints provided

## Technical Implementation

### Zod Schema Pattern

```typescript
// Before (Upstream)
const schema = z.object({
  maxAge: z.number().optional(),
  formats: z.array(z.string()).optional(),
});

// After (This Fork)
const schema = z.object({
  maxAge: z.number().optional().describe(
    "Maximum cache age in milliseconds. Use cached results if available and younger than this value. " +
    "Enables fast scraping (up to 500% faster). Example: 172800000 for 48 hours"
  ),
  formats: z.array(z.string()).optional().describe(
    "Output formats to return. Can be format strings (markdown, html, rawHtml, screenshot, links, summary, changeTracking)"
  ),
});
```

### Nested Schema Pattern

```typescript
// Nested objects with descriptions
location: z.object({
  country: z.string().optional().describe("Country code for geographic location (e.g., 'US', 'GB')"),
  languages: z.array(z.string()).optional().describe("Language codes for content preferences (e.g., ['en', 'es'])"),
})
.optional()
.describe("Geographic location settings for scraping. Affects content localization"),
```

### Union Type Pattern

```typescript
// Union types with descriptions on each variant
formats: z.array(
  z.union([
    z.enum(['markdown', 'html', 'rawHtml', 'screenshot', 'links', 'summary', 'changeTracking']),
    z.object({
      type: z.literal('json').describe("Extract structured data using LLM"),
      prompt: z.string().optional().describe("Custom prompt to guide LLM extraction"),
      schema: z.record(z.string(), z.any()).optional().describe("JSON schema defining the structure of data to extract"),
    }),
  ])
)
.optional()
.describe("Output formats to return. Can be format strings or objects for advanced configuration"),
```

### Conditional Schema Pattern (SAFE_MODE)

```typescript
...(SAFE_MODE ? {} : {
  actions: z.array(
    z.object({
      type: z.enum(allowedActionTypes).describe(
        "Action type to perform: wait, screenshot, scroll, scrape, click, write, press, executeJavascript, or generatePDF"
      ),
      // ... more described parameters
    })
  )
  .optional()
  .describe("Browser automation actions to perform before scraping. Execute actions sequentially to interact with the page"),
}),
```

## Benefits Delivered

### For AI Agents/LLMs

1. **Better Parameter Understanding**: LLMs can read descriptions and select appropriate values
2. **Reduced Hallucination**: Clear format specifications reduce incorrect parameter usage
3. **Self-Documenting**: No need to fetch external documentation
4. **Example Values**: Concrete examples (e.g., country codes, time values) guide selection

### For Developers

1. **IDE Integration**: Descriptions show in tooltips during development
2. **Type Safety**: Zod validation combined with descriptions creates self-validating, self-documenting APIs
3. **Reduced Documentation Burden**: Schema serves as source of truth
4. **Faster Onboarding**: New developers understand parameters immediately

### For Maintainers

1. **Single Source of Truth**: Schema and documentation in one place
2. **Version Control**: Descriptions evolve with code
3. **Reduced Doc Drift**: No separate documentation to maintain
4. **Clear Intent**: Future maintainers understand parameter purpose

## Testing

All parameter descriptions were validated through:

1. **TypeScript Compilation**: Verified descriptions don't break type checking
2. **Build Verification**: `npm run build` succeeds with all descriptions
3. **Runtime Testing**: Server starts and tools function with described schemas
4. **MCP Protocol Compliance**: Descriptions properly serialized in tool definitions

## Comparison with Upstream

| Aspect | Upstream | This Fork |
|--------|----------|-----------|
| Total Described Parameters | 0 | 50+ |
| Documentation Method | External docs only | Self-documenting schemas |
| IDE Support | Minimal (types only) | Rich (types + descriptions) |
| AI Agent Friendly | Limited | Optimized |
| Example Values | None in code | Inline examples |
| Performance Hints | External | Inline (e.g., maxAge cache) |

## Future Enhancements

Potential future improvements to parameter descriptions:

1. **Validation Error Messages**: Custom error messages using Zod's `.refine()`
2. **Default Value Documentation**: Explicitly document default behaviors
3. **Constraint Examples**: More examples for constrained values (ranges, patterns)
4. **Interactive Examples**: Link to playground examples for complex parameters
5. **Version Annotations**: Note when parameters were added/changed

## Conclusion

This parameter description enhancement represents a significant improvement to the developer and AI agent experience. By making the schemas self-documenting, we've created a more maintainable, understandable, and accessible MCP server implementation.

The investment of ~50 lines of description annotations delivers:
- Better AI agent integration
- Improved developer experience
- Reduced documentation maintenance
- Enhanced code quality

This serves as a model for how MCP servers should document their tool parameters for optimal integration with AI agents and development tools.

---

**Author**: [@triepod-ai](https://github.com/triepod-ai)
**Date**: 2025-10-07
**Fork**: [firecrawl-mcp-server](https://github.com/triepod-ai/firecrawl-mcp-server)
