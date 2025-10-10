# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **enhanced fork** of the official Firecrawl MCP Server that provides web scraping capabilities via the Model Context Protocol (MCP). The fork adds Docker support, enhanced parameter descriptions, and production-ready deployment infrastructure.

**Key Fork Enhancements:**
- Enhanced parameter descriptions (72+ parameters with detailed descriptions in source code)
- Docker containerization with MCP-compliant wrapper script
- HTTP transport support on port 10777 with HTTP-to-stdio bridge
- Clean stdio handling for JSON-RPC communication
- Comprehensive logging infrastructure
- Latest Firecrawl dependencies (firecrawl-fastmcp 1.0.3, @mendable/firecrawl-js 4.3.6)

**Zod v4 Compatibility**: Cannot upgrade to Zod v4 due to `@modelcontextprotocol/sdk` incompatibility (tracked in issues #555, #1429). Current Zod v3.25.76 works perfectly with full parameter description support. See "Zod v4 Upgrade Investigation" section below for details.

**Upstream Repository:** https://github.com/firecrawl/firecrawl-mcp-server

## Development Commands

### Build and Test
```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Run tests
npm test

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format
```

### Running the Server

```bash
# Run locally with stdio transport (default for MCP clients like Claude Desktop)
npm start

# Run with HTTP streamable transport (for testing/debugging)
env HTTP_STREAMABLE_SERVER=true FIRECRAWL_API_KEY=fc-YOUR_API_KEY npm start

# Run cloud service mode (requires authentication)
npm run start:cloud
```

### Docker Deployment (stdio)

```bash
# Build Docker image
docker compose build firecrawl-mcp

# Run via wrapper script (recommended for MCP clients)
~/run-firecrawl-mcp-server.sh

# Force rebuild
~/run-firecrawl-mcp-server.sh --build

# Check logs
tail -f ~/.firecrawl-mcp/logs/firecrawl-mcp-*.log
```

### Docker HTTP Deployment

The server supports HTTP transport mode for remote access, web clients, and testing.

**Port:** 10777 (host) → 10777 (container)
**Endpoint:** `http://localhost:10777/mcp`
**Health Check:** `http://localhost:10777/health`

```bash
# Build Docker image (same as stdio)
docker compose build firecrawl-mcp

# Start HTTP service
cd /home/bryan/mcp-servers/firecrawl-mcp-server
docker compose -f docker-compose.http.yml up -d

# Check status
~/firecrawl-http-info.sh

# Test health endpoint
curl http://localhost:10777/health

# View logs
docker compose -f docker-compose.http.yml logs -f

# Stop HTTP service
docker compose -f docker-compose.http.yml down
```

**MCP Client Configuration (HTTP-to-stdio Bridge):**
```json
{
  "mcpServers": {
    "firecrawl-http": {
      "command": "/home/bryan/run-firecrawl-http.sh"
    }
  }
}
```

**MCP Client Configuration (Direct HTTP):**
```json
{
  "mcpServers": {
    "firecrawl-http": {
      "url": "http://localhost:10777/mcp",
      "headers": {
        "x-firecrawl-api-key": "fc-YOUR_API_KEY"
      }
    }
  }
}
```

**Key Files:**
- `docker-compose.http.yml` - HTTP service configuration
- `~/run-firecrawl-http.sh` - HTTP-to-stdio bridge wrapper
- `~/firecrawl-http-info.sh` - Status and configuration utility

**Bridge Wrapper Features:**
- Clean stdio protocol compliance
- Session state management
- SSE response parsing
- Error handling and logging
- Based on proven patterns from Context7, Qdrant, and Memory MCP implementations

## Architecture

### Core Components

**src/index.ts** - Main server implementation
- FastMCP server setup with authentication
- 6 MCP tools: scrape, map, search, crawl, check_crawl_status, extract
- Transport modes: stdio (default) or HTTP streamable
- Session-based API key management
- SAFE_MODE for cloud deployments (disables interactive actions)

**Key Classes:**
- `ConsoleLogger` - Conditional logging based on deployment mode
- `SessionData` - Session state with API key storage
- `createClient()` - Firecrawl client factory supporting cloud and self-hosted

**Schema Architecture:**
- `scrapeParamsSchema` - Centralized scraping parameters shared across tools
- Conditional schemas based on SAFE_MODE (read-only vs full automation)
- Comprehensive `.describe()` annotations for AI agent understanding

### Transport Modes

The server supports two transport types controlled by environment variables:

1. **stdio** (default): For MCP clients (Claude Desktop, Cursor, VS Code)
   - Clean JSON-RPC over stdin/stdout
   - No logging to stdout/stderr (pollution prevention)
   - Logs redirected to files in Docker mode

2. **HTTP streamable**: For testing and cloud deployments
   - Enabled via `HTTP_STREAMABLE_SERVER=true` or `CLOUD_SERVICE=true`
   - SSE (Server-Sent Events) support
   - Runs on port 3000 (configurable via PORT env var)

### Docker Architecture

**Dockerfile** - Multi-stage build
- Builder stage: Node 22-alpine, installs deps, builds TypeScript
- Release stage: Node 22-slim, production deps only
- Entrypoint: `node dist/index.js`

**Wrapper Script** (`~/run-firecrawl-mcp-server.sh`)
- MCP protocol compliance: Clean stdio for JSON-RPC
- Environment management: Loads from `~/auth/.env`
- Graceful shutdown: Signal traps (SIGTERM, SIGINT)
- Logging: All output → `~/.firecrawl-mcp/logs/`
- Container lifecycle: Auto-build, status checks, restart handling

## MCP Tools

The server implements 6 Firecrawl tools:

1. **firecrawl_scrape** - Single URL content extraction
2. **firecrawl_map** - Discover all URLs on a site
3. **firecrawl_search** - Web search with optional content scraping
4. **firecrawl_crawl** - Multi-page crawling (async job)
5. **firecrawl_check_crawl_status** - Check crawl job progress
6. **firecrawl_extract** - LLM-powered structured data extraction

**Tool Selection Guidelines:**
- Known single URL → use `scrape`
- Known multiple URLs → use `batch_scrape` (if available) or multiple `scrape` calls
- Discover URLs → use `map`
- Open-ended web search → use `search`
- Structured data → use `extract`
- Full site crawl → use `crawl` (with low limits to avoid token overflow)

## Environment Variables

### Required (Cloud API)
- `FIRECRAWL_API_KEY` - Your Firecrawl API key

### Optional
- `FIRECRAWL_API_URL` - Custom API endpoint for self-hosted instances
- `CLOUD_SERVICE` - Set to 'true' for cloud deployment mode (enables SAFE_MODE, HTTP transport)
- `HTTP_STREAMABLE_SERVER` - Set to 'true' for local HTTP testing
- `SSE_LOCAL` - Set to 'true' for SSE transport
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: localhost, 0.0.0.0 for cloud)

