'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Thread, Comment } from '@/components/Thread';
import { ChapterThread } from '@/components/ChapterThread';
import styles from './page.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const MOCK_CHAPTERS = [
    { id: 1, title: 'The Genesis of Idea', startPage: 1 },
    { id: 2, title: 'The Dialectic Conflict', startPage: 30 },
    { id: 3, title: 'The Synthesis of Spirit', startPage: 75 },
    { id: 4, title: 'Practical Ethics', startPage: 150 },
];

export default function DiscussPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [userPage, setUserPage] = useState(0);
    const [bookTitle, setBookTitle] = useState('');
    const [newComment, setNewComment] = useState('');
    const [localComments, setLocalComments] = useState<Comment[]>([]);
    const [userFlag, setUserFlag] = useState('Ω');
    const [viewMode, setViewMode] = useState<'flow' | 'chapter'>('flow');
    const [loading, setLoading] = useState(true);
    const [bookAuthors, setBookAuthors] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [fullSummary, setFullSummary] = useState('');
    const [progressSummary, setProgressSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Fetch user profile and book data
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            // Fetch user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('flag, is_verified')
                .eq('id', user.id)
                .single();

            if (profile?.flag) setUserFlag(profile.flag);

            // Fetch book from user_books
            const { data: book } = await supabase
                .from('user_books')
                .select('*')
                .eq('id', params.id)
                .eq('user_id', user.id)
                .single();

            if (book) {
                setBookTitle(book.book_title);
                setUserPage(book.current_page);
                setBookAuthors(book.authors || 'Unknown Author');
                setTotalPages(book.page_count || 0);

                // Generate AI summaries
                generateSummaries(book.book_title, book.authors, book.current_page, book.page_count);
            }

            // Fetch discussions for this book
            const { data: discussions } = await supabase
                .from('page_discussions')
                .select(`
                    id,
                    content,
                    page_number,
                    created_at,
                    country_flag,
                    is_verified,
                    profiles (username)
                `)
                .eq('book_id', params.id as string)
                .order('created_at', { ascending: false });

            if (discussions) {
                const formattedComments: Comment[] = discussions.map(d => ({
                    id: d.id,
                    user: (d.profiles as any)?.username || 'Anonymous',
                    text: d.content,
                    page: d.page_number,
                    timestamp: formatTimestamp(d.created_at),
                    countryFlag: d.country_flag,
                    isVerified: d.is_verified,
                }));
                setLocalComments(formattedComments);
            }

            setLoading(false);
        };

        fetchData();
    }, [user, params.id]);

    const generateSummaries = async (title: string, authors: string, currentPage: number, totalPages: number) => {
        setLoadingSummary(true);

        try {
            // Generate full summary
            const fullRes = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookTitle: title,
                    author: authors,
                    type: 'full',
                }),
            });
            const fullData = await fullRes.json();
            setFullSummary(fullData.summary || '');

            // Generate progress summary
            const progressRes = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookTitle: title,
                    author: authors,
                    currentPage,
                    totalPages,
                    type: 'progress',
                }),
            });
            const progressData = await progressRes.json();
            setProgressSummary(progressData.summary || '');
        } catch (error) {
            console.error('Error generating summaries:', error);
        } finally {
            setLoadingSummary(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('flag, is_verified')
            .eq('id', user.id)
            .single();

        const { data, error } = await supabase
            .from('page_discussions')
            .insert({
                user_id: user.id,
                book_id: params.id as string,
                book_title: bookTitle,
                page_number: userPage,
                content: newComment,
                country_flag: profile?.flag || '🌍',
                is_verified: profile?.is_verified || false,
            })
            .select(`
                id,
                content,
                page_number,
                created_at,
                country_flag,
                is_verified,
                profiles (username)
            `)
            .single();

        if (data && !error) {
            const newCommentObj: Comment = {
                id: data.id,
                user: (data.profiles as any)?.username || 'You',
                text: data.content,
                page: data.page_number,
                timestamp: 'Just now',
                countryFlag: data.country_flag,
                isVerified: data.is_verified,
            };
            setLocalComments([newCommentObj, ...localComments]);
            setNewComment('');
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <p>{t('loading_discussion')}</p>
            </div>
        );
    }

    if (!bookTitle) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button onClick={() => router.push('/library')} className={styles.backBtn}>
                        {t('back_to_library')}
                    </button>
                </header>
                <div className={styles.content} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <p className="serif">{t('book_not_found')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.push('/library')} className={styles.backBtn}>
                    {t('back_to_library')}
                </button>
            </header>

            <main className={styles.content}>
                <div className={styles.mainColumn}>
                    <div className={styles.viewToggle}>
                        <button
                            onClick={() => setViewMode('flow')}
                            className={viewMode === 'flow' ? styles.toggleActive : styles.toggle}
                        >
                            {t('timeline_view')}
                        </button>
                        <button
                            onClick={() => setViewMode('chapter')}
                            className={viewMode === 'chapter' ? styles.toggleActive : styles.toggle}
                        >
                            {t('chapter_based')}
                        </button>
                    </div>

                    {viewMode === 'flow' ? (
                        <Thread
                            bookTitle={bookTitle}
                            userCurrentPage={userPage}
                            comments={localComments}
                        />
                    ) : (
                        <ChapterThread
                            chapters={MOCK_CHAPTERS}
                            comments={localComments}
                        />
                    )}

                    <div className={`${styles.commentBox} card`}>
                        <textarea
                            placeholder={`${t('share_thoughts')} ${userPage}...`}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className={styles.textarea}
                        />
                        <button onClick={handlePostComment} className={styles.postBtn}>
                            {t('post_insight')}
                        </button>
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={`${styles.insightCard} card`}>
                        <p className={styles.insightText}>
                            {t('insight_text')}
                        </p>
                        <div className={styles.insightMeta}>
                            <span className={styles.tag}>{t('era_tag')}</span>
                            <span className={styles.tag}>{t('conflict_tag')}</span>
                        </div>
                    </div>

                    <div className={styles.pollinationSection}>
                        <h3 className="serif">{t('related_discussions')}</h3>
                        <div className={`${styles.pollinationCard} card`}>
                            <h4 className="serif">Critique of Pure Reason</h4>
                            <p>Discussing the boundaries of human knowledge in relation to {bookTitle}.</p>
                            <span className={styles.activeLabel}>12 {t('scholars_debating')}</span>
                        </div>
                        <div className={`${styles.pollinationCard} card`}>
                            <h4 className="serif">Being and Time</h4>
                            <p>Exploring existential themes parallel to this volume.</p>
                            <span className={styles.activeLabel}>8 {t('scholars_debating')}</span>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
