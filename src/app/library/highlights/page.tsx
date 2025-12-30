'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './page.module.css';
import { ReadingBuddies } from '@/components/ReadingBuddies';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface Highlight {
    id: string;
    book: string;
    content: string;
    page: number;
    date: string;
}

const MOCK_HIGHLIGHTS: Highlight[] = [
    {
        id: '1',
        book: 'Beyond Good and Evil',
        content: 'He who fights with monsters should look to it that he himself does not become a monster.',
        page: 24,
        date: 'Dec 24, 2025'
    },
    {
        id: '2',
        book: 'The Stranger',
        content: 'I opened myself to the gentle indifference of the world.',
        page: 112,
        date: 'Dec 22, 2025'
    }
];

export default function HighlightsPage() {
    const { t } = useLanguage();
    const pathname = usePathname();

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <h2 className="serif gold-accent">LOGOS</h2>
                    <p>The Curator's Desk</p>
                </div>

                <LanguageSwitcher />

                <nav className={styles.nav}>
                    <Link href="/library" className={styles.navItem}>{t('nav_shelf')}</Link>
                    <Link href="/library/agora" className={styles.navItem}>{t('nav_agora')}</Link>
                    <Link href="/library/highlights" className={styles.navItemActive}>{t('nav_highlights')}</Link>
                    <Link href="/library/symposiums" className={styles.navItem}>{t('nav_symposiums')}</Link>
                    <Link href="/profile" className={styles.navItem}>{t('nav_profile')}</Link>
                </nav>
                <ReadingBuddies />
            </aside>

            <main className={styles.content}>
                <header className={styles.header}>
                    <h1 className="serif">{t('highlights_title')}</h1>
                    <p className={styles.subtitle}>Your personal repository of curated sparks and digital highlights.</p>
                </header>

                <section className={styles.actions}>
                    <button className={styles.scanBtn}>
                        <span className={styles.icon}>📷</span> Scan Physical Page
                    </button>
                    <button className={styles.manualBtn}>Manual Entry</button>
                </section>

                <section className={styles.grid}>
                    {MOCK_HIGHLIGHTS.map(h => (
                        <div key={h.id} className={`${styles.highlightCard} card`}>
                            <div className={styles.paperTexture}></div>
                            <p className={styles.highlightContent}>&quot;{h.content}&quot;</p>
                            <div className={styles.highlightMeta}>
                                <span className={styles.bookTitle}>{h.book}</span>
                                <span className={styles.pageInfo}>Page {h.page} • {h.date}</span>
                            </div>
                            <div className={styles.cardActions}>
                                <button className={styles.shareBtn}>Post to Agora</button>
                                <button className={styles.deleteBtn}>Archive</button>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
