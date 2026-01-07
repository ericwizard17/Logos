/**
 * Supabase Database Types
 * These types match the database schema
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string | null;
                    country_code: string | null;
                    country_name: string | null;
                    flag: string | null;
                    access_level: string;
                    is_premium: boolean;
                    is_verified: boolean;
                    phronesis: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    username?: string | null;
                    country_code?: string | null;
                    country_name?: string | null;
                    flag?: string | null;
                    access_level?: string;
                    is_premium?: boolean;
                    is_verified?: boolean;
                    phronesis?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string | null;
                    country_code?: string | null;
                    country_name?: string | null;
                    flag?: string | null;
                    access_level?: string;
                    is_premium?: boolean;
                    is_verified?: boolean;
                    phronesis?: number;
                    updated_at?: string;
                };
            };
            user_books: {
                Row: {
                    id: string;
                    user_id: string;
                    book_title: string;
                    authors: string | null;
                    page_count: number;
                    current_page: number;
                    thumbnail: string | null;
                    is_completed: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_title: string;
                    authors?: string | null;
                    page_count?: number;
                    current_page?: number;
                    thumbnail?: string | null;
                    is_completed?: boolean;
                    created_at?: string;
                };
                Update: {
                    book_title?: string;
                    authors?: string | null;
                    page_count?: number;
                    current_page?: number;
                    thumbnail?: string | null;
                    is_completed?: boolean;
                };
            };
            page_discussions: {
                Row: {
                    id: string;
                    user_id: string;
                    book_id: string;
                    book_title: string;
                    page_number: number;
                    chapter_id: string | null;
                    content: string;
                    country_flag: string | null;
                    is_verified: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    book_title: string;
                    page_number: number;
                    chapter_id?: string | null;
                    content: string;
                    country_flag?: string | null;
                    is_verified?: boolean;
                    created_at?: string;
                };
                Update: {
                    content?: string;
                    page_number?: number;
                    chapter_id?: string | null;
                };
            };
            books_catalog: {
                Row: {
                    id: string;
                    title: string;
                    authors: string[];
                    isbn: string | null;
                    language: string;
                    category: string | null;
                    page_count: number | null;
                    thumbnail: string | null;
                    description: string | null;
                    publisher: string | null;
                    published_date: string | null;
                    source: string;
                    external_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    authors: string[];
                    isbn?: string | null;
                    language?: string;
                    category?: string | null;
                    page_count?: number | null;
                    thumbnail?: string | null;
                    description?: string | null;
                    publisher?: string | null;
                    published_date?: string | null;
                    source?: string;
                    external_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    title?: string;
                    authors?: string[];
                    isbn?: string | null;
                    language?: string;
                    category?: string | null;
                    page_count?: number | null;
                    thumbnail?: string | null;
                    description?: string | null;
                    publisher?: string | null;
                    published_date?: string | null;
                };
            };
            reading_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    book_id: string;
                    date: string;
                    pages_read: number;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    date: string;
                    pages_read: number;
                };
                Update: {
                    pages_read?: number;
                };
            };
        };
        Functions: {
            log_reading_activity: {
                Args: {
                    p_book_id: string;
                    p_pages_read: number;
                };
                Returns: void;
            };
        };
    };
}

// Helper types for Supabase queries
export type Tables<T extends keyof Database['public']['Tables']> = 
    Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> = 
    Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
    Database['public']['Tables'][T]['Update'];

