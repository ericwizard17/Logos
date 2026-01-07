import React, { useMemo } from 'react';
import styles from './Thread.module.css';
import { sanitizeText, escapeHtml } from '@/lib/sanitize';

export interface Comment {
    id: string;
    user: string;
    text: string;
    page: number;
    timestamp: string;
    countryFlag?: string;
    isVerified?: boolean;
}

interface ThreadProps {
    bookTitle: string;
    userCurrentPage: number;
    comments: Comment[];
}

export const Thread: React.FC<ThreadProps> = ({ bookTitle, userCurrentPage, comments }) => {
    const visibleComments = useMemo(() => 
        comments.filter(c => c.page <= userCurrentPage),
        [comments, userCurrentPage]
    );
    const hiddenCount = comments.length - visibleComments.length;

    // Sanitize book title for display
    const safeBookTitle = useMemo(() => escapeHtml(bookTitle), [bookTitle]);

    return (
        <div className={styles.threadContainer}>
            <header className={styles.header}>
                <h2 className="serif">Discussion: {safeBookTitle}</h2>
                <div className={styles.progressInfo}>
                    You are at <span className="gold-accent">Page {userCurrentPage}</span>
                </div>
            </header>

            <div className={styles.commentList}>
                {visibleComments.map((comment) => (
                    <div key={comment.id} className={`${styles.commentCard} card`}>
                        <div className={styles.commentMeta}>
                            <div className={styles.userWrapper}>
                                {comment.countryFlag && <span className={styles.flag}>{comment.countryFlag}</span>}
                                <span className={styles.username}>{sanitizeText(comment.user)}</span>
                                {comment.isVerified && <span className={styles.verifiedBadge} title="Verified Scholar">✓</span>}
                            </div>
                            <span className={styles.pageTag}>Page {comment.page}</span>
                        </div>
                        <p className={styles.commentText}>{sanitizeText(comment.text)}</p>
                        <span className={styles.time}>{escapeHtml(comment.timestamp)}</span>
                    </div>
                ))}
            </div>

            {hiddenCount > 0 && (
                <div className={styles.spoilerWarning}>
                    <p>
                        {hiddenCount} comments are hidden to protect you from spoilers.
                        Keep reading to unlock them!
                    </p>
                </div>
            )}
        </div>
    );
};
