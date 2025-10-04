<div align="center">
  <a name="readme-top"></a>
  <img
    src="https://raw.githubusercontent.com/firecrawl/firecrawl-mcp-server/main/img/fire.png"
    height="140"
  >
</div>

# Firecrawl MCP Server (Enhanced Fork)

> **Note**: This is an enhanced fork of the [official Firecrawl MCP Server](https://github.com/firecrawl/firecrawl-mcp-server) maintained by [@triepod-ai](https://github.com/triepod-ai) with updated dependencies and framework improvements.

A Model Context Protocol (MCP) server implementation that integrates with [Firecrawl](https://github.com/firecrawl/firecrawl) for web scraping capabilities.

## Fork Changes

This fork includes the following enhancements:

- **Updated MCP SDK**: Upgraded from TypeScript MCP SDK 1.18.0 to 1.18.2 (October 1, 2025)
- **Dependency Updates**: All dependencies updated to latest stable versions
- **Framework Improvements**: Enhanced reliability, error handling, and transport stability
- **Docker Containerization**: Production-ready Docker support with docker-compose.yml
- **MCP-Compliant Wrapper Script**: Clean stdio handling for JSON-RPC communication
- **Log File Infrastructure**: Comprehensive logging system for debugging without stdio pollution

For the original implementation, see the [upstream repository](https://github.com/firecrawl/firecrawl-mcp-server).

> Big thanks to [@vrknetha](https://github.com/vrknetha), [@knacklabs](https://www.knacklabs.ai) for the initial implementation!

## MCP SDK Version

**Current Version**: TypeScript MCP SDK 1.18.2 (upgraded October 1, 2025)

This server uses the latest Model Context Protocol SDK (via `firecrawl-fastmcp` dependency) with modern features:

### SDK Features:
- **OAuth/OIDC Authentication**: Complete authentication flow support
- **Enhanced Tool Metadata**: Rich tool definition capabilities with `_meta` field
- **Improved Reliability**: Enhanced error handling and transport stability
- **Audio Content**: Protocol-level support for audio content types
- **CORS Support**: Browser-based client integration
- **Middleware Architecture**: Composable fetch middleware for auth workflows

### Additional Dependency Updates (October 1, 2025):
- `@mendable/firecrawl-js`: 4.3.6 → 4.3.7
- `@types/node`: 24.3.1 → 24.6.1
- `dotenv`: 17.2.2 → 17.2.3
- `typescript`: 5.9.2 → 5.9.3
- `zod`: 4.1.5 → 4.1.11

**Previous MCP SDK Version**: 1.18.0 → **Upgrade Jump**: Patch version with stability improvements

For complete MCP protocol documentation, see [Model Context Protocol](https://modelcontextprotocol.io/).

## Features

- Web scraping, crawling, and discovery
- Search and content extraction
- Deep research and batch scraping
- Automatic retries and rate limiting
- Cloud and self-hosted support
- SSE support

> Play around with [our MCP Server on MCP.so's playground](https://mcp.so/playground?server=firecrawl-mcp-server) or on [Klavis AI](https://www.klavis.ai/mcp-servers).

## Installation

### Running with npx

```bash
env FIRECRAWL_API_KEY=fc-YOUR_API_KEY npx -y firecrawl-mcp
```

### Manual Installation

```bash
npm install -g firecrawl-mcp
```

### Running with Docker

This fork includes a production-ready Docker setup with MCP protocol compliance. The wrapper script ensures clean stdio for JSON-RPC communication while maintaining comprehensive logging.

#### Prerequisites

- Docker and Docker Compose installed
- Firecrawl API key stored in `~/auth/.env`

#### Setup

1. Create the environment file:

```bash
# Create auth directory
mkdir -p ~/auth

# Add your API key to the environment file
echo "FIRECRAWL_API_KEY=fc-YOUR_API_KEY" > ~/auth/.env
```

2. Copy the wrapper script to your home directory:

```bash
cp run-firecrawl-mcp-server.sh ~/run-firecrawl-mcp-server.sh
chmod +x ~/run-firecrawl-mcp-server.sh
```

#### Usage

Run the MCP server:

```bash
~/run-firecrawl-mcp-server.sh
```

To force rebuild the Docker image:

```bash
~/run-firecrawl-mcp-server.sh --build
```

#### Features

- **Clean stdio**: All logs and errors redirected to log files, keeping stdout/stderr clean for MCP JSON-RPC
- **Log files**: Timestamped logs stored in `~/.firecrawl-mcp/logs/firecrawl-mcp-YYYYMMDD-HHMMSS.log`
- **Network isolation**: Container runs with `network_mode: "none"` for security
- **Graceful shutdown**: Proper signal handling (SIGTERM, SIGINT) with cleanup
- **Environment management**: Automatic loading from `~/auth/.env`

#### Configuration with Claude Desktop

To use the Docker version with Claude Desktop, add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "firecrawl-mcp-docker": {
      "command": "/home/YOUR_USERNAME/run-firecrawl-mcp-server.sh",
      "args": []
    }
  }
}
```

Replace `YOUR_USERNAME` with your actual username.

#### Troubleshooting

Check the latest log file for errors:

```bash
tail -f ~/.firecrawl-mcp/logs/firecrawl-mcp-*.log | tail -1
```

Or view all recent logs:

```bash
ls -lt ~/.firecrawl-mcp/logs/
```

### Running on Cursor

Configuring Cursor 🖥️
Note: Requires Cursor version 0.45.6+
For the most up-to-date configuration instructions, please refer to the official Cursor documentation on configuring MCP servers:
[Cursor MCP Server Configuration Guide](https://docs.cursor.com/context/model-context-protocol#configuring-mcp-servers)

To configure Firecrawl MCP in Cursor **v0.48.6**

1. Open Cursor Settings
2. Go to Features > MCP Servers
3. Click "+ Add new global MCP server"
4. Enter the following code:
   ```json
   {
     "mcpServers": {
       "firecrawl-mcp": {
         "command": "npx",
         "args": ["-y", "firecrawl-mcp"],
         "env": {
           "FIRECRAWL_API_KEY": "YOUR-API-KEY"
         }
       }
     }
   }
   ```

To configure Firecrawl MCP in Cursor **v0.45.6**

1. Open Cursor Settings
2. Go to Features > MCP Servers
3. Click "+ Add New MCP Server"
4. Enter the following:
   - Name: "firecrawl-mcp" (or your preferred name)
   - Type: "command"
   - Command: `env FIRECRAWL_API_KEY=your-api-key npx -y firecrawl-mcp`

> If you are using Windows and are running into issues, try `cmd /c "set FIRECRAWL_API_KEY=your-api-key && npx -y firecrawl-mcp"`

Replace `your-api-key` with your Firecrawl API key. If you don't have one yet, you can create an account and get it from https://www.firecrawl.dev/app/api-keys

After adding, refresh the MCP server list to see the new tools. The Composer Agent will automatically use Firecrawl MCP when appropriate, but you can explicitly request it by describing your web scraping needs. Access the Composer via Command+L (Mac), select "Agent" next to the submit button, and enter your query.

### Running on Windsurf

Add this to your `./codeium/windsurf/model_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Running with Streamable HTTP Local Mode

To run the server using Streamable HTTP locally instead of the default stdio transport:

```bash
env HTTP_STREAMABLE_SERVER=true FIRECRAWL_API_KEY=fc-YOUR_API_KEY npx -y firecrawl-mcp
```

Use the url: http://localhost:3000/mcp

### Installing via Smithery (Legacy)

To install Firecrawl for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@mendableai/mcp-server-firecrawl):

```bash
npx -y @smithery/cli install @mendableai/mcp-server-firecrawl --client claude
```

### Running on VS Code

For one-click installation, click one of the install buttons below...

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=firecrawl&inputs=%5B%7B%22type%22%3A%22promptString%22%2C%22id%22%3A%22apiKey%22%2C%22description%22%3A%22Firecrawl%20API%20Key%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22firecrawl-mcp%22%5D%2C%22env%22%3A%7B%22FIRECRAWL_API_KEY%22%3A%22%24%7Binput%3AapiKey%7D%22%7D%7D) [![Install with NPX in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-NPM-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=firecrawl&inputs=%5B%7B%22type%22%3A%22promptString%22%2C%22id%22%3A%22apiKey%22%2C%22description%22%3A%22Firecrawl%20API%20Key%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22firecrawl-mcp%22%5D%2C%22env%22%3A%7B%22FIRECRAWL_API_KEY%22%3A%22%24%7Binput%3AapiKey%7D%22%7D%7D&quality=insiders)

For manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open User Settings (JSON)`.

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "apiKey",
        "description": "Firecrawl API Key",
        "password": true
      }
    ],
    "servers": {
      "firecrawl": {
        "command": "npx",
        "args": ["-y", "firecrawl-mcp"],
        "env": {
          "FIRECRAWL_API_KEY": "${input:apiKey}"
        }
      }
    }
  }
}
```

Optionally, you can add it to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "apiKey",
      "description": "Firecrawl API Key",
      "password": true
    }
  ],
  "servers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${input:apiKey}"
      }
    }
  }
}
```

## Configuration

### Environment Variables

#### Required for Cloud API

- `FIRECRAWL_API_KEY`: Your Firecrawl API key
  - Required when using cloud API (default)
  - Optional when using self-hosted instance with `FIRECRAWL_API_URL`
- `FIRECRAWL_API_URL` (Optional): Custom API endpoint for self-hosted instances
  - Example: `https://firecrawl.your-domain.com`
  - If not provided, the cloud API will be used (requires API key)

