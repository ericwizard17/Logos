'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './page.module.css';
import { ReadingBuddies } from '@/components/ReadingBuddies';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function DisciplinePage() {
    const { t } = useLanguage();
    const [goal, setGoal] = useState(50);
    const [completed, setCompleted] = useState(12);

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <h2 className="serif gold-accent">LOGOS</h2>
                    <p>The Curator's Desk</p>
                </div>
                <LanguageSwitcher />
                <nav className={styles.nav}>
                    <Link href="/library" className={styles.navItem}>{t('nav_shelf')}</Link>
                    <Link href="/library/agora" className={styles.navItem}>{t('nav_agora')}</Link>
                    <Link href="/library/highlights" className={styles.navItem}>{t('nav_highlights')}</Link>
                    <Link href="/library/symposiums" className={styles.navItem}>{t('nav_symposiums')}</Link>
                    <Link href="/library/discipline" className={styles.navItemActive}>{t('nav_discipline')}</Link>
                    <Link href="/profile" className={styles.navItem}>{t('nav_profile')}</Link>
                </nav>
                <ReadingBuddies />
            </aside>

            <main className={styles.content}>
                <header className={styles.header}>
                    <h1 className="serif">{t('discipline_title')}</h1>
                    <p className={styles.subtitle}>Cultivating the habit of deep contemplation through consistent study.</p>
                </header>

                <section className={styles.momentumSection}>
                    <div className={`${styles.momentumCard} card`}>
                        <div className={styles.inkwell}>
                            <div className={styles.ink} style={{ height: `${(completed / goal) * 100}%` }}></div>
                        </div>
                        <div className={styles.momentumInfo}>
                            <h2 className="serif">{t('discipline_momentum')}</h2>
                            <p>You have absorbed <span className="gold-accent">{completed} pages</span> today.</p>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${(completed / goal) * 100}%` }}></div>
                            </div>
                            <p className={styles.goalText}>{t('discipline_goal')}: {goal} pages</p>
                        </div>
                    </div>
                </section>

                <section className={styles.history}>
                    <h3 className="serif">Past Observations</h3>
                    <div className={styles.streakGrid}>
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className={`${styles.day} ${i < 5 ? styles.activeDay : ''}`}>
                                <span className={styles.dayLabel}>Day {i + 1}</span>
                                <div className={styles.quillIcon}>{i < 5 ? '✒' : '◌'}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
