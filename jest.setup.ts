import { jest } from '@jest/globals';
import Firecrawl from '@mendable/firecrawl-js';
type SearchResponse = any;
type BatchScrapeResponse = any;
type BatchScrapeStatusResponse = any;
type FirecrawlDocument = any;

// Set test timeout
jest.setTimeout(30000);

// Create mock responses
const mockSearchResponse: SearchResponse = {
  data: [
    {
      url: 'https://example.com',
      title: 'Test Page',
      description: 'Test Description',
      markdown: '# Test Content',
      actions: null as never,
    },
  ] as any[],
};

const mockBatchScrapeResponse: BatchScrapeResponse = {
  id: 'test-batch-id',
};

const mockBatchStatusResponse: BatchScrapeStatusResponse = {
  status: 'completed',
  completed: 1,
  total: 1,
  creditsUsed: 1,
  expiresAt: new Date(),
  data: [
    {
      url: 'https://example.com',
      title: 'Test Page',
      description: 'Test Description',
      markdown: '# Test Content',
      actions: null as never,
    },
  ] as any[],
};

// Create mock instance methods
const mockSearch = jest.fn().mockImplementation(async () => mockSearchResponse);
const mockStartBatchScrape = jest
  .fn()
  .mockImplementation(async () => mockBatchScrapeResponse);
const mockGetBatchScrapeStatus = jest
  .fn()
  .mockImplementation(async () => mockBatchStatusResponse);

// Create mock instance
const mockInstance = {
  apiKey: 'test-api-key',
  apiUrl: 'test-api-url',
  search: mockSearch,
  startBatchScrape: mockStartBatchScrape,
  getBatchScrapeStatus: mockGetBatchScrapeStatus,
};

// Mock the module
jest.mock('@mendable/firecrawl-js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockInstance),
}));
