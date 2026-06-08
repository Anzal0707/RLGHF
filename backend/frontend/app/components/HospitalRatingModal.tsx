"use client";

import { motion } from "framer-motion";
import ModalShell from "./ModalShell";
import HospitalRatingPanel, {
  type HospitalRatingPayload,
  type LangKey,
} from "./HospitalRatingPanel";
import type { CSSProperties, ReactNode } from "react";

export type { HospitalRatingPayload };

/** Shared with complaint/success modals in page.tsx */
const MODAL_PANEL_MAX_HEIGHT = "max-h-[min(calc(100dvh-10rem),720px)]";

const RATING_POPUP_SURFACE =
  "medical-surface-rating-popup bg-[var(--surface-rating-popup)] border border-solid border-[color:var(--border-rating-popup)]";

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
  /** Department rating popups: tighter mobile layout + smaller title. */
  mobileCompact?: boolean;
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
  mobileCompact = false,
}: HospitalRatingModalProps) {
  return (
    <ModalShell
      onBackdropClick={onClose}
      panelClassName="max-w-3xl lg:max-w-4xl w-full min-h-0"
      topOffsetPx={topOffsetPx}
      compactMobile={mobileCompact}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hospital-rating-title"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        style={
          mobileCompact && topOffsetPx
            ? ({ "--dept-modal-top": `${topOffsetPx}px` } as CSSProperties)
            : undefined
        }
        className={`relative w-full min-h-0 ${
          mobileCompact ? "md:max-h-[min(calc(100dvh-10rem),720px)]" : MODAL_PANEL_MAX_HEIGHT
        } overflow-y-auto overflow-x-hidden rounded-3xl scrollbar-hide transition-colors duration-300 ${RATING_POPUP_SURFACE}${
          mobileCompact ? " department-rating-modal-compact" : ""
        }`}
      >
        <div
          className={`py-4 px-6 sm:py-6 sm:px-8 lg:py-5 lg:px-10 xl:py-4 xl:px-12 min-w-0${
            mobileCompact ? " max-md:py-2.5 max-md:px-4" : ""
          }`}
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
            mobileCompact={mobileCompact}
            onSubmit={onSubmit}
            onHaveComplaint={onHaveComplaint}
          />
        </div>
      </motion.div>
    </ModalShell>
  );
}
