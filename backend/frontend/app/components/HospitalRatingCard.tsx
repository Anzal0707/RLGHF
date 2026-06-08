"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import HospitalRatingPanel, {
  HOSPITAL_RATING_TR,
  type HospitalRatingPayload,
  type LangKey,
} from "./HospitalRatingPanel";

interface HospitalRatingCardProps {
  isDark: boolean;
  lang: LangKey;
  isRated?: boolean;
  ratedBadge?: string;
  onSubmit: (data: HospitalRatingPayload) => void | Promise<void>;
  onHaveComplaint: (data: HospitalRatingPayload) => void;
  resetSignal?: string | number;
}

export default function HospitalRatingCard({
  isDark,
  lang,
  isRated = false,
  ratedBadge = "Rated",
  onSubmit,
  onHaveComplaint,
  resetSignal = "",
}: HospitalRatingCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [resetToken, setResetToken] = useState(0);
  const [inlineExpanded, setInlineExpanded] = useState(false);

  const collapseExpanded = useCallback(() => {
    setResetToken((n) => n + 1);
  }, []);

  useEffect(() => {
    collapseExpanded();
  }, [resetSignal, lang, collapseExpanded]);

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

  const tr = HOSPITAL_RATING_TR[lang] ?? HOSPITAL_RATING_TR.en;

  return (
    <motion.section
      ref={cardRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.42 }}
      aria-labelledby="hospital-rating-inline-title"
      className={`hospital-rating-card relative w-full max-w-4xl mx-auto sm:mx-0 rounded-3xl border p-5 sm:p-6 md:p-8 transition-colors duration-300 ${
        isRated ? "medical-surface-rating-rated border-2" : "medical-surface-rating border"
      }`}
    >
      {inlineExpanded && (
        <button
          type="button"
          onClick={collapseExpanded}
          aria-label={tr.closeAria}
          className={`sm:hidden absolute top-2 right-2 z-50 inline-flex items-center justify-center min-w-10 min-h-10 w-10 h-10 rounded-lg border transition-colors cursor-pointer antialiased ${
            isDark
              ? "text-slate-200 bg-slate-800/95 border-slate-600 hover:bg-blue-600 hover:border-blue-500 hover:text-white"
              : "text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-blue-600 hover:border-blue-600 hover:text-white"
          }`}
        >
          <X className="w-5 h-5 shrink-0" strokeWidth={2.5} aria-hidden />
        </button>
      )}
      <HospitalRatingPanel
        isDark={isDark}
        lang={lang}
        variant="inline"
        titleId="hospital-rating-inline-title"
        resetToken={resetToken}
        isRated={isRated}
        ratedBadge={ratedBadge}
        onInlineExpandedChange={setInlineExpanded}
        onSubmit={onSubmit}
        onHaveComplaint={onHaveComplaint}
      />
    </motion.section>
  );
}