#### Optional Configuration

##### Retry Configuration

- `FIRECRAWL_RETRY_MAX_ATTEMPTS`: Maximum number of retry attempts (default: 3)
- `FIRECRAWL_RETRY_INITIAL_DELAY`: Initial delay in milliseconds before first retry (default: 1000)
- `FIRECRAWL_RETRY_MAX_DELAY`: Maximum delay in milliseconds between retries (default: 10000)
- `FIRECRAWL_RETRY_BACKOFF_FACTOR`: Exponential backoff multiplier (default: 2)

##### Credit Usage Monitoring

- `FIRECRAWL_CREDIT_WARNING_THRESHOLD`: Credit usage warning threshold (default: 1000)
- `FIRECRAWL_CREDIT_CRITICAL_THRESHOLD`: Credit usage critical threshold (default: 100)

### Configuration Examples

For cloud API usage with custom retry and credit monitoring:

```bash
# Required for cloud API
export FIRECRAWL_API_KEY=your-api-key

# Optional retry configuration
export FIRECRAWL_RETRY_MAX_ATTEMPTS=5        # Increase max retry attempts
export FIRECRAWL_RETRY_INITIAL_DELAY=2000    # Start with 2s delay
export FIRECRAWL_RETRY_MAX_DELAY=30000       # Maximum 30s delay
export FIRECRAWL_RETRY_BACKOFF_FACTOR=3      # More aggressive backoff

# Optional credit monitoring
export FIRECRAWL_CREDIT_WARNING_THRESHOLD=2000    # Warning at 2000 credits
export FIRECRAWL_CREDIT_CRITICAL_THRESHOLD=500    # Critical at 500 credits
```

