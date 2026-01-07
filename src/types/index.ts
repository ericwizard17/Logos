/**
 * Global type definitions for the Logos application
 */

// ============================================
// User & Auth Types
// ============================================

export interface User {
    id: string;
    email?: string;
    created_at?: string;
}

export interface UserProfile {
    id: string;
    username: string | null;
    country_code: string | null;
    country_name: string | null;
    flag: string | null;
    access_level: AccessLevel;
    is_premium: boolean;
    is_verified: boolean;
    phronesis: number;
    created_at: string;
    updated_at: string;
}

export type AccessLevel = 'seeker' | 'scholar' | 'founding' | 'admin';

// ============================================
// Book Types
// ============================================

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

export interface UserBook {
    id: string;
    user_id: string;
    book_title: string;
    authors: string | null;
    page_count: number;
    current_page: number;
    thumbnail: string | null;
    is_completed: boolean;
    created_at: string;
}

export interface UserBookDisplay extends Book {
    currentPage: number;
    supabaseId: string;
    isCompleted: boolean;
}

export interface BookCatalog {
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
}

// ============================================
// Discussion Types
// ============================================

export interface Discussion {
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
}

export interface DiscussionWithProfile extends Discussion {
    profiles: {
        username: string | null;
    } | null;
}

export interface Comment {
    id: string;
    user: string;
    text: string;
    page: number;
    timestamp: string;
    countryFlag?: string;
    isVerified?: boolean;
}

export interface Chapter {
    id: number;
    title: string;
    startPage: number;
}

// ============================================
// Reading Activity Types
// ============================================

export interface ReadingLog {
    id: string;
    user_id: string;
    book_id: string;
    date: string;
    pages_read: number;
}

export interface ReadingHeatmapData {
    [date: string]: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// Search & Filter Types
// ============================================

export interface SearchFilters {
    query?: string;
    language?: string;
    category?: string;
    limit?: number;
    offset?: number;
}

export interface BookSearchResult {
    books: Book[];
    total: number;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: NotificationType;
    read: boolean;
}

export type NotificationType = 'invite' | 'comment' | 'schedule' | 'system';

// ============================================
// AI Summary Types
// ============================================

export interface SummaryRequest {
    bookTitle: string;
    author: string;
    currentPage?: number;
    totalPages?: number;
    type: 'full' | 'progress';
}

export interface SummaryResponse {
    summary: string;
    error?: string;
}

// ============================================
// Form Types
// ============================================

export interface AddBookFormData {
    title: string;
    authors: string;
    pageCount: number;
    thumbnail?: string;
}

export interface CommentFormData {
    content: string;
    pageNumber: number;
    bookId: string;
}

export interface ProfileUpdateFormData {
    username?: string;
    countryCode?: string;
    countryName?: string;
    flag?: string;
}

// ============================================
// UI State Types
// ============================================

export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

export interface AsyncState<T> extends LoadingState {
    data: T | null;
}

export type ViewMode = 'flow' | 'chapter';

// ============================================
// Country Types
// ============================================

export interface Country {
    code: string;
    name: string;
    flag: string;
}

// ============================================
// Scholar Matching Types
// ============================================

export interface LikeMindedScholar {
    id: string;
    name: string;
    style: string;
    overlap: string;
    flag: string;
}

