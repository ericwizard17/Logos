'use client';

import React, { useState, useEffect } from 'react';
import styles from './Notifications.module.css';

interface LogNotification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'invite' | 'comment' | 'schedule';
}

export const Notifications: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifs, setNotifs] = useState<LogNotification[]>([
        { id: '1', title: 'New Invitation', message: 'You have been invited to "The Stoic Circle" by Marcus.', time: '5m ago', type: 'invite' },
        { id: '2', title: 'Chapter Discussion', message: 'Hypatia commented on Chapter 2 of The Republic.', time: '1h ago', type: 'comment' },
        { id: '3', title: 'Upcoming Session', message: 'Franklins Junto starts in 2 hours.', time: '2h ago', type: 'schedule' },
    ]);

    return (
        <div className={styles.wrapper}>
            <button className={styles.bellBtn} onClick={() => setIsOpen(!isOpen)}>
                🛎️ <span className={styles.badge}>{notifs.length}</span>
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h4 className="serif">Notification Center</h4>
                    </div>
                    <div className={styles.list}>
                        {notifs.map(n => (
                            <div key={n.id} className={styles.item}>
                                <div className={styles.itemHeader}>
                                    <span className={styles.typeTag}>{n.type}</span>
                                    <span className={styles.time}>{n.time}</span>
                                </div>
                                <h5>{n.title}</h5>
                                <p>{n.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
