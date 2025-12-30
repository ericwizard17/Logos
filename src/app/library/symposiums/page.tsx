'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './page.module.css';
import { ReadingBuddies } from '@/components/ReadingBuddies';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Nominations } from '@/components/Nominations';

interface Symposium {
    id: string;
    title: string;
    host: string;
    time: string;
    status: 'live' | 'scheduled' | 'club';
    type: 'standing' | 'impromptu';
    attendees: number;
    description: string;
    isPremium?: boolean;
}

const UPCOMING_EVENTS: Symposium[] = [
    {
        id: '1',
        title: 'The Ethics of Artificial Intelligence',
        host: 'Prof. Marcus',
        time: 'LIVE NOW',
        status: 'live',
        type: 'impromptu',
        attendees: 42,
        description: 'A one-time deep dive into the moral implications of neural networks.',
        isPremium: true
    },
    {
        id: '2',
        title: 'Franklins Junto: Modern Civic Virtue',
        host: 'Dr. Simone',
        time: 'In 2 hours',
        status: 'scheduled',
        type: 'standing',
        attendees: 156,
        description: 'A recurring circle discussing the evolution of community ethics.'
    },
    {
        id: '4',
        title: 'Private Circle: Meditations Book Club',
        host: 'Marcus Aurelius',
        time: 'Tonight, 21:00',
        status: 'club',
        type: 'standing',
        attendees: 12,
        description: 'Our weekly gathering to contemplate the Emperor’s notes.',
        isPremium: true
    },
];

const SCHEDULE = [
    { day: 'Monday', activity: 'Morning Meditation (Stoics)', time: '08:00' },
    { day: 'Wednesday', activity: 'Dialectic Workshop', time: '18:00' },
    { day: 'Friday', activity: 'The Scholars Banquet', time: '20:00' },
];

