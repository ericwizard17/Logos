'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface LibraryBook {
    id: string;
    title: string;
    pageCount: number;
    currentPage: number;
}

interface UserAuth {
    authenticated: boolean;
    countryCode: string;
    countryName: string;
    flag: string;
    accessLevel?: string;
    isPremium?: boolean;
}

interface LikeMindedScholar {
    name: string;
    style: string;
    overlap: string;
    flag: string;
}

const MOCK_MATCHES: LikeMindedScholar[] = [
    { name: "Hypatia_92", style: "Analytical", overlap: "Plato, Aristotle", flag: "🇬🇷" },
    { name: "Eco_Reader", style: "Synthetical", overlap: "Umberto Eco", flag: "🇮🇹" },
    { name: "Arendt_Fan", style: "Political Phil", overlap: "Hannah Arendt", flag: "🇩🇪" },
];

export default function ProfilePage() {
    const { t } = useLanguage();
    const { signOut } = useAuth();
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [userData, setUserData] = useState<UserAuth | null>(null);
    const [allowInvites, setAllowInvites] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedLibrary = localStorage.getItem('logos_library');
        if (savedLibrary) {
            setBooks(JSON.parse(savedLibrary));
        }

        const auth = localStorage.getItem('logos_auth');
        if (auth) {
            try {
                const parsedAuth = JSON.parse(auth);
                if (parsedAuth && typeof parsedAuth === 'object') {
                    setUserData(parsedAuth);
                }
            } catch (e) { }
        }
    }, []);

    const handleLogout = async () => {
        await signOut();
        localStorage.clear();
        router.push('/invite');
    };

    const totalPages = books.reduce((acc, b) => acc + b.currentPage, 0);
    const completionRate = books.length > 0
        ? Math.round((books.filter(b => b.currentPage >= b.pageCount && b.pageCount > 0).length / books.length) * 100)
        : 0;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.push('/library')} className={styles.backBtn}>← Back to Library</button>
                <div className={styles.profileMeta}>
                    <h1 className="serif">{t('nav_profile')}</h1>
                    <div className={styles.headerActions}>
                        <div className={styles.privacyToggle}>
                            <span>Allow Global Invites</span>
                            <input
                                type="checkbox"
                                checked={allowInvites}
                                onChange={() => setAllowInvites(!allowInvites)}
                            />
                        </div>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            {t('nav_logout')}
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <section className={styles.profileHero}>
                    <div className={styles.avatar}>
                        <span className="serif">{userData?.flag || 'Ω'}</span>
                        {userData?.accessLevel === 'founding' && (
                            <div className={styles.founderBadge} title={t('founding_member')}>⭐</div>
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.nameRow}>
                            <h2 className="serif">The Anonymous Scholar</h2>
                            {userData?.isPremium && <span className={styles.premiumTag}>{t('premium')}</span>}
                        </div>
                        <div className={styles.locationWrapper}>
                            {userData?.countryName && (
                                <span className={styles.countryTag}>
                                    {userData.flag} {userData.countryName}
                                </span>
                            )}
                            {userData?.accessLevel === 'founding' && (
                                <span className={styles.statusBadge}>{t('founding_member')}</span>
                            )}
                            <p className={styles.bio}>{t('quote_bio')}</p>
                        </div>
                    </div>
                </section>

                <section className={styles.membershipCard}>
                    <h3 className="serif">Scholarly Standing</h3>
                    <div className={styles.standingGrid}>
                        <div className={styles.standingItem}>
                            <label>Status</label>
                            <p>{userData?.isPremium ? t('premium') : 'Seeker'}</p>
                        </div>
                        <div className={styles.standingItem}>
                            <label>Authority</label>
                            <p>Level 1 Seeker</p>
                        </div>
                        <div className={styles.standingItem}>
                            <label>Reputation</label>
                            <p>150 Phronesis</p>
                        </div>
                    </div>
                </section>

                {/* Thought Style Section */}
                <section className={styles.thoughtStyleSection}>
                    <h3 className="serif">{t('thought_style')}</h3>
                    <div className={styles.styleRadar}>
                        <div className={styles.styleBar}>
                            <span>{t('analytical')}</span>
                            <div className={styles.barOuter}><div className={styles.barInner} style={{ width: '85%' }}></div></div>
                        </div>
                        <div className={styles.styleBar}>
                            <span>{t('emotional')}</span>
                            <div className={styles.barOuter}><div className={styles.barInner} style={{ width: '40%' }}></div></div>
                        </div>
                    </div>
                </section>

                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3 className="serif">Volumes</h3>
                        <p className={styles.statValue}>{books.length}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3 className="serif">Pages</h3>
                        <p className={styles.statValue}>{totalPages}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3 className="serif">Mastery</h3>
                        <p className={styles.statValue}>{completionRate}%</p>
                    </div>
                </section>

                {/* Like-minded Matching Section */}
                <section className={styles.matchingSection}>
                    <h3 className="serif">{t('matching')}</h3>
                    <div className={styles.matchGrid}>
                        {MOCK_MATCHES.map((match, i) => (
                            <div key={i} className={styles.matchCard}>
                                <div className={styles.matchFlag}>{match.flag}</div>
                                <div className={styles.matchInfo}>
                                    <h4>{match.name}</h4>
                                    <p>{match.style} • Overlap: {match.overlap}</p>
                                </div>
                                <button className={styles.connectBtn}>Connect</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.topShelfSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className="serif">The Top Shelf</h3>
                        <p>Your absolute core intellectual pillars.</p>
                    </div>
                    <div className={styles.topShelfGrid}>
                        {books.slice(0, 3).map(book => (
                            <div key={book.id} className={styles.topBook}>
                                <div className={styles.bookSpine}></div>
                                <h4 className="serif">{book.title}</h4>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.shelfSection}>
                    <h3 className="serif">{t('profile_shelf')}</h3>
                    <div className={styles.shelfGrid}>
                        {books.length === 0 ? (
                            <p className={styles.emptyNote}>No volumes have been curated yet.</p>
                        ) : (
                            books.map(book => (
                                <div key={book.id} className={styles.miniBookCard}>
                                    <div className={styles.bookIcon}>📖</div>
                                    <div className={styles.bookMeta}>
                                        <h4 className="serif">{book.title}</h4>
                                        <p>{Math.round((book.currentPage / (book.pageCount || 1)) * 100)}% Absorbed</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
