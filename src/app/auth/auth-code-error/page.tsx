'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function AuthCodeError() {
    return (
        <div className={styles.container}>
            <div className={`${styles.card} card`}>
                <div className={styles.icon}>⚠️</div>
                <h1 className="serif">Authentication Error</h1>
                <p className={styles.message}>
                    There was an error during the authentication process. 
                    This could be due to an expired or invalid authentication code.
                </p>
                <div className={styles.actions}>
                    <Link href="/invite" className={styles.primaryBtn}>
                        Try Again
                    </Link>
                    <Link href="/" className={styles.secondaryBtn}>
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

