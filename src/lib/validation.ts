import { z } from 'zod';

/**
 * Validation schemas for all user inputs
 */

// Comment/Discussion validation
export const commentSchema = z.object({
    content: z
        .string()
        .min(1, 'Yorum boş olamaz')
        .max(2000, 'Yorum 2000 karakterden uzun olamaz')
        .transform(val => val.trim()),
    pageNumber: z
        .number()
        .int('Sayfa numarası tam sayı olmalı')
        .min(0, 'Sayfa numarası 0\'dan küçük olamaz')
        .max(50000, 'Geçersiz sayfa numarası'),
    bookId: z
        .string()
        .uuid('Geçersiz kitap ID\'si'),
});

// Search query validation
export const searchQuerySchema = z.object({
    query: z
        .string()
        .min(1, 'Arama sorgusu boş olamaz')
        .max(200, 'Arama sorgusu 200 karakterden uzun olamaz')
        .transform(val => val.trim()),
    limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .default(10),
});

// Page progress update validation
export const pageProgressSchema = z.object({
    bookId: z
        .string()
        .uuid('Geçersiz kitap ID\'si'),
    currentPage: z
        .number()
        .int('Sayfa numarası tam sayı olmalı')
        .min(0, 'Sayfa numarası negatif olamaz'),
    totalPages: z
        .number()
        .int()
        .min(1)
        .optional(),
});

// Book addition validation
export const addBookSchema = z.object({
    title: z
        .string()
        .min(1, 'Kitap başlığı gerekli')
        .max(500, 'Kitap başlığı çok uzun'),
    authors: z
        .string()
        .max(500, 'Yazar adı çok uzun')
        .optional(),
    pageCount: z
        .number()
        .int()
        .min(0)
        .max(50000)
        .optional()
        .default(0),
    thumbnail: z
        .string()
        .url('Geçersiz thumbnail URL\'i')
        .optional()
        .or(z.literal('')),
});

// AI Summary request validation
export const summaryRequestSchema = z.object({
    bookTitle: z
        .string()
        .min(1, 'Kitap başlığı gerekli')
        .max(500, 'Kitap başlığı çok uzun'),
    author: z
        .string()
        .min(1, 'Yazar adı gerekli')
        .max(200, 'Yazar adı çok uzun'),
    currentPage: z
        .number()
        .int()
        .min(0)
        .optional(),
    totalPages: z
        .number()
        .int()
        .min(1)
        .optional(),
    type: z
        .enum(['full', 'progress'])
        .default('full'),
});

// User profile update validation
export const profileUpdateSchema = z.object({
    username: z
        .string()
        .min(2, 'Kullanıcı adı en az 2 karakter olmalı')
        .max(50, 'Kullanıcı adı en fazla 50 karakter olabilir')
        .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir')
        .optional(),
    countryCode: z
        .string()
        .length(2, 'Geçersiz ülke kodu')
        .optional(),
});

// Type exports for use in components
export type CommentInput = z.infer<typeof commentSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type PageProgressInput = z.infer<typeof pageProgressSchema>;
export type AddBookInput = z.infer<typeof addBookSchema>;
export type SummaryRequestInput = z.infer<typeof summaryRequestSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Helper function to validate and return result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { 
    success: true; 
    data: T 
} | { 
    success: false; 
    error: string 
} {
    const result = schema.safeParse(data);
    
    if (result.success) {
        return { success: true, data: result.data };
    }
    
    // Get first error message
    const errorMessage = result.error.issues[0]?.message || 'Validation failed';
    return { success: false, error: errorMessage };
}

/**
 * Async validation with custom error handling
 */
export async function validateAsync<T>(
    schema: z.ZodSchema<T>, 
    data: unknown
): Promise<T> {
    return schema.parseAsync(data);
}