For self-hosted instance:

```bash
# Required for self-hosted
export FIRECRAWL_API_URL=https://firecrawl.your-domain.com

# Optional authentication for self-hosted
export FIRECRAWL_API_KEY=your-api-key  # If your instance requires auth

# Custom retry configuration
export FIRECRAWL_RETRY_MAX_ATTEMPTS=10
export FIRECRAWL_RETRY_INITIAL_DELAY=500     # Start with faster retries
```

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "YOUR_API_KEY_HERE",

        "FIRECRAWL_RETRY_MAX_ATTEMPTS": "5",
        "FIRECRAWL_RETRY_INITIAL_DELAY": "2000",
        "FIRECRAWL_RETRY_MAX_DELAY": "30000",
        "FIRECRAWL_RETRY_BACKOFF_FACTOR": "3",

        "FIRECRAWL_CREDIT_WARNING_THRESHOLD": "2000",
        "FIRECRAWL_CREDIT_CRITICAL_THRESHOLD": "500"
      }
    }
  }
}
```

### System Configuration

The server includes several configurable parameters that can be set via environment variables. Here are the default values if not configured:

```typescript
const CONFIG = {
  retry: {
    maxAttempts: 3, // Number of retry attempts for rate-limited requests
    initialDelay: 1000, // Initial delay before first retry (in milliseconds)
    maxDelay: 10000, // Maximum delay between retries (in milliseconds)
    backoffFactor: 2, // Multiplier for exponential backoff
  },
  credit: {
    warningThreshold: 1000, // Warn when credit usage reaches this level
    criticalThreshold: 100, // Critical alert when credit usage reaches this level
  },
};
```

These configurations control:

1. **Retry Behavior**

   - Automatically retries failed requests due to rate limits
   - Uses exponential backoff to avoid overwhelming the API
   - Example: With default settings, retries will be attempted at:
     - 1st retry: 1 second delay
     - 2nd retry: 2 seconds delay
     - 3rd retry: 4 seconds delay (capped at maxDelay)

2. **Credit Usage Monitoring**
   - Tracks API credit consumption for cloud API usage
   - Provides warnings at specified thresholds
   - Helps prevent unexpected service interruption
   - Example: With default settings:
     - Warning at 1000 credits remaining
     - Critical alert at 100 credits remaining

### Rate Limiting and Batch Processing

The server utilizes Firecrawl's built-in rate limiting and batch processing capabilities:

- Automatic rate limit handling with exponential backoff
- Efficient parallel processing for batch operations
- Smart request queuing and throttling
- Automatic retries for transient errors

## How to Choose a Tool

Use this guide to select the right tool for your task:

- **If you know the exact URL(s) you want:**
  - For one: use **scrape**
  - For many: use **batch_scrape**
- **If you need to discover URLs on a site:** use **map**
- **If you want to search the web for info:** use **search**
- **If you want to extract structured data:** use **extract**
- **If you want to analyze a whole site or section:** use **crawl** (with limits!)

### Quick Reference Table

| Tool         | Best for                            | Returns         |
| ------------ | ----------------------------------- | --------------- |
| scrape       | Single page content                 | markdown/html   |
| batch_scrape | Multiple known URLs                 | markdown/html[] |
| map          | Discovering URLs on a site          | URL[]           |
| crawl        | Multi-page extraction (with limits) | markdown/html[] |
| search       | Web search for info                 | results[]       |
| extract      | Structured data from pages          | JSON            |

## Available Tools

### 1. Scrape Tool (`firecrawl_scrape`)

Scrape content from a single URL with advanced options.

**Best for:**

- Single page content extraction, when you know exactly which page contains the information.

**Not recommended for:**

- Extracting content from multiple pages (use batch_scrape for known URLs, or map + batch_scrape to discover URLs first, or crawl for full page content)
- When you're unsure which page contains the information (use search)
- When you need structured data (use extract)

**Common mistakes:**

- Using scrape for a list of URLs (use batch_scrape instead).

**Prompt Example:**

> "Get the content of the page at https://example.com."

**Usage Example:**

```json
{
  "name": "firecrawl_scrape",
  "arguments": {
    "url": "https://example.com",
    "formats": ["markdown"],
    "onlyMainContent": true,
    "waitFor": 1000,
    "timeout": 30000,
    "mobile": false,
    "includeTags": ["article", "main"],
    "excludeTags": ["nav", "footer"],
    "skipTlsVerification": false
  }
}
```

**Returns:**

- Markdown, HTML, or other formats as specified.

### 2. Batch Scrape Tool (`firecrawl_batch_scrape`)

Scrape multiple URLs efficiently with built-in rate limiting and parallel processing.

**Best for:**

- Retrieving content from multiple pages, when you know exactly which pages to scrape.

**Not recommended for:**

- Discovering URLs (use map first if you don't know the URLs)
- Scraping a single page (use scrape)

**Common mistakes:**

- Using batch_scrape with too many URLs at once (may hit rate limits or token overflow)

**Prompt Example:**

> "Get the content of these three blog posts: [url1, url2, url3]."

**Usage Example:**

```json
{
  "name": "firecrawl_batch_scrape",
  "arguments": {
    "urls": ["https://example1.com", "https://example2.com"],
    "options": {
      "formats": ["markdown"],
      "onlyMainContent": true
    }
  }
}
```

**Returns:**

- Response includes operation ID for status checking:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Batch operation queued with ID: batch_1. Use firecrawl_check_batch_status to check progress."
    }
  ],
  "isError": false
}
```

