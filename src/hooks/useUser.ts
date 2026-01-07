'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import * as userService from '@/services/userService';
import type { UserProfile } from '@/types';

// Query keys
export const userKeys = {
    all: ['users'] as const,
    profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
    stats: (userId: string) => [...userKeys.all, 'stats', userId] as const,
    heatmap: (userId: string) => [...userKeys.all, 'heatmap', userId] as const,
};

/**
 * Hook to fetch current user's profile
 */
export function useUserProfile() {
    const { user } = useAuth();

    return useQuery({
        queryKey: userKeys.profile(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await userService.getUserProfile(user.id);
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
    });
}

/**
 * Hook to fetch user statistics
 */
export function useUserStats() {
    const { user } = useAuth();

    return useQuery({
        queryKey: userKeys.stats(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await userService.getUserStats(user.id);
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
    });
}

/**
 * Hook to fetch reading heatmap data
 */
export function useReadingHeatmap() {
    const { user } = useAuth();

    return useQuery({
        queryKey: userKeys.heatmap(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) return {};
            const { data, error } = await userService.getReadingHeatmap(user.id);
            if (error) throw error;
            return data || {};
        },
        enabled: !!user?.id,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (updates: Partial<Pick<UserProfile, 'username' | 'country_code' | 'country_name' | 'flag'>>) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data, error } = await userService.updateUserProfile(user.id, updates);
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            // Update cache with new profile data
            if (data && user?.id) {
                queryClient.setQueryData(userKeys.profile(user.id), data);
            }
        },
    });
}

/**
 * Hook to check premium access
 */
export function usePremiumAccess() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['premium', user?.id],
        queryFn: async () => {
            if (!user?.id) return false;
            return userService.checkPremiumAccess(user.id);
        },
        enabled: !!user?.id,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

