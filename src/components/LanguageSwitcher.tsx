'use client';

import { useLanguage } from '@/context/LanguageContext';
import { languages } from '@/lib/translations';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <div className={styles.container}>
            <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className={styles.select}
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
