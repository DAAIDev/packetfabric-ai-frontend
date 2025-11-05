import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Cloud Run and monitoring
 * Returns 200 OK if the service is healthy
 */
export async function GET() {
  try {
    // Basic health check - can be extended with database/dependency checks
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown',
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

// Also support HEAD requests for simple health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
