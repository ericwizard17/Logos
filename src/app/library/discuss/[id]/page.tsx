'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Thread } from '@/components/Thread';
import { ChapterThread } from '@/components/ChapterThread';
import styles from './page.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/Toast';
import { useBook } from '@/hooks/useBooks';
import { useBookDiscussions, useCreateDiscussion } from '@/hooks/useDiscussions';
import { useUserProfile } from '@/hooks/useUser';
import type { ViewMode, Chapter } from '@/types';

const MOCK_CHAPTERS: Chapter[] = [
    { id: 1, title: 'The Genesis of Idea', startPage: 1 },
    { id: 2, title: 'The Dialectic Conflict', startPage: 30 },
    { id: 3, title: 'The Synthesis of Spirit', startPage: 75 },
    { id: 4, title: 'Practical Ethics', startPage: 150 },
];

export default function DiscussPage() {
    const { t } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const { showError } = useToast();
    const bookId = params.id as string;

    // Local state
    const [newComment, setNewComment] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('flow');
    const [commentError, setCommentError] = useState('');

    // React Query hooks
    const { data: book, isLoading: bookLoading, error: bookError } = useBook(bookId);
    const { data: profile } = useUserProfile();
    const { 
        data: comments = [], 
        isLoading: commentsLoading 
    } = useBookDiscussions(bookId, book?.currentPage);
    
    // Mutations
    const createDiscussionMutation = useCreateDiscussion(bookId);

    // Handle posting comment
    const handlePostComment = useCallback(async () => {
        if (!book) return;

        setCommentError('');

        const trimmedComment = newComment.trim();
        if (!trimmedComment) {
            setCommentError('Yorum boş olamaz');
            return;
        }

        if (trimmedComment.length > 2000) {
            setCommentError('Yorum 2000 karakterden uzun olamaz');
            return;
        }

        try {
            await createDiscussionMutation.mutateAsync({
                bookTitle: book.title,
                pageNumber: book.currentPage,
                content: trimmedComment,
            });
            setNewComment('');
        } catch (err) {
            showError('Yorum gönderilirken bir hata oluştu.');
        }
    }, [newComment, book, createDiscussionMutation, showError]);

    // Loading state
    if (bookLoading || commentsLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p>{t('loading_discussion')}</p>
                </div>
            </div>
        );
    }

    // Error or not found state
    if (bookError || !book) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button onClick={() => router.push('/library')} className={styles.backBtn}>
                        {t('back_to_library')}
                    </button>
                </header>
                <div className={styles.notFound}>
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
                <div className={styles.bookMeta}>
                    <h1 className="serif">{book.title}</h1>
                    <p>{book.authors.join(', ')}</p>
                </div>
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
                            bookTitle={book.title}
                            userCurrentPage={book.currentPage}
                            comments={comments}
                        />
                    ) : (
                        <ChapterThread
                            chapters={MOCK_CHAPTERS}
                            comments={comments}
                        />
                    )}

                    <div className={`${styles.commentBox} card`}>
                        <textarea
                            placeholder={`${t('share_thoughts')} ${book.currentPage}...`}
                            value={newComment}
                            onChange={(e) => {
                                setNewComment(e.target.value);
                                if (commentError) setCommentError('');
                            }}
                            className={styles.textarea}
                            maxLength={2000}
                            aria-label="Yorum yaz"
                            aria-invalid={!!commentError}
                        />
                        {commentError && (
                            <p className={styles.errorMessage} role="alert">
                                {commentError}
                            </p>
                        )}
                        <div className={styles.commentActions}>
                            <span className={styles.charCount}>
                                {newComment.length}/2000
                            </span>
                            <button 
                                onClick={handlePostComment} 
                                className={styles.postBtn}
                                disabled={!newComment.trim() || createDiscussionMutation.isPending}
                            >
                                {createDiscussionMutation.isPending ? 'Gönderiliyor...' : t('post_insight')}
                            </button>
                        </div>
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

                    <div className={styles.statsCard}>
                        <h4 className="serif">Okuma İlerlemesi</h4>
                        <div className={styles.progressInfo}>
                            <span className={styles.currentPage}>{book.currentPage}</span>
                            <span className={styles.separator}>/</span>
                            <span className={styles.totalPages}>{book.pageCount}</span>
                        </div>
                        <div className={styles.progressBarLarge}>
                            <div 
                                className={styles.progressFill} 
                                style={{ 
                                    width: `${book.pageCount > 0 ? (book.currentPage / book.pageCount) * 100 : 0}%` 
                                }} 
                            />
                        </div>
                        <p className={styles.progressPercent}>
                            %{book.pageCount > 0 ? Math.round((book.currentPage / book.pageCount) * 100) : 0} tamamlandı
                        </p>
                    </div>

                    <div className={styles.pollinationSection}>
                        <h3 className="serif">{t('related_discussions')}</h3>
                        <div className={`${styles.pollinationCard} card`}>
                            <h4 className="serif">Critique of Pure Reason</h4>
                            <p>Discussing the boundaries of human knowledge in relation to {book.title}.</p>
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
