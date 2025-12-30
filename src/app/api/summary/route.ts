import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Dynamically import to ensure no build-time side effects
        const aiSummary = await import('@/lib/ai-summary');

        // Check for client availability runtime
        const client = await aiSummary.getOpenAIClient();
        if (!client) {
            return NextResponse.json({
                summary: 'AI summaries are currently unavailable. Please configure OPENAI_API_KEY in your deployment environment.'
            });
        }

        const { bookTitle, author, currentPage, totalPages, type } = await request.json();

        if (!bookTitle || !author) {
            return NextResponse.json(
                { error: 'Book title and author are required' },
                { status: 400 }
            );
        }

        let summary: string;

        if (type === 'full') {
            summary = await aiSummary.generateBookSummary(bookTitle, author);
        } else {
            if (!currentPage || !totalPages) {
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
