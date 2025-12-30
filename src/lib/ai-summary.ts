import OpenAI from 'openai';

// Make OpenAI optional - won't break build if API key is missing
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export async function generateBookSummary(bookTitle: string, author: string): Promise<string> {
    if (!openai) {
        return 'AI summaries are currently unavailable. Please configure OPENAI_API_KEY.';
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a literary scholar who provides concise, insightful summaries of books. Focus on main themes, key arguments, and philosophical insights.',
                },
                {
                    role: 'user',
                    content: `Provide a comprehensive summary of "${bookTitle}" by ${author}. Include:
1. Main themes and central arguments
2. Key philosophical or intellectual contributions
3. Historical context and significance
4. Core ideas that readers should understand

Keep it concise but informative (200-300 words).`,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0].message.content || 'Summary unavailable.';
    } catch (error) {
        console.error('Error generating book summary:', error);
        return 'Unable to generate summary at this time.';
    }
}

export async function generateProgressSummary(
    bookTitle: string,
    author: string,
    currentPage: number,
    totalPages: number
): Promise<string> {
    if (!openai) {
        return 'AI summaries are currently unavailable. Please configure OPENAI_API_KEY.';
    }

    try {
        const percentage = Math.round((currentPage / totalPages) * 100);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a literary guide helping readers understand what they have read so far in a book.',
                },
                {
                    role: 'user',
                    content: `A reader is at page ${currentPage} of ${totalPages} (${percentage}%) in "${bookTitle}" by ${author}.

Provide a summary of what typically happens in the first ${percentage}% of this book:
1. Key events or arguments covered so far
2. Important concepts introduced
3. What the reader should have understood by this point

Keep it concise (150-200 words) and avoid spoilers beyond this point.`,
                },
            ],
            temperature: 0.7,
            max_tokens: 400,
        });

        return response.choices[0].message.content || 'Summary unavailable.';
    } catch (error) {
        console.error('Error generating progress summary:', error);
        return 'Unable to generate summary at this time.';
    }
}
