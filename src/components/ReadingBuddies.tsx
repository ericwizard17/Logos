'use client';

import styles from './ReadingBuddies.module.css';

interface Buddy {
    name: string;
    book: string;
    page: number;
    status: 'online' | 'reading' | 'offline';
}

const MOCK_BUDDIES: Buddy[] = [
    { name: 'Socrates', book: 'The Republic', page: 142, status: 'reading' },
    { name: 'Hypatia', book: 'Elements of Geometry', page: 89, status: 'online' },
    { name: 'Marcus Aurelius', book: 'Meditations', page: 33, status: 'reading' },
];

export function ReadingBuddies() {
    return (
        <div className={styles.container}>
            <h3 className="serif">Reading Buddies</h3>
            <div className={styles.list}>
                {MOCK_BUDDIES.map((buddy, i) => (
                    <div key={i} className={styles.buddyCard}>
                        <div className={styles.buddyInfo}>
                            <div className={styles.avatar}>
                                {buddy.name[0]}
                                <span className={`${styles.statusDot} ${styles[buddy.status]}`}></span>
                            </div>
                            <div className={styles.meta}>
                                <span className={styles.name}>{buddy.name}</span>
                                <span className={styles.activity}>
                                    {buddy.status === 'reading' ? 'Reading' : 'Online'}
                                </span>
                            </div>
                        </div>
                        <div className={styles.bookProgress}>
                            <span className={styles.bookTitle}>{buddy.book}</span>
                            <div className={styles.miniBar}>
                                <div className={styles.fill} style={{ width: `${(buddy.page / 200) * 100}%` }}></div>
                            </div>
                            <span className={styles.pageText}>Page {buddy.page}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
