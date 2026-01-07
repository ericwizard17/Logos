/**
 * Discussion Service - Handles all discussion-related operations
 */

import { supabase } from '@/lib/supabase';
import { sanitizeText, sanitizeHtml } from '@/lib/sanitize';
import { parseSupabaseError, AuthenticationError, ValidationError } from '@/lib/errors';
import type { Comment, DiscussionWithProfile, ApiResponse } from '@/types';
import type { Database } from '@/types/supabase';

type DiscussionInsert = Database['public']['Tables']['page_discussions']['Insert'];

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

/**
 * Transform discussion to comment format
 */
function transformDiscussion(discussion: DiscussionWithProfile): Comment {
    return {
        id: discussion.id,
        user: sanitizeText(discussion.profiles?.username || 'Anonymous'),
        text: sanitizeHtml(discussion.content),
        page: discussion.page_number,
        timestamp: formatTimestamp(discussion.created_at),
        countryFlag: discussion.country_flag || undefined,
        isVerified: discussion.is_verified,
    };
}

/**
 * Get discussions for a book
 */
export async function getBookDiscussions(
    bookId: string,
    options?: {
        limit?: number;
        offset?: number;
        maxPage?: number; // For spoiler protection
    }
): Promise<ApiResponse<Comment[]>> {
    try {
        let query = supabase
            .from('page_discussions')
            .select(`
                id,
                content,
                page_number,
                created_at,
                country_flag,
                is_verified,
                user_id,
                book_id,
                book_title,
                chapter_id,
                profiles (username)
            `)
            .eq('book_id', bookId)
            .order('created_at', { ascending: false });

        // Apply spoiler protection
        if (options?.maxPage !== undefined) {
            query = query.lte('page_number', options.maxPage);
        }

        // Apply pagination
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;

        const comments = (data || []).map((d) => 
            transformDiscussion(d as unknown as DiscussionWithProfile)
        );

        return { data: comments, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Get discussion count for a book
 */
export async function getDiscussionCount(bookId: string): Promise<ApiResponse<number>> {
    try {
        const { count, error } = await supabase
            .from('page_discussions')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', bookId);

        if (error) throw error;

        return { data: count || 0, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Create a new discussion/comment
 */
export async function createDiscussion(
    userId: string,
    data: {
        bookId: string;
        bookTitle: string;
        pageNumber: number;
        content: string;
        chapterId?: string;
    }
): Promise<ApiResponse<Comment>> {
    try {
        if (!userId) throw new AuthenticationError();

        // Validate content
        const sanitizedContent = sanitizeText(data.content);
        if (!sanitizedContent || sanitizedContent.length < 1) {
            throw new ValidationError('Comment content is required');
        }
        if (sanitizedContent.length > 2000) {
            throw new ValidationError('Comment is too long (max 2000 characters)');
        }

        // Get user profile for flag and verification status
        const { data: profile } = await supabase
            .from('profiles')
            .select('flag, is_verified')
            .eq('id', userId)
            .single();

        const insertData: DiscussionInsert = {
            user_id: userId,
            book_id: data.bookId,
            book_title: sanitizeText(data.bookTitle),
            page_number: data.pageNumber,
            content: sanitizedContent,
            chapter_id: data.chapterId || null,
            country_flag: profile?.flag || '🌍',
            is_verified: profile?.is_verified || false,
        };

        const { data: newDiscussion, error } = await supabase
            .from('page_discussions')
            .insert(insertData)
            .select(`
                id,
                content,
                page_number,
                created_at,
                country_flag,
                is_verified,
                user_id,
                book_id,
                book_title,
                chapter_id,
                profiles (username)
            `)
            .single();

        if (error) throw error;

        return { 
            data: transformDiscussion(newDiscussion as unknown as DiscussionWithProfile), 
            error: null 
        };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Update a discussion
 */
export async function updateDiscussion(
    discussionId: string,
    userId: string,
    content: string
): Promise<ApiResponse<Comment>> {
    try {
        if (!userId) throw new AuthenticationError();

        const sanitizedContent = sanitizeText(content);
        if (!sanitizedContent || sanitizedContent.length < 1) {
            throw new ValidationError('Comment content is required');
        }

        const { data, error } = await supabase
            .from('page_discussions')
            .update({ content: sanitizedContent })
            .eq('id', discussionId)
            .eq('user_id', userId) // Ensure user owns the discussion
            .select(`
                id,
                content,
                page_number,
                created_at,
                country_flag,
                is_verified,
                user_id,
                book_id,
                book_title,
                chapter_id,
                profiles (username)
            `)
            .single();

        if (error) throw error;

        return { 
            data: transformDiscussion(data as unknown as DiscussionWithProfile), 
            error: null 
        };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Delete a discussion
 */
export async function deleteDiscussion(
    discussionId: string,
    userId: string
): Promise<ApiResponse<boolean>> {
    try {
        if (!userId) throw new AuthenticationError();

        const { error } = await supabase
            .from('page_discussions')
            .delete()
            .eq('id', discussionId)
            .eq('user_id', userId);

        if (error) throw error;

        return { data: true, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Get discussions by chapter
 */
export async function getDiscussionsByChapter(
    bookId: string,
    chapterId: string
): Promise<ApiResponse<Comment[]>> {
    try {
        const { data, error } = await supabase
            .from('page_discussions')
            .select(`
                id,
                content,
                page_number,
                created_at,
                country_flag,
                is_verified,
                user_id,
                book_id,
                book_title,
                chapter_id,
                profiles (username)
            `)
            .eq('book_id', bookId)
            .eq('chapter_id', chapterId)
            .order('page_number', { ascending: true });

        if (error) throw error;

        const comments = (data || []).map((d) => 
            transformDiscussion(d as unknown as DiscussionWithProfile)
        );

        return { data: comments, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Get user's discussions
 */
export async function getUserDiscussions(
    userId: string,
    limit: number = 20
): Promise<ApiResponse<Comment[]>> {
    try {
        const { data, error } = await supabase
            .from('page_discussions')
            .select(`
                id,
                content,
                page_number,
                created_at,
                country_flag,
                is_verified,
                user_id,
                book_id,
                book_title,
                chapter_id,
                profiles (username)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        const comments = (data || []).map((d) => 
            transformDiscussion(d as unknown as DiscussionWithProfile)
        );

        return { data: comments, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

