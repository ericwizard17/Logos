'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import * as discussionService from '@/services/discussionService';
import type { Comment } from '@/types';

// Query keys
export const discussionKeys = {
    all: ['discussions'] as const,
    lists: () => [...discussionKeys.all, 'list'] as const,
    list: (bookId: string) => [...discussionKeys.lists(), bookId] as const,
    listWithSpoiler: (bookId: string, maxPage: number) => 
        [...discussionKeys.lists(), bookId, maxPage] as const,
    count: (bookId: string) => [...discussionKeys.all, 'count', bookId] as const,
    user: (userId: string) => [...discussionKeys.all, 'user', userId] as const,
    chapter: (bookId: string, chapterId: string) => 
        [...discussionKeys.all, 'chapter', bookId, chapterId] as const,
};

/**
 * Hook to fetch discussions for a book with spoiler protection
 */
export function useBookDiscussions(bookId: string, userCurrentPage?: number) {
    return useQuery({
        queryKey: userCurrentPage !== undefined 
            ? discussionKeys.listWithSpoiler(bookId, userCurrentPage)
            : discussionKeys.list(bookId),
        queryFn: async () => {
            const { data, error } = await discussionService.getBookDiscussions(bookId, {
                maxPage: userCurrentPage,
            });
            if (error) throw error;
            return data || [];
        },
        enabled: !!bookId,
    });
}

/**
 * Hook to fetch discussion count
 */
export function useDiscussionCount(bookId: string) {
    return useQuery({
        queryKey: discussionKeys.count(bookId),
        queryFn: async () => {
            const { data, error } = await discussionService.getDiscussionCount(bookId);
            if (error) throw error;
            return data || 0;
        },
        enabled: !!bookId,
    });
}

/**
 * Hook to fetch user's discussions
 */
export function useUserDiscussions(limit: number = 20) {
    const { user } = useAuth();

    return useQuery({
        queryKey: discussionKeys.user(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await discussionService.getUserDiscussions(user.id, limit);
            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.id,
    });
}

/**
 * Hook to create a discussion
 */
export function useCreateDiscussion(bookId: string) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: {
            bookTitle: string;
            pageNumber: number;
            content: string;
            chapterId?: string;
        }) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data: result, error } = await discussionService.createDiscussion(user.id, {
                ...data,
                bookId,
            });
            if (error) throw error;
            return result;
        },
        onMutate: async (newComment) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: discussionKeys.lists() });

            // Snapshot previous value
            const previousComments = queryClient.getQueryData<Comment[]>(
                discussionKeys.list(bookId)
            );

            // Optimistically add the new comment
            if (previousComments) {
                const optimisticComment: Comment = {
                    id: `temp-${Date.now()}`,
                    user: 'You',
                    text: newComment.content,
                    page: newComment.pageNumber,
                    timestamp: 'Just now',
                    isVerified: false,
                };
                queryClient.setQueryData<Comment[]>(
                    discussionKeys.list(bookId),
                    [optimisticComment, ...previousComments]
                );
            }

            return { previousComments };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousComments) {
                queryClient.setQueryData(
                    discussionKeys.list(bookId),
                    context.previousComments
                );
            }
        },
        onSettled: () => {
            // Refetch to get server data
            queryClient.invalidateQueries({ queryKey: discussionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: discussionKeys.count(bookId) });
        },
    });
}

/**
 * Hook to update a discussion
 */
export function useUpdateDiscussion(bookId: string) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ discussionId, content }: { discussionId: string; content: string }) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data, error } = await discussionService.updateDiscussion(
                discussionId, 
                user.id, 
                content
            );
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: discussionKeys.list(bookId) });
        },
    });
}

/**
 * Hook to delete a discussion
 */
export function useDeleteDiscussion(bookId: string) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (discussionId: string) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data, error } = await discussionService.deleteDiscussion(discussionId, user.id);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: discussionKeys.list(bookId) });
            queryClient.invalidateQueries({ queryKey: discussionKeys.count(bookId) });
        },
    });
}

