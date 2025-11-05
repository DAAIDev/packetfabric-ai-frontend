import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://chun-pentatomic-nonspeculatively.ngrok-free.dev/webhook/ask';

export async function POST(req: NextRequest) {
  try {
    console.log('[API Route] Starting request...');
    console.log('[API Route] N8N_WEBHOOK_URL:', N8N_WEBHOOK_URL);

    // TODO: Add authentication after meeting with Vlad
    // For now, allow all requests in development
    if (process.env.NODE_ENV !== 'production') {
      // Development bypass - proceed with request
    }

    const body = await req.json();
    const { query } = body;

    console.log('[API Route] Received query:', query);

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('[API Route] Calling n8n webhook at:', N8N_WEBHOOK_URL);
    console.log('[API Route] Request body:', JSON.stringify({ query }));

    // Call n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    console.log('[API Route] n8n webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] n8n webhook error response:', errorText);
      throw new Error(`n8n webhook error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[API Route] n8n webhook response data:', JSON.stringify(data).substring(0, 200));

    // n8n already returns formatted response, so just pass it through
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error details:', error);
    console.error('[API Route] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[API Route] Error message:', error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: 'Internal server error',
        answer: 'Sorry, I encountered an error processing your request. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : String(error),
          webhookUrl: N8N_WEBHOOK_URL
        } : undefined
      },
      { status: 500 }
    );
  }
}
