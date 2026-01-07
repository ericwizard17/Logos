import { NextRequest, NextResponse } from 'next/server';
import { summaryRequestSchema, validate } from '@/lib/validation';

// Rate limiting: Simple in-memory store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);
    
    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitStore.set(identifier, { count: 1, timestamp: now });
        return true;
    }
    
    if (record.count >= MAX_REQUESTS) {
        return false;
    }
    
    record.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
        
        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        // Validate input with Zod schema
        const validation = validate(summaryRequestSchema, body);
        
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const { bookTitle, author, currentPage, totalPages, type } = validation.data;

        // Dynamically import to ensure no build-time side effects
        const aiSummary = await import('@/lib/ai-summary');

        // Check for client availability runtime
        const client = await aiSummary.getOpenAIClient();
        if (!client) {
            return NextResponse.json({
                summary: 'AI summaries are currently unavailable. Please configure OPENAI_API_KEY in your deployment environment.'
            });
        }

        let summary: string;

        if (type === 'full') {
            summary = await aiSummary.generateBookSummary(bookTitle, author);
        } else {
            if (currentPage === undefined || totalPages === undefined) {
                return NextResponse.json(
                    { error: 'Current page and total pages are required for progress summary' },
                    { status: 400 }
                );
            }
            summary = await aiSummary.generateProgressSummary(bookTitle, author, currentPage, totalPages);
        }

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('Error in summary API:', error);
        return NextResponse.json(
            { summary: 'Unable to generate summary at this time.' },
            { status: 200 } // Return 200 with error message to fail gracefully in UI
        );
    }
}
