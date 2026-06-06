"use client";

import { motion } from "framer-motion";
import ModalShell from "./ModalShell";
import HospitalRatingPanel, {
  type HospitalRatingPayload,
  type LangKey,
} from "./HospitalRatingPanel";
import type { ReactNode } from "react";

export type { HospitalRatingPayload };

interface HospitalRatingModalProps {
  isDark: boolean;
  lang: LangKey;
  topOffsetPx?: number;
  onSubmit: (data: HospitalRatingPayload) => void | Promise<void>;
  onHaveComplaint: (data: HospitalRatingPayload) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerExtra?: ReactNode;
}

export default function HospitalRatingModal({
  isDark,
  lang,
  topOffsetPx,
  onSubmit,
  onHaveComplaint,
  onClose,
  title,
  subtitle,
  headerExtra,
}: HospitalRatingModalProps) {
  const panel = isDark
    ? "bg-slate-900 border-slate-600 shadow-2xl shadow-black/50"
    : "bg-white border-slate-200 shadow-2xl shadow-slate-400/20";

  return (
    <ModalShell
      onBackdropClick={onClose}
      panelClassName="max-w-3xl lg:max-w-4xl w-full"
      topOffsetPx={topOffsetPx}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hospital-rating-title"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className={`relative w-full max-h-[min(calc(100dvh-12rem),720px)] rounded-3xl border py-4 px-6 sm:py-6 sm:px-8 lg:py-5 lg:px-14 xl:py-3 xl:px-12 flex flex-col overflow-y-auto overflow-x-hidden ${panel}`}
      >
        <HospitalRatingPanel
          isDark={isDark}
          lang={lang}
          variant="modal"
          showCloseButton
          onClose={onClose}
          title={title}
          subtitle={subtitle}
          headerExtra={headerExtra}
          titleId="hospital-rating-title"
          onSubmit={onSubmit}
          onHaveComplaint={onHaveComplaint}
        />
      </motion.div>
    </ModalShell>
  );
}
