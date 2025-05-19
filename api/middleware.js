import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Simple rate limiting middleware
export async function middleware(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const path = request.nextUrl.pathname;
  
  // Only apply rate limiting to API routes
  if (path.startsWith('/api/')) {
    const rateLimitKey = `ratelimit:${ip}:${path}`;
    
    // Get current count
    const currentCount = await kv.get(rateLimitKey) || 0;
    
    // If over limit, return 429
    if (currentCount > 10) { // 10 requests per minute
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
        },
      });
    }
    
    // Increment count and set expiry
    await kv.incr(rateLimitKey);
    await kv.expire(rateLimitKey, 60); // 1 minute expiry
    
    // Continue with the request
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};