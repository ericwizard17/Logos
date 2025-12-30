'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { searchBooks, Book } from '@/lib/books';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Oracle } from '@/components/Oracle';
import { ReadingBuddies } from '@/components/ReadingBuddies';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Notifications } from '@/components/Notifications';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserBook extends Book {
    currentPage: number;
    supabaseId?: string;
}

export default function LibraryPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [myBooks, setMyBooks] = useState<UserBook[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Fetch user's books from Supabase
    useEffect(() => {
        const fetchBooks = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('user_books')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data && !error) {
                const formattedBooks: UserBook[] = data.map(book => ({
                    id: book.id,
                    title: book.book_title,
                    authors: book.authors ? [book.authors] : [],
                    pageCount: book.page_count,
                    thumbnail: book.thumbnail || '',
                    currentPage: book.current_page,
                    supabaseId: book.id,
                }));
                setMyBooks(formattedBooks);
            }
            setLoading(false);
        };

        fetchBooks();
    }, [user]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setIsSearching(true);
        const results = await searchBooks(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
    };

    const addToLibrary = async (book: Book) => {
        if (!user) return;

        // Check if book already exists
        if (myBooks.find(b => b.title === book.title)) return;

        // Insert into Supabase
        const { data, error } = await supabase
            .from('user_books')
            .insert({
                user_id: user.id,
                book_title: book.title,
                authors: book.authors.join(', '),
                page_count: book.pageCount,
                current_page: 0,
                thumbnail: book.thumbnail,
            })
            .select()
            .single();

        if (data && !error) {
            const newBook: UserBook = {
                id: data.id,
                title: data.book_title,
                authors: data.authors ? [data.authors] : [],
                pageCount: data.page_count,
                thumbnail: data.thumbnail || '',
                currentPage: 0,
                supabaseId: data.id,
            };
            setMyBooks([newBook, ...myBooks]);
            setSearchResults([]);
            setSearchQuery('');
        }
    };

    const updateProgress = async (supabaseId: string, page: number) => {
        if (!user) return;

        const book = myBooks.find(b => b.supabaseId === supabaseId);
        if (!book) return;

        const newPage = Math.min(page, book.pageCount);

        // Update in Supabase
        await supabase
            .from('user_books')
            .update({ current_page: newPage })
            .eq('id', supabaseId);

        // Update local state
        const newBooks = myBooks.map(b =>
            b.supabaseId === supabaseId ? { ...b, currentPage: newPage } : b
        );
        setMyBooks(newBooks);
    };

    const toggleComplete = async (supabaseId: string) => {
        if (!user) return;

        const book = myBooks.find(b => b.supabaseId === supabaseId);
        if (!book) return;

        const newCompletedStatus = !(book as any).isCompleted;

        // Update in Supabase
        await supabase
            .from('user_books')
            .update({ is_completed: newCompletedStatus })
            .eq('id', supabaseId);

        // Update local state
        const newBooks = myBooks.map(b =>
            b.supabaseId === supabaseId ? { ...b, isCompleted: newCompletedStatus } as any : b
        );
        setMyBooks(newBooks);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <p>{t('loading_library')}</p>
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
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchBtn} disabled={isSearching}>
                        {isSearching ? t('seeking') : t('seek_button')}
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <section className={styles.searchResults}>
                        <h3 className="serif">{t('discoveries')}</h3>
                        <div className={styles.resultsGrid}>
                            {searchResults.map(book => (
                                <div key={book.id} className={`${styles.resultCard} card`}>
                                    {book.thumbnail && (
                                        <Image src={book.thumbnail} alt={book.title} width={80} height={120} className={styles.thumbnail} />
                                    )}
                                    <div className={styles.bookInfo}>
                                        <h4 className="serif">{book.title}</h4>
                                        <p className={styles.authors}>{book.authors.join(', ')}</p>
                                        <p className={styles.pages}>{book.pageCount} {t('pages_count')}</p>
                                    </div>
                                    <button onClick={() => addToLibrary(book)} className={styles.addBtn}>
                                        {t('add_to_shelf')}
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
                                    <Image src={book.thumbnail} alt={book.title} width={120} height={180} className={styles.cover} />
                                )}
                                <div className={styles.cardContent}>
                                    <h3 className="serif">
                                        {book.title}
                                        {(book as any).isCompleted && (
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
                                            onChange={(e) => updateProgress(book.supabaseId!, parseInt(e.target.value))}
                                            className={styles.pageInput}
                                        />
                                        <span>/ {book.pageCount}</span>
                                    </div>
                                    <div className={styles.actions}>
                                        <button onClick={() => router.push(`/library/discuss/${book.supabaseId}`)} className={styles.discussBtn}>
                                            {t('enter_symposium')}
                                        </button>
                                        <button
                                            onClick={() => toggleComplete(book.supabaseId!)}
                                            className={`${styles.completeBtn} ${(book as any).isCompleted ? styles.completeBtnActive : ''}`}
                                        >
                                            {(book as any).isCompleted ? t('mark_completed') : t('mark_complete')}
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