### Retry Configuration
- `FIRECRAWL_RETRY_MAX_ATTEMPTS` - Max retries (default: 3)
- `FIRECRAWL_RETRY_INITIAL_DELAY` - Initial delay ms (default: 1000)
- `FIRECRAWL_RETRY_MAX_DELAY` - Max delay ms (default: 10000)
- `FIRECRAWL_RETRY_BACKOFF_FACTOR` - Exponential backoff (default: 2)

### Credit Monitoring
- `FIRECRAWL_CREDIT_WARNING_THRESHOLD` - Warning level (default: 1000)
- `FIRECRAWL_CREDIT_CRITICAL_THRESHOLD` - Critical level (default: 100)

## Key Implementation Details

### SAFE_MODE
- Enabled when `CLOUD_SERVICE=true` (for ChatGPT compliance)
- Restricts actions to read-only: `['wait', 'screenshot', 'scroll', 'scrape']`
- Disables interactive actions: `['click', 'write', 'press', 'executeJavascript', 'generatePDF']`
- Removes webhook support in crawl tool

### Session Authentication
- Cloud mode: Extracts API key from headers (`Authorization: Bearer`, `x-firecrawl-api-key`, `x-api-key`)
- Self-hosted mode: Uses `FIRECRAWL_API_KEY` from env, optional if `FIRECRAWL_API_URL` set
- API key stored in session data per-connection

### Utility Functions
- `removeEmptyTopLevel()` - Strips undefined/empty/null params before API calls
- `asText()` - Formats responses as JSON strings (pretty-printed)
- `extractApiKey()` - Header parsing for authentication

## Testing

### Test Files
- `test-endpoints.js` - Manual endpoint testing script
- `jest.setup.ts` - Jest configuration

### Running Tests
```bash
npm test                 # Run test suite
npm run test:endpoints   # Test individual endpoints
```

## Validation and Documentation

**VALIDATION.md** - Comprehensive validation of all fork claims
- Evidence-based verification of features
- Attribution of upstream Firecrawl features
- Validation reports in `validation-reports/`

**PARAMETER_DESCRIPTIONS.md** - Technical guide to enhanced parameter descriptions
- Documentation of all 72+ parameter descriptions
- Patterns and examples for parameter documentation

### Zod v4 Upgrade Investigation