### 3. Check Batch Status (`firecrawl_check_batch_status`)

Check the status of a batch operation.

```json
{
  "name": "firecrawl_check_batch_status",
  "arguments": {
    "id": "batch_1"
  }
}
```

### 4. Map Tool (`firecrawl_map`)

Map a website to discover all indexed URLs on the site.

**Best for:**

- Discovering URLs on a website before deciding what to scrape
- Finding specific sections of a website

**Not recommended for:**

- When you already know which specific URL you need (use scrape or batch_scrape)
- When you need the content of the pages (use scrape after mapping)

**Common mistakes:**

- Using crawl to discover URLs instead of map

**Prompt Example:**

> "List all URLs on example.com."

**Usage Example:**

```json
{
  "name": "firecrawl_map",
  "arguments": {
    "url": "https://example.com"
  }
}
```

**Returns:**

- Array of URLs found on the site

### 5. Search Tool (`firecrawl_search`)

Search the web and optionally extract content from search results.

**Best for:**

- Finding specific information across multiple websites, when you don't know which website has the information.
- When you need the most relevant content for a query

**Not recommended for:**

- When you already know which website to scrape (use scrape)
- When you need comprehensive coverage of a single website (use map or crawl)

**Common mistakes:**

- Using crawl or map for open-ended questions (use search instead)

**Usage Example:**

```json
{
  "name": "firecrawl_search",
  "arguments": {
    "query": "latest AI research papers 2023",
    "limit": 5,
    "lang": "en",
    "country": "us",
    "scrapeOptions": {
      "formats": ["markdown"],
      "onlyMainContent": true
    }
  }
}
```

