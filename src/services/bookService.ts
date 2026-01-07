/**
 * Book Service - Handles all book-related operations
 */

import { supabase } from '@/lib/supabase';
import { searchBooks as searchExternalBooks } from '@/lib/books';
import { sanitizeText, sanitizeUrl, sanitizePageNumber, sanitizeSearchQuery } from '@/lib/sanitize';
import { parseSupabaseError, NotFoundError, AuthenticationError } from '@/lib/errors';
import type { Book, UserBook, UserBookDisplay, ApiResponse } from '@/types';
import type { Database } from '@/types/supabase';

type UserBookRow = Database['public']['Tables']['user_books']['Row'];
type UserBookInsert = Database['public']['Tables']['user_books']['Insert'];
type UserBookUpdate = Database['public']['Tables']['user_books']['Update'];

/**
 * Transform database row to display format
 */
function transformUserBook(row: UserBookRow): UserBookDisplay {
    return {
        id: row.id,
        title: row.book_title,
        authors: row.authors ? row.authors.split(', ') : [],
        pageCount: row.page_count,
        thumbnail: row.thumbnail || '',
        currentPage: row.current_page,
        supabaseId: row.id,
        isCompleted: row.is_completed,
    };
}

/**
 * Get all books for a user
 */
export async function getUserBooks(userId: string): Promise<ApiResponse<UserBookDisplay[]>> {
    try {
        const { data, error } = await supabase
            .from('user_books')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const books = (data || []).map(transformUserBook);
        return { data: books, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Get a single book by ID
 */
export async function getBookById(
    bookId: string, 
    userId: string
): Promise<ApiResponse<UserBookDisplay>> {
    try {
        const { data, error } = await supabase
            .from('user_books')
            .select('*')
            .eq('id', bookId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        if (!data) throw new NotFoundError('Book');

        return { data: transformUserBook(data), error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Add a book to user's library
 */
export async function addBookToLibrary(
    userId: string,
    book: Book
): Promise<ApiResponse<UserBookDisplay>> {
    try {
        if (!userId) throw new AuthenticationError();

        // Sanitize inputs
        const sanitizedData: UserBookInsert = {
            user_id: userId,
            book_title: sanitizeText(book.title),
            authors: book.authors.map(a => sanitizeText(a)).join(', '),
            page_count: sanitizePageNumber(book.pageCount, 50000),
            current_page: 0,
            thumbnail: sanitizeUrl(book.thumbnail) || null,
            is_completed: false,
        };

        const { data, error } = await supabase
            .from('user_books')
            .insert(sanitizedData)
            .select()
            .single();

        if (error) throw error;

        return { data: transformUserBook(data), error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Update reading progress
 */
export async function updateReadingProgress(
    bookId: string,
    userId: string,
    currentPage: number,
    totalPages: number
): Promise<ApiResponse<UserBookDisplay>> {
    try {
        if (!userId) throw new AuthenticationError();

        const sanitizedPage = sanitizePageNumber(currentPage, totalPages);

        // Get current progress for calculating pages read
        const { data: currentBook, error: fetchError } = await supabase
            .from('user_books')
            .select('current_page')
            .eq('id', bookId)
            .eq('user_id', userId)
            .single();

        if (fetchError) throw fetchError;

        const pagesRead = sanitizedPage - (currentBook?.current_page || 0);

        // Update the book
        const updateData: UserBookUpdate = {
            current_page: sanitizedPage,
        };

        const { data, error } = await supabase
            .from('user_books')
            .update(updateData)
            .eq('id', bookId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        // Log reading activity for heatmap
        if (pagesRead > 0) {
            await supabase.rpc('log_reading_activity', {
                p_book_id: bookId,
                p_pages_read: pagesRead,
            });
        }

        return { data: transformUserBook(data), error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Toggle book completion status
 */
export async function toggleBookCompletion(
    bookId: string,
    userId: string
): Promise<ApiResponse<UserBookDisplay>> {
    try {
        if (!userId) throw new AuthenticationError();

        // Get current status
        const { data: currentBook, error: fetchError } = await supabase
            .from('user_books')
            .select('is_completed')
            .eq('id', bookId)
            .eq('user_id', userId)
            .single();

        if (fetchError) throw fetchError;

        // Toggle completion
        const updateData: UserBookUpdate = {
            is_completed: !currentBook?.is_completed,
        };

        const { data, error } = await supabase
            .from('user_books')
            .update(updateData)
            .eq('id', bookId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return { data: transformUserBook(data), error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Remove a book from library
 */
export async function removeBookFromLibrary(
    bookId: string,
    userId: string
): Promise<ApiResponse<boolean>> {
    try {
        if (!userId) throw new AuthenticationError();

        const { error } = await supabase
            .from('user_books')
            .delete()
            .eq('id', bookId)
            .eq('user_id', userId);

        if (error) throw error;

        return { data: true, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Search books from external APIs
 */
export async function searchBooks(query: string, limit: number = 10): Promise<ApiResponse<Book[]>> {
    try {
        const sanitizedQuery = sanitizeSearchQuery(query);
        if (!sanitizedQuery) {
            return { data: [], error: null };
        }

        const results = await searchExternalBooks(sanitizedQuery, limit);
        return { data: results, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Check if book exists in user's library
 */
export async function bookExistsInLibrary(
    userId: string,
    bookTitle: string
): Promise<boolean> {
    try {
        const { count, error } = await supabase
            .from('user_books')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('book_title', bookTitle);

        if (error) return false;
        return (count || 0) > 0;
    } catch {
        return false;
    }
}