export default function SymposiumsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'calendar' | 'live' | 'nominations' | 'create'>('calendar');
    const [filter, setFilter] = useState<'all' | 'standing' | 'impromptu'>('all');
    const [showSchedule, setShowSchedule] = useState(false);

    const filteredEvents = UPCOMING_EVENTS.filter(e => filter === 'all' || e.type === filter);

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
                    <Link href="/library/symposiums" className={styles.navItemActive}>{t('nav_symposiums')}</Link>
                    <Link href="/library/discipline" className={styles.navItem}>{t('nav_discipline')}</Link>
                    <Link href="/profile" className={styles.navItem}>{t('nav_profile')}</Link>
                </nav>
                <ReadingBuddies />
            </aside>

            <main className={styles.content}>
                <header className={styles.header}>
                    <div className={styles.titleArea}>
                        <h1 className="serif">{t('symposium_title')}</h1>
                        <div className={styles.filterBar}>
                            <button onClick={() => setFilter('all')} className={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}>All</button>
                            <button onClick={() => setFilter('standing')} className={filter === 'standing' ? styles.filterBtnActive : styles.filterBtn}>Standing Circles</button>
                            <button onClick={() => setFilter('impromptu')} className={filter === 'impromptu' ? styles.filterBtnActive : styles.filterBtn}>Impromptu Sessions</button>
                        </div>
                    </div>
                    <div className={styles.tabs}>
                        <button className={activeTab === 'calendar' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('calendar')}>Calendar</button>
                        <button className={activeTab === 'live' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('live')}>Live</button>
                        <button className={activeTab === 'nominations' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('nominations')}>Nominations</button>
                        <button className={activeTab === 'create' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('create')}>+ {t('create_club')}</button>
                    </div>
                </header>

                <section className={styles.mainGrid}>
                    {activeTab === 'calendar' && (
                        <div className={styles.calendarView}>
                            <div className={styles.viewToggleInner}>
                                <button onClick={() => setShowSchedule(false)} className={!showSchedule ? styles.activeView : ''}>Events</button>
                                <button onClick={() => setShowSchedule(true)} className={showSchedule ? styles.activeView : ''}>{t('reading_schedule')}</button>
                            </div>

                            {showSchedule ? (
                                <div className={styles.scheduleList}>
                                    {SCHEDULE.map((s, i) => (
                                        <div key={i} className={styles.scheduleItem}>
                                            <div className={styles.day}>{s.day}</div>
                                            <div className={styles.activity}>{s.activity}</div>
                                            <div className={styles.time}>{s.time}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.eventList}>
                                    {filteredEvents.map(event => (
                                        <div key={event.id} className={`${styles.eventCard} card ${event.isPremium ? styles.premiumCard : ''}`}>
                                            <div className={styles.eventMain}>
                                                <div className={styles.eventHeader}>
                                                    <span className={event.type === 'standing' ? styles.standingTag : styles.impromptuTag}>
                                                        {event.type.toUpperCase()}
                                                    </span>
                                                    <div className={styles.badges}>
                                                        {event.isPremium && <span className={styles.premiumBadge}>{t('premium')}</span>}
                                                        <span className={
                                                            event.status === 'live' ? styles.liveBadge :
                                                                event.status === 'club' ? styles.clubBadge : styles.scheduledBadge
                                                        }>
                                                            {event.status === 'live' ? '• LIVE' : event.status === 'club' ? 'PRIVATE' : 'SCHEDULED'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h4 className="serif">{event.title}</h4>
                                                <p className={styles.eventDesc}>{event.description}</p>
                                                <p className={styles.hostInfo}>Curated by <span className="gold-accent">{event.host}</span></p>
                                            </div>
                                            <div className={styles.eventMeta}>
                                                <p className={styles.time}>{event.time}</p>
                                                <p className={styles.attendees}>{event.attendees}/{event.type === 'standing' ? '∞' : '10'} Scholars</p>
                                                <button className={styles.actionBtn}>
                                                    {event.status === 'live' ? t('enter_chamber') : 'Mark Interest'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'live' && (
                        <div className={styles.liveRoomsView}>
                            <div className={styles.activeChamber}>
                                <div className={styles.chamberHeader}>
                                    <span className={styles.chamberType}>Impromptu Session (Max 10)</span>
                                    <h3 className="serif">Chamber 01: The Ethics of AI</h3>
                                    <div className={styles.promptCard}>
                                        <h5 className="serif">Current Inquiry:</h5>
                                        <p>{t('current_inquiry')}</p>
                                    </div>
                                </div>
                                <div className={styles.liveAudioUI}>
                                    <div className={styles.speakerGrid}>
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className={styles.speaker}>
                                                <div className={styles.avatarMini}>{['M', 'S', 'A', 'K', 'J', 'L'][i]}</div>
                                                <span>Scholar {i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.audioVisualize}>
                                        {[...Array(8)].map((_, i) => <div key={i} className={styles.bar}></div>)}
                                    </div>
                                </div>
                                <div className={styles.chamberControls}>
                                    <button className={styles.micBtn}>Listen Only</button>
                                    <button className={styles.requestBtn}>Request to Speak</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'nominations' && <Nominations />}

                    {activeTab === 'create' && (
                        <div className={styles.createForm}>
                            <h2 className="serif">Establish a New Circle</h2>
                            <p>Great things begin with a shared inquiry.</p>
                            <form className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label>Circle Title</label>
                                    <input type="text" placeholder="e.g. The Spinoza Society" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Type</label>
                                    <select>
                                        <option value="standing">Standing (Recurring)</option>
                                        <option value="impromptu">Impromptu (One-time)</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Privacy</label>
                                    <select>
                                        <option value="public">Public</option>
                                        <option value="private">Private (Invite only)</option>
                                    </select>
                                </div>
                                <button type="button" className={styles.submitBtn} onClick={() => setActiveTab('calendar')}>
                                    Ignite Circle
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
