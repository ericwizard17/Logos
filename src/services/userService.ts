/**
 * User Service - Handles all user-related operations
 */

import { supabase } from '@/lib/supabase';
import { sanitizeText } from '@/lib/sanitize';
import { parseSupabaseError, NotFoundError, AuthenticationError } from '@/lib/errors';
import type { UserProfile, ReadingHeatmapData, ApiResponse } from '@/types';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Transform database row to profile format
 */
function transformProfile(row: ProfileRow): UserProfile {
    return {
        id: row.id,
        username: row.username,
        country_code: row.country_code,
        country_name: row.country_name,
        flag: row.flag,
        access_level: row.access_level as UserProfile['access_level'],
        is_premium: row.is_premium,
        is_verified: row.is_verified ?? false,
        phronesis: row.phronesis,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        if (!data) throw new NotFoundError('User profile');

        return { data: transformProfile(data), error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'username' | 'country_code' | 'country_name' | 'flag'>>
): Promise<ApiResponse<UserProfile>> {
    try {
        if (!userId) throw new AuthenticationError();

        const updateData: ProfileUpdate = {
            updated_at: new Date().toISOString(),
        };

        if (updates.username !== undefined && updates.username !== null) {
            updateData.username = sanitizeText(updates.username);
        }
        if (updates.country_code !== undefined) {
            updateData.country_code = updates.country_code;
        }
        if (updates.country_name !== undefined && updates.country_name !== null) {
            updateData.country_name = sanitizeText(updates.country_name);
        }
        if (updates.flag !== undefined) {
            updateData.flag = updates.flag;
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return { data: transformProfile(data), error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Get reading heatmap data for user
 */
export async function getReadingHeatmap(userId: string): Promise<ApiResponse<ReadingHeatmapData>> {
    try {
        const { data, error } = await supabase
            .from('reading_logs')
            .select('date, pages_read')
            .eq('user_id', userId);

        if (error) throw error;

        // Aggregate pages by date
        const heatmapData: ReadingHeatmapData = {};
        (data || []).forEach((log) => {
            heatmapData[log.date] = (heatmapData[log.date] || 0) + log.pages_read;
        });

        return { data: heatmapData, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<ApiResponse<{
    totalBooks: number;
    totalPages: number;
    completedBooks: number;
    completionRate: number;
}>> {
    try {
        const { data: books, error } = await supabase
            .from('user_books')
            .select('current_page, page_count, is_completed')
            .eq('user_id', userId);

        if (error) throw error;

        const totalBooks = books?.length || 0;
        const totalPages = books?.reduce((acc, b) => acc + (b.current_page || 0), 0) || 0;
        const completedBooks = books?.filter(b => b.is_completed).length || 0;
        const completionRate = totalBooks > 0 
            ? Math.round((completedBooks / totalBooks) * 100) 
            : 0;

        return {
            data: {
                totalBooks,
                totalPages,
                completedBooks,
                completionRate,
            },
            error: null,
        };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Increment user's phronesis (reputation points)
 */
export async function incrementPhronesis(
    userId: string, 
    amount: number = 1
): Promise<ApiResponse<number>> {
    try {
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('phronesis')
            .eq('id', userId)
            .single();

        if (fetchError) throw fetchError;

        const newPhronesis = (profile?.phronesis || 0) + amount;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ phronesis: newPhronesis })
            .eq('id', userId);

        if (updateError) throw updateError;

        return { data: newPhronesis, error: null };
    } catch (error) {
        return { data: null, error: parseSupabaseError(error) };
    }
}

/**
 * Check if user has premium access
 */
export async function checkPremiumAccess(userId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_premium, access_level')
            .eq('id', userId)
            .single();

        if (error) return false;
        
        return data?.is_premium || data?.access_level === 'founding' || data?.access_level === 'admin';
    } catch {
        return false;
    }
}

