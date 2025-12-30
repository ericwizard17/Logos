'use client';

import { useEffect, useState } from 'react';
import styles from './ReadingHeatmap.module.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ReadingLog {
    date: string;
    pages_read: number;
}

export function ReadingHeatmap() {
    const { user } = useAuth();
    const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('reading_logs')
                .select('date, pages_read')
                .eq('user_id', user.id);

            if (data && !error) {
                const logs: Record<string, number> = {};
                data.forEach((log: ReadingLog) => {
                    // Accumulate pages (if multiple entries per day, though table is unique per book-day, but we sum all books)
                    logs[log.date] = (logs[log.date] || 0) + log.pages_read;
                });
                setHeatmapData(logs);
            }
            setLoading(false);
        };

        fetchLogs();
    }, [user]);

    // Generate dates for last 365 days
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const getIntensity = (count: number) => {
        if (!count) return 0;
        if (count < 10) return 1;
        if (count < 30) return 2;
        if (count < 50) return 3;
        return 4;
    };

    if (loading) return <div className={styles.loading}>Loading Heatmap...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {days.map((date) => {
                    const count = heatmapData[date] || 0;
                    const intensity = getIntensity(count);
                    return (
                        <div
                            key={date}
                            className={`${styles.day} ${styles[`intensity-${intensity}`]}`}
                            title={`${date}: ${count} pages read`}
                        />
                    );
                })}
            </div>
            <div className={styles.legend}>
                <span>Less</span>
                <div className={`${styles.day} ${styles['intensity-0']}`} />
                <div className={`${styles.day} ${styles['intensity-1']}`} />
                <div className={`${styles.day} ${styles['intensity-2']}`} />
                <div className={`${styles.day} ${styles['intensity-3']}`} />
                <div className={`${styles.day} ${styles['intensity-4']}`} />
                <span>More</span>
            </div>
        </div>
    );
}
