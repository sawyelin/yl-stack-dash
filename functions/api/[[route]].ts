import { D1Database } from '@cloudflare/workers-types';
import type { PagesFunction, Response as WorkerResponse } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

interface RequestBody {
  query: string;
  params: any[];
}

// Helper function to create a properly typed Response
function createResponse(body: any, status = 200, headers: Record<string, string> = {}): WorkerResponse {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    ...headers
  };

  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: defaultHeaders,
  }) as unknown as WorkerResponse;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const route = url.pathname.split('/api/')[1];

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return createResponse(null, 200, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
  }

  try {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return createResponse('Method not allowed', 405);
    }

    const body = await request.json() as RequestBody;
    const { query, params } = body;

    switch (route) {
      case 'query':
        // Execute read-only queries
        const results = await env.DB.prepare(query).bind(...(params || [])).all();
        return createResponse({ results: results.results });

      case 'execute':
        // Execute write operations
        const statement = env.DB.prepare(query);
        if (params && params.length > 0) {
          await statement.bind(...params).run();
        } else {
          await statement.run();
        }
        return createResponse({ success: true });

      default:
        return createResponse('Not found', 404);
    }
  } catch (error) {
    console.error('Database error:', error);
    return createResponse({ error: 'Database operation failed' }, 500);
  }
}; 