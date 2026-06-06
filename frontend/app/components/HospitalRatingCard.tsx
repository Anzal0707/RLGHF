"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import HospitalRatingPanel, { type HospitalRatingPayload, type LangKey } from "./HospitalRatingPanel";

interface HospitalRatingCardProps {
  isDark: boolean;
  lang: LangKey;
  isRated?: boolean;
  ratedBadge?: string;
  onSubmit: (data: HospitalRatingPayload) => void | Promise<void>;
  onHaveComplaint: (data: HospitalRatingPayload) => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  resetSignal?: string | number;
}

export default function HospitalRatingCard({
  isDark,
  lang,
  isRated = false,
  ratedBadge = "Rated",
  onSubmit,
  onHaveComplaint,
  scrollContainerRef,
  resetSignal = "",
}: HospitalRatingCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [resetToken, setResetToken] = useState(0);

  const collapseExpanded = useCallback(() => {
    setResetToken((n) => n + 1);
  }, []);

  useEffect(() => {
    collapseExpanded();
  }, [resetSignal, lang, collapseExpanded]);

  useEffect(() => {
    const onScroll = () => collapseExpanded();

    const scrollEl = scrollContainerRef?.current;
    scrollEl?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scrollEl?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, [scrollContainerRef, collapseExpanded]);

  useEffect(() => {
    const isInsideCard = (target: EventTarget | null) =>
      target instanceof Node && cardRef.current?.contains(target);

    const onPointerDown = (e: PointerEvent) => {
      if (!isInsideCard(e.target)) collapseExpanded();
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!isInsideCard(e.target)) collapseExpanded();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, [collapseExpanded]);

  return (
    <motion.section
      ref={cardRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.42 }}
      aria-labelledby="hospital-rating-inline-title"
      className={`relative w-full max-w-4xl mx-auto sm:mx-0 rounded-3xl border p-5 sm:p-6 md:p-8 transition-colors duration-300 ${
        isRated
          ? isDark
            ? "bg-slate-800/90 border-2 border-emerald-500/50 shadow-2xl shadow-black/30 backdrop-blur-md"
            : "bg-emerald-50/80 border-2 border-emerald-400/60 shadow-xl shadow-teal-900/5 backdrop-blur-sm"
          : isDark
            ? "bg-slate-900/80 border-slate-600/80 shadow-2xl shadow-black/30 backdrop-blur-md"
            : "bg-white/90 border-slate-200/90 shadow-xl shadow-teal-900/5 backdrop-blur-sm"
      }`}
    >
      <HospitalRatingPanel
        isDark={isDark}
        lang={lang}
        variant="inline"
        titleId="hospital-rating-inline-title"
        resetToken={resetToken}
        isRated={isRated}
        ratedBadge={ratedBadge}
        onSubmit={onSubmit}
        onHaveComplaint={onHaveComplaint}
      />
    </motion.section>
  );
}
