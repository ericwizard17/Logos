'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import * as bookService from '@/services/bookService';
import type { Book, UserBookDisplay } from '@/types';

// Query keys
export const bookKeys = {
    all: ['books'] as const,
    lists: () => [...bookKeys.all, 'list'] as const,
    list: (userId: string) => [...bookKeys.lists(), userId] as const,
    details: () => [...bookKeys.all, 'detail'] as const,
    detail: (id: string) => [...bookKeys.details(), id] as const,
    search: (query: string) => [...bookKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch user's books
 */
export function useUserBooks() {
    const { user } = useAuth();

    return useQuery({
        queryKey: bookKeys.list(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await bookService.getUserBooks(user.id);
            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.id,
    });
}

/**
 * Hook to fetch a single book
 */
export function useBook(bookId: string) {
    const { user } = useAuth();

    return useQuery({
        queryKey: bookKeys.detail(bookId),
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await bookService.getBookById(bookId, user.id);
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id && !!bookId,
    });
}

/**
 * Hook to search books
 */
export function useBookSearch(query: string, enabled: boolean = true) {
    return useQuery({
        queryKey: bookKeys.search(query),
        queryFn: async () => {
            if (!query) return [];
            const { data, error } = await bookService.searchBooks(query);
            if (error) throw error;
            return data || [];
        },
        enabled: enabled && query.length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to add a book to library
 */
export function useAddBook() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (book: Book) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data, error } = await bookService.addBookToLibrary(user.id, book);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch user books
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
        },
    });
}

/**
 * Hook to update reading progress
 */
export function useUpdateProgress() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ 
            bookId, 
            currentPage, 
            totalPages 
        }: { 
            bookId: string; 
            currentPage: number; 
            totalPages: number;
        }) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data, error } = await bookService.updateReadingProgress(
                bookId, 
                user.id, 
                currentPage, 
                totalPages
            );
            if (error) throw error;
            return data;
        },
        onMutate: async ({ bookId, currentPage }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: bookKeys.lists() });

            // Snapshot previous value
            const previousBooks = queryClient.getQueryData<UserBookDisplay[]>(
                bookKeys.list(user?.id || '')
            );

            // Optimistically update
            if (previousBooks) {
                queryClient.setQueryData<UserBookDisplay[]>(
                    bookKeys.list(user?.id || ''),
                    previousBooks.map((book) =>
                        book.supabaseId === bookId
                            ? { ...book, currentPage }
                            : book
                    )
                );
            }

            return { previousBooks };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousBooks) {
                queryClient.setQueryData(
                    bookKeys.list(user?.id || ''),
                    context.previousBooks
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
        },
    });
}

/**
 * Hook to toggle book completion
 */
export function useToggleCompletion() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (bookId: string) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data, error } = await bookService.toggleBookCompletion(bookId, user.id);
            if (error) throw error;
            return data;
        },
        onMutate: async (bookId) => {
            await queryClient.cancelQueries({ queryKey: bookKeys.lists() });

            const previousBooks = queryClient.getQueryData<UserBookDisplay[]>(
                bookKeys.list(user?.id || '')
            );

            if (previousBooks) {
                queryClient.setQueryData<UserBookDisplay[]>(
                    bookKeys.list(user?.id || ''),
                    previousBooks.map((book) =>
                        book.supabaseId === bookId
                            ? { ...book, isCompleted: !book.isCompleted }
                            : book
                    )
                );
            }

            return { previousBooks };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousBooks) {
                queryClient.setQueryData(
                    bookKeys.list(user?.id || ''),
                    context.previousBooks
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
        },
    });
}

/**
 * Hook to remove a book
 */
export function useRemoveBook() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (bookId: string) => {
            if (!user?.id) throw new Error('User not authenticated');
            const { data, error } = await bookService.removeBookFromLibrary(bookId, user.id);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
        },
    });
}

