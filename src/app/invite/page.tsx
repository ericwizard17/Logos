'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

const COUNTRIES = [
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'GR', name: 'Greece', flag: '🇬🇷' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'IR', name: 'Iran', flag: '🇮🇷' },
];

export default function InvitePage() {
    const [selectedCountry, setSelectedCountry] = useState('TR');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signInWithGoogle } = useAuth();

    const handleGoogleSignIn = async () => {
        console.log('🔵 Google sign-in button clicked');
        setError('');
        setLoading(true);
        try {
            console.log('🔵 Calling signInWithGoogle...');
            await signInWithGoogle();
            console.log('✅ Google sign-in successful');
        } catch (err: any) {
            console.error('❌ Google sign-in error:', err);
            setError(err.message || 'Google sign-in failed.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} card`}>
                <h1 className="serif">Enter the Sanctuary</h1>
                <p className={styles.hint}>
                    Welcome, scholar. Sign in with Google to begin your intellectual journey.
                </p>

                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Country of Study</label>
                        <select
                            className={styles.select}
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            {COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        onClick={handleGoogleSignIn}
                        className={styles.googleBtn}
                        disabled={loading}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
                            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                        </svg>
                        {loading ? 'Connecting...' : 'Continue with Google'}
                    </button>
                </div>

                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        By signing in, you agree to our terms of service and privacy policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
