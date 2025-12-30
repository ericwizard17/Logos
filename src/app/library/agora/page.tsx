'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './page.module.css';
import { ReadingBuddies } from '@/components/ReadingBuddies';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface Thought {
    id: string;
    user: string;
    book: string;
    content: string;
    timestamp: string;
    likes: number;
    flag: string;
}

const MOCK_THOUGHTS: Thought[] = [
    {
        id: '1',
        user: 'Plato',
        book: 'The Republic',
        content: 'The cave is more than a metaphor; it is our digital existence.',
        timestamp: '2h ago',
        likes: 124,
        flag: '🇬🇷'
    },
    {
        id: '2',
        user: 'Beauvoir',
        book: 'The Second Sex',
        content: 'One is not born, but rather becomes, a reader of the great works.',
        timestamp: '5h ago',
        likes: 89,
        flag: '🇫🇷'
    },
    {
        id: '3',
        user: 'Camus',
        book: 'The Myth of Sisyphus',
        content: 'We must imagine the student of philosophy happy.',
        timestamp: '8h ago',
        likes: 210,
        flag: '🇩🇿'
    }
];

export default function AgoraPage() {
    const { t } = useLanguage();
    const pathname = usePathname();

    return (
        <div className={styles.container}>
            {/* Sidebar - Consistent with Library */}
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <h2 className="serif gold-accent">LOGOS</h2>
                    <p>The Curator's Desk</p>
                </div>

                <LanguageSwitcher />

                <nav className={styles.nav}>
                    <Link href="/library" className={styles.navItem}>{t('nav_shelf')}</Link>
                    <Link href="/library/agora" className={styles.navItemActive}>{t('nav_agora')}</Link>
                    <Link href="/library/highlights" className={styles.navItem}>{t('nav_highlights')}</Link>
                    <Link href="/library/symposiums" className={styles.navItem}>{t('nav_symposiums')}</Link>
                    <Link href="/profile" className={styles.navItem}>{t('nav_profile')}</Link>
                </nav>
                <ReadingBuddies />
            </aside>

            <main className={styles.content}>
                <header className={styles.header}>
                    <h1 className="serif">{t('agora_title')}</h1>
                    <p className={styles.subtitle}>{t('agora_subtitle')}</p>
                </header>

                <section className={styles.feed}>
                    {MOCK_THOUGHTS.map(thought => (
                        <div key={thought.id} className={`${styles.thoughtCard} card`}>
                            <div className={styles.thoughtHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.userAvatar}>
                                        <span className={styles.avatarFlag}>{thought.flag}</span>
                                    </div>
                                    <span className={styles.userName}>{thought.user}</span>
                                </div>
                                <span className={styles.timestamp}>{thought.timestamp}</span>
                            </div>

                            <div className={styles.thoughtBody}>
                                <p className={styles.content_text}>{thought.content}</p>
                                <div className={styles.bookContext}>
                                    <span>Reflecting on</span>
                                    <Link href="#" className={styles.bookLink}>{thought.book}</Link>
                                </div>
                            </div>

                            <div className={styles.thoughtFooter}>
                                <button className={styles.likeBtn}>
                                    <span className={styles.heart}>❤</span> {thought.likes}
                                </button>
                                <button className={styles.discussBtn}>{t('discuss')}</button>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
