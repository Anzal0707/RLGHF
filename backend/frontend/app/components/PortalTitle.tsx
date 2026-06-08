"use client";

import { motion, type MotionProps } from "framer-motion";
import styles from "./PortalTitle.module.css";

type LangKey = "en" | "ne" | "hi";

interface PortalTitleProps {
  title: string;
  titleLine1?: string;
  titleLine2?: string;
  lang: LangKey;
  isDark: boolean;
  reduceMotion: boolean;
  motionProps?: Pick<MotionProps, "initial" | "animate" | "transition">;
}

export default function PortalTitle({
  title,
  titleLine1,
  titleLine2,
  lang,
  isDark,
  reduceMotion,
  motionProps,
}: PortalTitleProps) {
  const isDevanagari = lang === "ne" || lang === "hi";
  const hasMobileLines = Boolean(titleLine1 && titleLine2);

  const sizeClass = "text-4xl sm:text-5xl md:text-6xl lg:text-7xl";

  const className = isDevanagari
    ? `${styles.titleBase} ${styles.titleDevanagari} ${sizeClass} ${
        isDark ? styles.titleDevanagariDark : styles.titleDevanagariLight
      }`
    : `${styles.titleBase} ${styles.titleEnglish} ${sizeClass} font-black tracking-tight ${
        isDark ? "portal-headline-gradient-dark hero-glow-dark" : "portal-headline-gradient-light hero-glow-light"
      }`;

  const defaultMotion = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, x: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, x: -28 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
      };

  const m = motionProps ?? defaultMotion;

  return (
    <motion.h1 data-portal-title data-lang={lang} {...m} className={className}>
      {hasMobileLines ? (
        <>
          <span className={styles.desktopTitle}>{title}</span>
          <span className={styles.mobileTitleBlock}>
            <span className={styles.mobileTitleLine}>{titleLine1}</span>
            <span className={styles.mobileTitleLine}>{titleLine2}</span>
          </span>
        </>
      ) : (
        title
      )}
    </motion.h1>
  );
}
