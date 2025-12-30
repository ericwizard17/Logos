'use client';

import { useState } from 'react';
import styles from './Nominations.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface BookNomination {
    id: string;
    title: string;
    author: string;
    votes: number;
}

const MOCK_NOMINATIONS: BookNomination[] = [
    { id: '1', title: 'The World as Will and Representation', author: 'Schopenhauer', votes: 42 },
    { id: '2', title: 'A Thousand Plateaus', author: 'Deleuze & Guattari', votes: 28 },
    { id: '3', title: 'Ethics', author: 'Spinoza', votes: 56 },
];

export function Nominations() {
    const { t } = useLanguage();
    const [items, setItems] = useState(MOCK_NOMINATIONS);

    const handleVote = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, votes: item.votes + 1 } : item
        ));
    };

    return (
        <section className={`${styles.container} card`}>
            <h3 className="serif">The Democratic Agora</h3>
            <p className={styles.subtitle}>Vote for the next collective volume of study.</p>

            <div className={styles.list}>
                {items.map((item) => (
                    <div key={item.id} className={styles.item}>
                        <div className={styles.info}>
                            <h4 className="serif">{item.title}</h4>
                            <p>{item.author}</p>
                        </div>
                        <div className={styles.voteArea}>
                            <span className={styles.voteCount}>{item.votes}</span>
                            <button
                                className={styles.voteBtn}
                                onClick={() => handleVote(item.id)}
                            >
                                {t('vote')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className={styles.nominateBtn}>{t('nominate')}</button>
        </section>
    );
}
