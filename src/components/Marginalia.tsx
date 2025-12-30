import React from 'react';
import styles from './Marginalia.module.css';

interface MarginaliaProps {
    quote?: string;
    note: string;
    author: string;
    page?: number;
}

export const Marginalia: React.FC<MarginaliaProps> = ({ quote, note, author, page }) => {
    return (
        <div className={styles.noteContainer}>
            {quote && (
                <blockquote className={styles.quote}>
                    "{quote}"
                </blockquote>
            )}
            <div className={styles.noteBody}>
                <p className={styles.noteText}>{note}</p>
                <div className={styles.footer}>
                    <span className={styles.author}>— {author}</span>
                    {page && <span className={styles.page}>p. {page}</span>}
                </div>
            </div>
        </div>
    );
};
