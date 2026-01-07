/**
 * Sanitization utilities for preventing XSS and injection attacks
 */

/**
 * Sanitize HTML content - removes all dangerous HTML/scripts
 * Use for any user-generated content that will be displayed
 */
export function sanitizeHtml(dirty: string): string {
    if (typeof window === 'undefined') {
        // Server-side: strip all HTML tags
        return dirty.replace(/<[^>]*>/g, '').trim();
    }
    
    // Client-side: use DOMPurify
    // Dynamic import to avoid SSR issues
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
    });
}

/**
 * Sanitize plain text - removes all HTML and normalizes whitespace
 * Use for comments, search queries, and other text inputs
 */
export function sanitizeText(input: string): string {
    if (!input) return '';
    
    // Remove all HTML tags
    let clean = input.replace(/<[^>]*>/g, '');
    
    // Remove potential script injections
    clean = clean.replace(/javascript:/gi, '');
    clean = clean.replace(/on\w+=/gi, '');
    clean = clean.replace(/data:/gi, '');
    
    // Normalize whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    
    return clean;
}

/**
 * Sanitize search query - safe for use in API calls
 */
export function sanitizeSearchQuery(query: string): string {
    if (!query) return '';
    
    let clean = sanitizeText(query);
    
    // Remove SQL injection patterns
    clean = clean.replace(/['";\\]/g, '');
    clean = clean.replace(/--/g, '');
    clean = clean.replace(/\/\*/g, '');
    clean = clean.replace(/\*\//g, '');
    
    // Limit length
    return clean.slice(0, 200);
}

/**
 * Sanitize and validate page number
 */
export function sanitizePageNumber(input: string | number, maxPages: number = 10000): number {
    const num = typeof input === 'string' ? parseInt(input, 10) : input;
    
    if (isNaN(num) || num < 0) return 0;
    if (num > maxPages) return maxPages;
    
    return Math.floor(num);
}

/**
 * Sanitize username/display name
 */
export function sanitizeUsername(username: string): string {
    if (!username) return 'Anonymous';
    
    let clean = sanitizeText(username);
    
    // Remove special characters except basic ones
    clean = clean.replace(/[^a-zA-Z0-9_\-\s\u00C0-\u017F]/g, '');
    
    // Limit length
    clean = clean.slice(0, 50);
    
    return clean || 'Anonymous';
}

/**
 * Sanitize URL - validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';
    
    try {
        const parsed = new URL(url);
        
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        
        return parsed.href;
    } catch {
        return '';
    }
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    
    return text.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Create a safe excerpt from text (for previews)
 */
export function createSafeExcerpt(text: string, maxLength: number = 150): string {
    const clean = sanitizeText(text);
    
    if (clean.length <= maxLength) return clean;
    
    return clean.slice(0, maxLength).trim() + '...';
}

