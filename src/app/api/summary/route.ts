import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Check if OpenAI is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                summary: 'AI summaries are currently unavailable. Please configure OPENAI_API_KEY in your environment variables.'
            });
        }

        const { generateBookSummary, generateProgressSummary } = await import('@/lib/ai-summary');
        const { bookTitle, author, currentPage, totalPages, type } = await request.json();

        if (!bookTitle || !author) {
            return NextResponse.json(
                { error: 'Book title and author are required' },
                { status: 400 }
            );
        }

        let summary: string;

        if (type === 'full') {
            summary = await generateBookSummary(bookTitle, author);
        } else {
            if (!currentPage || !totalPages) {
                return NextResponse.json(
                    { error: 'Current page and total pages are required for progress summary' },
                    { status: 400 }
                );
            }
            summary = await generateProgressSummary(bookTitle, author, currentPage, totalPages);
        }

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('Error in summary API:', error);
        return NextResponse.json(
            { summary: 'Unable to generate summary at this time.' },
            { status: 200 }
        );
    }
}
