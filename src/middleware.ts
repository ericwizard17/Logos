import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Temporarily disabled for debugging
    return NextResponse.next();
}

export const config = {
    matcher: ['/invite', '/library/:path*', '/profile/:path*'],
};
