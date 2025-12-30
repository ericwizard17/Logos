// Google Books API integration
export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        pageCount?: number;
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        description?: string;
        industryIdentifiers?: Array<{
            type: string;
            identifier: string;
        }>;
        language?: string;
        categories?: string[];
        publisher?: string;
        publishedDate?: string;
    };
}

export async function searchGoogleBooks(query: string, maxResults: number = 10): Promise<any[]> {
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=en`
        );
        const data = await response.json();

        if (!data.items) return [];

        return data.items.map((item: GoogleBook) => ({
            id: item.id,
            title: item.volumeInfo.title || 'Unknown Title',
            authors: item.volumeInfo.authors || ['Unknown Author'],
            pageCount: item.volumeInfo.pageCount || 0,
            thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            description: item.volumeInfo.description,
            isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
            language: item.volumeInfo.language || 'en',
            category: item.volumeInfo.categories?.[0],
            publisher: item.volumeInfo.publisher,
            publishedDate: item.volumeInfo.publishedDate,
        }));
    } catch (error) {
        console.error('Error fetching from Google Books:', error);
        return [];
    }
}

export async function searchBooksByCategory(
    category: string,
    language: string = 'eng',
    limit: number = 50
): Promise<any[]> {
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(category)}&langRestrict=${language}&maxResults=${limit}`
        );
        const data = await response.json();

        if (!data.items) return [];

        return data.items.map((item: GoogleBook) => ({
            id: item.id,
            title: item.volumeInfo.title || 'Unknown Title',
            authors: item.volumeInfo.authors || ['Unknown Author'],
            pageCount: item.volumeInfo.pageCount || 0,
            thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            description: item.volumeInfo.description,
            isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
            language: item.volumeInfo.language || language,
            category: category,
            publisher: item.volumeInfo.publisher,
            publishedDate: item.volumeInfo.publishedDate,
        }));
    } catch (error) {
        console.error('Error fetching books by category:', error);
        return [];
    }
}

// Keep existing Open Library functions
export interface Book {
    id: string;
    title: string;
    authors: string[];
    pageCount: number;
    thumbnail: string;
    description?: string;
    isbn?: string;
    language?: string;
    category?: string;
    publisher?: string;
    publishedDate?: string;
}

export async function searchBooks(query: string, limit: number = 10): Promise<Book[]> {
    // Use Google Books as primary, fallback to Open Library
    const googleResults = await searchGoogleBooks(query, limit);
    if (googleResults.length > 0) return googleResults;

    // Fallback to Open Library
    try {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i,isbn,language,subject,publisher`
        );
        const data = await response.json();

        return data.docs.map((doc: any) => ({
            id: doc.key?.replace('/works/', '') || '',
            title: doc.title || 'Unknown Title',
            authors: doc.author_name || ['Unknown Author'],
            pageCount: doc.number_of_pages_median || 0,
            thumbnail: doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                : '',
            isbn: doc.isbn?.[0],
            language: doc.language?.[0] || 'eng',
            category: doc.subject?.[0],
            publisher: doc.publisher?.[0],
            publishedDate: doc.first_publish_year?.toString(),
        }));
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

export const CATEGORIES = [
    'Philosophy',
    'Psychology',
    'History',
    'Science',
    'Mathematics',
    'Literature',
    'Political Science',
    'Economics',
    'Sociology',
    'Religion',
    'Art',
    'Music',
    'Architecture',
    'Biography',
    'Law',
    'Medicine',
    'Education',
    'Linguistics',
    'Environment',
    'Classics',
];

export const LANGUAGES = [
    { code: 'eng', name: 'English', count: 5000 },
    { code: 'tur', name: 'Turkish', count: 1500 },
    { code: 'ger', name: 'German', count: 1000 },
    { code: 'fre', name: 'French', count: 1000 },
    { code: 'spa', name: 'Spanish', count: 1000 },
    { code: 'ita', name: 'Italian', count: 500 },
    { code: 'gre', name: 'Greek', count: 500 },
    { code: 'lat', name: 'Latin', count: 500 },
    { code: 'ara', name: 'Arabic', count: 500 },
    { code: 'per', name: 'Persian', count: 500 },
    { code: 'chi', name: 'Chinese', count: 500 },
    { code: 'jpn', name: 'Japanese', count: 500 },
    { code: 'rus', name: 'Russian', count: 500 },
    { code: 'por', name: 'Portuguese', count: 500 },
    { code: 'dut', name: 'Dutch', count: 500 },
];
