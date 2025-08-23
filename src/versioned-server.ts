#!/usr/bin/env node

import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createV1Server } from './server-v1.js';
import { createV2Server } from './server-v2.js';

dotenv.config();

interface VersionedTransport {
  transport: SSEServerTransport;
  version: 'v1' | 'v2';
}

export async function runVersionedSSECloudServer() {
  const transports: { [sessionId: string]: VersionedTransport } = {};
  const app = express();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      versions: ['v1', 'v2'],
      endpoints: {
        v1: '/:apiKey/sse',
        v2: '/:apiKey/v2/sse'
      }
    });
  });

  // Create server instances
  const v1Server = createV1Server();
  const v2Server = createV2Server();

  // V1 SSE endpoint (legacy)
  app.get('/:apiKey/sse', async (req, res) => {
    const apiKey = req.params.apiKey;
    const transport = new SSEServerTransport(`/${apiKey}/messages`, res);

    console.log(`[V1] New SSE connection for API key: ${apiKey}`);
    
    const compositeKey = `${apiKey}-${transport.sessionId}`;
    transports[compositeKey] = { transport, version: 'v1' };
    
    res.on('close', () => {
      console.log(`[V1] SSE connection closed for: ${compositeKey}`);
      delete transports[compositeKey];
    });
    
    await v1Server.connect(transport);
  });

  // V2 SSE endpoint (new)
  app.get('/:apiKey/v2/sse', async (req, res) => {
    const apiKey = req.params.apiKey;
    const transport = new SSEServerTransport(`/${apiKey}/v2/messages`, res);

    console.log(`[V2] New SSE connection for API key: ${apiKey}`);
    
    const compositeKey = `${apiKey}-${transport.sessionId}`;
    transports[compositeKey] = { transport, version: 'v2' };
    
    res.on('close', () => {
      console.log(`[V2] SSE connection closed for: ${compositeKey}`);
      delete transports[compositeKey];
    });
    
    await v2Server.connect(transport);
  });

  // V1 message endpoint (legacy)
  app.post(
    '/:apiKey/messages',
    express.json(),
    async (req: Request, res: Response) => {
      const apiKey = req.params.apiKey;
      const body = req.body;
      
      // Enrich the body with API key metadata
      const enrichedBody = {
        ...body,
      };

      if (enrichedBody && enrichedBody.params && !enrichedBody.params._meta) {
        enrichedBody.params._meta = { apiKey };
      } else if (
        enrichedBody &&
        enrichedBody.params &&
        enrichedBody.params._meta
      ) {
        enrichedBody.params._meta.apiKey = apiKey;
      }

      console.log(`[V1] Message received for API key: ${apiKey}`);

      const sessionId = req.query.sessionId as string;
      const compositeKey = `${apiKey}-${sessionId}`;
      const versionedTransport = transports[compositeKey];
      
      if (versionedTransport && versionedTransport.version === 'v1') {
        await versionedTransport.transport.handlePostMessage(req, res, enrichedBody);
      } else {
        console.error(`[V1] No transport found for sessionId: ${compositeKey}`);
        res.status(400).json({ 
          error: 'No V1 transport found for sessionId',
          sessionId: compositeKey,
          availableTransports: Object.keys(transports)
        });
      }
    }
  );

  // V2 message endpoint (new)
  app.post(
    '/:apiKey/v2/messages',
    express.json(),
    async (req: Request, res: Response) => {
      const apiKey = req.params.apiKey;
      const body = req.body;
      
      // Enrich the body with API key metadata
      const enrichedBody = {
        ...body,
      };

      if (enrichedBody && enrichedBody.params && !enrichedBody.params._meta) {
        enrichedBody.params._meta = { apiKey };
      } else if (
        enrichedBody &&
        enrichedBody.params &&
        enrichedBody.params._meta
      ) {
        enrichedBody.params._meta.apiKey = apiKey;
      }

      console.log(`[V2] Message received for API key: ${apiKey}`);

      const sessionId = req.query.sessionId as string;
      const compositeKey = `${apiKey}-${sessionId}`;
      const versionedTransport = transports[compositeKey];
      
      if (versionedTransport && versionedTransport.version === 'v2') {
        await versionedTransport.transport.handlePostMessage(req, res, enrichedBody);
      } else {
        console.error(`[V2] No transport found for sessionId: ${compositeKey}`);
        res.status(400).json({ 
          error: 'No V2 transport found for sessionId',
          sessionId: compositeKey,
          availableTransports: Object.keys(transports)
        });
      }
    }
  );

  // Catch-all for unsupported endpoints
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      supportedEndpoints: {
        health: '/health',
        v1: {
          sse: '/:apiKey/sse',
          messages: '/:apiKey/messages'
        },
        v2: {
          sse: '/:apiKey/v2/sse',
          messages: '/:apiKey/v2/messages'
        }
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Versioned MCP SSE Server listening on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   V1 SSE: http://localhost:${PORT}/:apiKey/sse`);
    console.log(`   V1 Messages: http://localhost:${PORT}/:apiKey/messages`);
    console.log(`   V2 SSE: http://localhost:${PORT}/:apiKey/v2/sse`);
    console.log(`   V2 Messages: http://localhost:${PORT}/:apiKey/v2/messages`);
    console.log('');
    console.log('🔧 Versions:');
    console.log('   V1: Firecrawl JS 1.29.3 (legacy tools + deep research + llms.txt)');
    console.log('   V2: Firecrawl JS 3.1.0 (modern API + JSON extraction)');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    console.log(`📊 Active connections: ${Object.keys(transports).length}`);
    
    // Close all transports
    for (const [key, versionedTransport] of Object.entries(transports)) {
      try {
        console.log(`🔌 Closing transport: ${key} (${versionedTransport.version})`);
        // Note: SSEServerTransport doesn't have a close method, connections will close naturally
        delete transports[key];
      } catch (error) {
        console.error(`❌ Error closing transport ${key}:`, error);
      }
    }
    
    console.log('✅ Server shutdown complete');
    process.exit(0);
  });
}