**Returns:**

- Array of search results (with optional scraped content)

**Prompt Example:**

> "Find the latest research papers on AI published in 2023."

### 6. Crawl Tool (`firecrawl_crawl`)

Starts an asynchronous crawl job on a website and extract content from all pages.

**Best for:**

- Extracting content from multiple related pages, when you need comprehensive coverage.

**Not recommended for:**

- Extracting content from a single page (use scrape)
- When token limits are a concern (use map + batch_scrape)
- When you need fast results (crawling can be slow)

**Warning:** Crawl responses can be very large and may exceed token limits. Limit the crawl depth and number of pages, or use map + batch_scrape for better control.

**Common mistakes:**

- Setting limit or maxDepth too high (causes token overflow)
- Using crawl for a single page (use scrape instead)

**Prompt Example:**

> "Get all blog posts from the first two levels of example.com/blog."

**Usage Example:**

```json
{
  "name": "firecrawl_crawl",
  "arguments": {
    "url": "https://example.com/blog/*",
    "maxDepth": 2,
    "limit": 100,
    "allowExternalLinks": false,
    "deduplicateSimilarURLs": true
  }
}
```

**Returns:**

- Response includes operation ID for status checking:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Started crawl for: https://example.com/* with job ID: 550e8400-e29b-41d4-a716-446655440000. Use firecrawl_check_crawl_status to check progress."
    }
  ],
  "isError": false
}
```

### 7. Check Crawl Status (`firecrawl_check_crawl_status`)

Check the status of a crawl job.

```json
{
  "name": "firecrawl_check_crawl_status",
  "arguments": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Returns:**

- Response includes the status of the crawl job:

### 8. Extract Tool (`firecrawl_extract`)

Extract structured information from web pages using LLM capabilities. Supports both cloud AI and self-hosted LLM extraction.

**Best for:**

- Extracting specific structured data like prices, names, details.

**Not recommended for:**

- When you need the full content of a page (use scrape)
- When you're not looking for specific structured data

**Arguments:**

- `urls`: Array of URLs to extract information from
- `prompt`: Custom prompt for the LLM extraction
- `systemPrompt`: System prompt to guide the LLM
- `schema`: JSON schema for structured data extraction
- `allowExternalLinks`: Allow extraction from external links
- `enableWebSearch`: Enable web search for additional context
- `includeSubdomains`: Include subdomains in extraction

When using a self-hosted instance, the extraction will use your configured LLM. For cloud API, it uses Firecrawl's managed LLM service.
**Prompt Example:**

> "Extract the product name, price, and description from these product pages."

**Usage Example:**

```json
{
  "name": "firecrawl_extract",
  "arguments": {
    "urls": ["https://example.com/page1", "https://example.com/page2"],
    "prompt": "Extract product information including name, price, and description",
    "systemPrompt": "You are a helpful assistant that extracts product information",
    "schema": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "price": { "type": "number" },
        "description": { "type": "string" }
      },
      "required": ["name", "price"]
    },
    "allowExternalLinks": false,
    "enableWebSearch": false,
    "includeSubdomains": false
  }
}
```

**Returns:**

- Extracted structured data as defined by your schema

```json
{
  "content": [
    {
      "type": "text",
      "text": {
        "name": "Example Product",
        "price": 99.99,
        "description": "This is an example product description"
      }
    }
  ],
  "isError": false
}
```

## Logging System

The server includes comprehensive logging:

- Operation status and progress
- Performance metrics
- Credit usage monitoring
- Rate limit tracking
- Error conditions

Example log messages:

```
[INFO] Firecrawl MCP Server initialized successfully
[INFO] Starting scrape for URL: https://example.com
[INFO] Batch operation queued with ID: batch_1
[WARNING] Credit usage has reached warning threshold
[ERROR] Rate limit exceeded, retrying in 2s...
```

## Error Handling

The server provides robust error handling:

- Automatic retries for transient errors
- Rate limit handling with backoff
- Detailed error messages
- Credit usage warnings
- Network resilience

Example error response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Rate limit exceeded. Retrying in 2 seconds..."
    }
  ],
  "isError": true
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

### Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test`
4. Submit a pull request

### Thanks to contributors

Thanks to [@vrknetha](https://github.com/vrknetha), [@cawstudios](https://caw.tech) for the initial implementation!

Thanks to MCP.so and Klavis AI for hosting and [@gstarwd](https://github.com/gstarwd), [@xiangkaiz](https://github.com/xiangkaiz) and [@zihaolin96](https://github.com/zihaolin96) for integrating our server.

## License

MIT License - see LICENSE file for details
