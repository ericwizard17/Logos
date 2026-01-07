'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Oracle } from '@/components/Oracle';
import { ReadingBuddies } from '@/components/ReadingBuddies';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Notifications } from '@/components/Notifications';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { 
    useUserBooks, 
    useBookSearch, 
    useAddBook, 
    useUpdateProgress, 
    useToggleCompletion 
} from '@/hooks/useBooks';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import type { Book } from '@/types';

export default function LibraryPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { showError, showSuccess } = useToast();
    
    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);

    // React Query hooks
    const { data: myBooks = [], isLoading, error: booksError } = useUserBooks();
    const { data: searchResults = [], isFetching: isSearching } = useBookSearch(
        searchQuery, 
        isSearchEnabled && searchQuery.length > 0
    );
    
    // Mutations
    const addBookMutation = useAddBook();
    const updateProgressMutation = useUpdateProgress();
    const toggleCompletionMutation = useToggleCompletion();

    // Handle search
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const sanitized = sanitizeSearchQuery(searchQuery);
        if (!sanitized) return;
        setIsSearchEnabled(true);
    }, [searchQuery]);

    // Handle adding book to library
    const handleAddToLibrary = useCallback(async (book: Book) => {
        if (!user) return;

        // Check if book already exists
        if (myBooks.find(b => b.title === book.title)) {
            showError('Bu kitap zaten kütüphanenizde.');
            return;
        }

        try {
            await addBookMutation.mutateAsync(book);
            showSuccess('Kitap kütüphanenize eklendi!');
            setSearchQuery('');
            setIsSearchEnabled(false);
        } catch (err) {
            showError('Kitap eklenirken bir hata oluştu.');
        }
    }, [user, myBooks, addBookMutation, showError, showSuccess]);

    // Handle progress update with debounce
    const handleUpdateProgress = useCallback(async (supabaseId: string, page: number, totalPages: number) => {
        if (!user) return;

        try {
            await updateProgressMutation.mutateAsync({
                bookId: supabaseId,
                currentPage: page,
                totalPages,
            });
        } catch (err) {
            showError('İlerleme güncellenirken bir hata oluştu.');
        }
    }, [user, updateProgressMutation, showError]);

    // Handle completion toggle
    const handleToggleComplete = useCallback(async (supabaseId: string) => {
        if (!user) return;

        try {
            await toggleCompletionMutation.mutateAsync(supabaseId);
        } catch (err) {
            showError('Durum güncellenirken bir hata oluştu.');
        }
    }, [user, toggleCompletionMutation, showError]);

    // Show error toast if books fail to load
    if (booksError) {
        showError('Kitaplar yüklenirken bir hata oluştu.');
    }

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p>{t('loading_library')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <h2 className="serif gold-accent">LOGOS</h2>
                    <p>{t('brand_subtitle')}</p>
                </div>
                <LanguageSwitcher />
                <nav className={styles.nav}>
                    <Link href="/library" className={pathname === '/library' ? styles.navItemActive : styles.navItem}>
                        {t('nav_shelf')}
                    </Link>
                    <Link href="/library/agora" className={pathname === '/library/agora' ? styles.navItemActive : styles.navItem}>
                        {t('nav_agora')}
                    </Link>
                    <Link href="/library/highlights" className={pathname === '/library/highlights' ? styles.navItemActive : styles.navItem}>
                        {t('nav_highlights')}
                    </Link>
                    <Link href="/library/symposiums" className={pathname === '/library/symposiums' ? styles.navItemActive : styles.navItem}>
                        {t('nav_symposiums')}
                    </Link>
                    <Link href="/library/discipline" className={pathname === '/library/discipline' ? styles.navItemActive : styles.navItem}>
                        {t('nav_discipline')}
                    </Link>
                    <Link href="/profile" className={pathname === '/profile' ? styles.navItemActive : styles.navItem}>
                        {t('nav_profile')}
                    </Link>
                </nav>
                <ReadingBuddies />
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                <div className={styles.topActions}>
                    <Oracle />
                    <Notifications />
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchEnabled(false);
                        }}
                        className={styles.searchInput}
                        maxLength={200}
                    />
                    <button type="submit" className={styles.searchBtn} disabled={isSearching || !searchQuery.trim()}>
                        {isSearching ? t('seeking') : t('seek_button')}
                    </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <section className={styles.searchResults}>
                        <h3 className="serif">{t('discoveries')}</h3>
                        <div className={styles.resultsGrid}>
                            {searchResults.map(book => (
                                <div key={book.id} className={`${styles.resultCard} card`}>
                                    {book.thumbnail && (
                                        <Image 
                                            src={book.thumbnail} 
                                            alt={book.title} 
                                            width={80} 
                                            height={120} 
                                            className={styles.thumbnail}
                                            unoptimized
                                        />
                                    )}
                                    <div className={styles.bookInfo}>
                                        <h4 className="serif">{book.title}</h4>
                                        <p className={styles.authors}>{book.authors.join(', ')}</p>
                                        <p className={styles.pages}>{book.pageCount} {t('pages_count')}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleAddToLibrary(book)} 
                                        className={styles.addBtn}
                                        disabled={addBookMutation.isPending}
                                    >
                                        {addBookMutation.isPending ? '...' : t('add_to_shelf')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Books Grid */}
                <section className={styles.shelfGrid}>
                    {myBooks.length === 0 ? (
                        <div className={styles.empty}>
                            <p className="serif">{t('quote_empty_shelf')}</p>
                        </div>
                    ) : (
                        myBooks.map(book => (
                            <div key={book.supabaseId} className={`${styles.bookCard} card`}>
                                {book.thumbnail && (
                                    <Image 
                                        src={book.thumbnail} 
                                        alt={book.title} 
                                        width={120} 
                                        height={180} 
                                        className={styles.cover}
                                        unoptimized
                                    />
                                )}
                                <div className={styles.cardContent}>
                                    <h3 className="serif">
                                        {book.title}
                                        {book.isCompleted && (
                                            <span className={styles.completedBadge}>{t('completed_badge')}</span>
                                        )}
                                    </h3>
                                    <p className={styles.author}>{book.authors.join(', ')}</p>
                                    <div className={styles.progress}>
                                        <label>{t('current_page_label')}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={book.pageCount}
                                            value={book.currentPage}
                                            onChange={(e) => handleUpdateProgress(
                                                book.supabaseId, 
                                                parseInt(e.target.value) || 0,
                                                book.pageCount
                                            )}
                                            className={styles.pageInput}
                                        />
                                        <span>/ {book.pageCount}</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div 
                                            className={styles.progressFill} 
                                            style={{ 
                                                width: `${book.pageCount > 0 ? (book.currentPage / book.pageCount) * 100 : 0}%` 
                                            }} 
                                        />
                                    </div>
                                    <div className={styles.actions}>
                                        <button 
                                            onClick={() => router.push(`/library/discuss/${book.supabaseId}`)} 
                                            className={styles.discussBtn}
                                        >
                                            {t('enter_symposium')}
                                        </button>
                                        <button
                                            onClick={() => handleToggleComplete(book.supabaseId)}
                                            className={`${styles.completeBtn} ${book.isCompleted ? styles.completeBtnActive : ''}`}
                                            disabled={toggleCompletionMutation.isPending}
                                        >
                                            {book.isCompleted ? t('mark_completed') : t('mark_complete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}
