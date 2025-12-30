import { NextRequest, NextResponse } from 'next/server';
import { generateBookSummary, generateProgressSummary } from '@/lib/ai-summary';

export async function POST(request: NextRequest) {
    try {
        const { bookTitle, author, currentPage, totalPages, type } = await request.json();

        if (!bookTitle || !author) {
            return NextResponse.json(
                { error: 'Book title and author are required' },
                { status: 400 }
            );
        }

        let summary: string;

        if (type === 'full') {
            // Genel özet
            summary = await generateBookSummary(bookTitle, author);
        } else {
            // Okunan kısma kadar özet
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
            { error: 'Failed to generate summary' },
            { status: 500 }
        );
    }
}
