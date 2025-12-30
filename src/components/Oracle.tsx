'use client';

import { useState } from 'react';
import styles from './Oracle.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface RecommendedBook {
    title: string;
    author: string;
    reasonKey: string;
}

const RECOMMENDATIONS: RecommendedBook[] = [
    {
        title: 'The Mirror of Simple Souls',
        author: 'Marguerite Porete',
        reasonKey: 'oracle_reason_1'
    },
    {
        title: 'Phenomenology of Spirit',
        author: 'G.W.F. Hegel',
        reasonKey: 'oracle_reason_2'
    }
];

export function Oracle() {
    const { t } = useLanguage();
    const [activeRec, setActiveRec] = useState(0);

    return (
        <section className={`${styles.container} card`}>
            <div className={styles.header}>
                <div className={styles.oracleBadge}>The Oracle</div>
                <h3 className="serif">{t('oracle_title')}</h3>
            </div>

            <div className={styles.recContent}>
                <div className={styles.bookInfo}>
                    <h4 className="serif">{RECOMMENDATIONS[activeRec].title}</h4>
                    <p className={styles.author}>{RECOMMENDATIONS[activeRec].author}</p>
                </div>
                <p className={styles.reason}>{t(RECOMMENDATIONS[activeRec].reasonKey as any)}</p>
            </div>

            <div className={styles.footer}>
                <div className={styles.dots}>
                    {RECOMMENDATIONS.map((_, i) => (
                        <div
                            key={i}
                            className={i === activeRec ? styles.dotActive : styles.dot}
                            onClick={() => setActiveRec(i)}
                        ></div>
                    ))}
                </div>
                <button className={styles.seekBtn}>{t('oracle_seek')} &rarr;</button>
            </div>
        </section>
    );
}