**Status**: ❌ Cannot upgrade - MCP SDK incompatible with Zod v4 (as of 2025-10-10)

**Investigation Date**: 2025-10-10

**Finding**: Zod v3.25.76 works perfectly with full parameter description support. The previous documentation claiming "parameter descriptions don't appear" was incorrect.

#### Current State (Zod v3.25.76)
- ✅ **Parameter descriptions WORK** - All 72 `.describe()` annotations appear in JSON Schema
- ✅ Tool-level descriptions (fully functional and comprehensive)
- ✅ All parameter types, formats, enums, validation rules
- ✅ Both stdio and HTTP transports functional
- ✅ Runtime validation works correctly

**Example Output** (Zod v3):
```json
{
  "url": {
    "type": "string",
    "format": "uri",
    "description": "The URL to scrape content from. Must be a valid HTTP/HTTPS URL"
  }
}
```

#### Zod v4 Upgrade Attempt Results

**What We Tried**:
1. ✅ Added `"zod": "^4.1.5"` to dependencies
2. ✅ Used npm `overrides` to force Zod v4.1.12 globally
3. ✅ Verified all dependencies use Zod v4 (deduped correctly)
4. ✅ tools/list works - JSON Schema generation successful
5. ❌ **Runtime fails** - tools/call throws `"Cannot read properties of undefined (reading '_zod')"`

**Root Cause**:
- `@modelcontextprotocol/sdk@1.20.0` is **incompatible** with Zod v4
- Zod v4 changed internal API structure (`._def` → `._zod.def`, `._parse` method changes)
- MCP SDK v1.17.5+ expects Zod v3 internal APIs
- Tracked in GitHub issues:
  - modelcontextprotocol/typescript-sdk#555
  - modelcontextprotocol/modelcontextprotocol#1429

**Attempted Workarounds**:
- ❌ npm overrides with `@alcyone-labs/zod-to-json-schema@4.0.10` - syntax not supported
- ❌ Direct dependency on alcyone-labs fork - dependencies still require original package
- ❌ Manual patching - would require forking `firecrawl-fastmcp` and `@modelcontextprotocol/sdk`

**Zod v4 Benefits (if we could upgrade)**:
- ✅ Native `z.toJSONSchema()` method (eliminate `zod-to-json-schema` dependency)
- ✅ Better TypeScript inference
- ✅ Improved error messages
- ❌ **But descriptions already work in v3, so no benefit for our use case**

**Conclusion**:
- **Stay on Zod v3** until MCP SDK adds v4 support
- Current implementation is fully functional - no urgent need to upgrade
- Monitor MCP SDK issues for v4 compatibility updates

**Testing Commands**:
```bash
# Verify parameter descriptions (works with v3) ✅
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | npm start 2>&1 | \
  jq '.result.tools[0].inputSchema.properties.url'

# Source code verification ✅
grep -c '\.describe(' src/index.ts  # Returns: 72

# Dependency tree check
npm list zod  # All should use v3.25.76
```

**Key Validation Reports:**
- `docker-stdio-compliance.md` - MCP protocol compliance verification
- `logging-infrastructure.md` - Logging system validation
- `wrapper-script-validation.md` - Docker wrapper script validation
- `dependency-updates.md` - Dependency change tracking

## Code Style

- TypeScript strict mode enabled
- ES2022 target, NodeNext modules
- ESM (ES Modules) throughout
- Zod for schema validation with `.describe()` annotations
- Functional style with utility functions

## Important Notes

### When Adding New Tools
1. Define Zod schema with comprehensive `.describe()` annotations
2. Add tool via `server.addTool()`
3. Include usage examples in description
4. Document in README.md "Available Tools" section
5. Consider SAFE_MODE restrictions if applicable

### When Updating Dependencies
1. Test with both stdio and HTTP transports
2. Verify MCP protocol compliance (stdio clean)
3. Update version in package.json
4. Document changes in CHANGELOG.md
5. Create validation report if performance/feature claims made

### When Modifying Docker Setup
1. Test wrapper script with MCP client (Claude Desktop)
2. Verify stdio remains clean (no pollution)
3. Check log file creation and permissions
4. Test graceful shutdown (SIGTERM/SIGINT)
5. Update docker-stdio-compliance.md if protocol changes

### Attribution
- Performance features (caching, rate limiting) → Firecrawl library
- Batch processing → Firecrawl JS client
- Always credit upstream features when documenting

## TypeScript Configuration

- Module: NodeNext (ESM)
- Target: ES2022
- Output: `dist/`
- Source: `src/`
- Strict mode: enabled
- Skip lib check: true
