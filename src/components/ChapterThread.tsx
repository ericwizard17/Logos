'use client';

import React, { useState } from 'react';
import styles from './ChapterThread.module.css';
import { Comment } from './Thread';

interface Chapter {
    id: number;
    title: string;
    startPage: number;
}

interface ChapterThreadProps {
    chapters: Chapter[];
    comments: Comment[];
}

export const ChapterThread: React.FC<ChapterThreadProps> = ({ chapters, comments }) => {
    const [activeChapter, setActiveChapter] = useState(chapters[0]?.id || 1);

    const currentChapter = chapters.find(ch => ch.id === activeChapter);
    const nextChapter = chapters.find(ch => ch.id === activeChapter + 1);

    const filteredComments = comments.filter(c => {
        if (!currentChapter) return false;
        const afterStart = c.page >= currentChapter.startPage;
        const beforeNext = nextChapter ? c.page < nextChapter.startPage : true;
        return afterStart && beforeNext;
    });

    return (
        <div className={styles.container}>
            <div className={styles.chapterNav}>
                {chapters.map((ch) => (
                    <button
                        key={ch.id}
                        className={activeChapter === ch.id ? styles.activeTab : styles.tab}
                        onClick={() => setActiveChapter(ch.id)}
                    >
                        <span className={styles.chLabel}>Chapter {ch.id}</span>
                        <span className={styles.chTitle}>{ch.title}</span>
                    </button>
                ))}
            </div>

            <div className={styles.commentScope}>
                <h3 className="serif">{currentChapter?.title}</h3>
                <div className={styles.thread}>
                    {filteredComments.length > 0 ? (
                        filteredComments.map(c => (
                            <div key={c.id} className={styles.comment}>
                                <div className={styles.meta}>
                                    <span className={styles.user}>{c.countryFlag} {c.user}</span>
                                    <span className={styles.page}>Page {c.page}</span>
                                </div>
                                <p>{c.text}</p>
                            </div>
                        ))
                    ) : (
                        <p className={styles.empty}>No scholars have commented on this chapter yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
