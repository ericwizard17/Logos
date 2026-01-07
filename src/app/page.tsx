'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Thread } from "@/components/Thread";
import { Marginalia } from "@/components/Marginalia";
import { useLanguage } from "@/context/LanguageContext";
import { Particles } from "@/components/Particles";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const DUMMY_COMMENTS = [
  { id: "1", user: "Socrates", text: "The unexamined life is not worth living. How does this apply to the protagonist's struggle in Chapter 1?", page: 12, timestamp: "2 hours ago" },
  { id: "2", user: "Diogenes", text: "I am looking for an honest man in these comments.", page: 45, timestamp: "1 hour ago" },
  { id: "3", user: "Plato", text: "Wait until you get to the Allegory of the Cave in Chapter 7 (Page 150)!", page: 150, timestamp: "30 mins ago" },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <Particles />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.langWrapper}>
          <LanguageSwitcher />
        </div>
        <div className={styles.heroBackground}>
          <Image
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80"
            alt="Logos Library"
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.overlay}></div>
        </div>

        <div className={styles.heroContent}>
          <h1 className="serif">{t('hero_title')}</h1>
          <p className={styles.subtitle}>{t('hero_subtitle')}</p>
          <div className={styles.ctaGroup}>
            <Link href="/library" className={styles.primaryBtn}>{t('hero_enter')}</Link>
            <Link href="/invite" className={styles.secondaryBtn}>{t('hero_invite')}</Link>
          </div>
        </div>
      </section>


      {/* Philosophy Section */}
      <section className={styles.philosophy}>
        <div className={styles.inner}>
          <div className={styles.philosophyText}>
            <h2 className="serif">Beyond Surface Reading</h2>
            <p>
              In an era of rapid consumption, Logos is a return to depth.
              We believe every book is a conversation—between author and reader,
              and among the community of thinkers who follow in their wake.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className="card">
              <h3 className="gold-accent serif">Spoiler-Protected Threads</h3>
              <p>Join discussions synced to your precise reading progress. No spoilers, just pure exploration.</p>
            </div>
            <div className="card">
              <h3 className="gold-accent serif">Shared Marginalia</h3>
              <p>Explore the insights of others as if you were reading a borrowed book from a wise friend.</p>
            </div>
            <div className="card">
              <h3 className="gold-accent serif">Vibe Coding Symposiums</h3>
              <p>Participate in live, moderated intellectual debates on timely themes and timeless classics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className={styles.demo}>
        <div className={styles.inner}>
          <h2 className="serif" style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '3rem', color: 'var(--primary)' }}>Experience the Depth</h2>

          <div className={styles.demoGrid}>
            <div className={styles.demoColumn}>
              <h3 className="serif" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Digital Marginalia</h3>
              <Marginalia
                quote="The beginning of wisdom is the definition of terms."
                note="Note how the author uses 'wisdom' here not as a state of being, but as a practice of precision. It changes the entire tone of the preface."
                author="Marcus Aurelius"
                page={5}
              />
              <Marginalia
                note="This passage reminds me of the Stoic concept of Ataraxia. Deeply resonant with our current week's theme."
                author="Seneca"
                page={82}
              />
            </div>

            <div className={styles.demoColumn}>
              <h3 className="serif" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Adaptive Thread</h3>
              <Thread
                bookTitle="The Republic"
                userCurrentPage={50}
                comments={DUMMY_COMMENTS}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className="serif">&copy; 2025 Logos. Cultivating the mind, one page at a time.</p>
      </footer>
    </div>
  );
}
