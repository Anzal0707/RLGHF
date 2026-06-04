"use client";

import type { ReactNode, MouseEvent } from "react";

/** z-index: frosted main backdrop < modal panel < header */
export const Z_MODAL_BACKDROP = 100;
export const Z_MODAL_PANEL = 105;
export const Z_HEADER = 130;

type ModalShellProps = {
  onBackdropClick?: () => void;
  children: ReactNode;
  shellClassName?: string;
  panelClassName?: string;
  /** Pushes the modal panel below the header/menu area. */
  topOffsetPx?: number;
};

/**
 * Full-viewport modal shell (fixed).
 * The header stays clear because it sits above this layer via z-index.
 */
export default function ModalShell({
  onBackdropClick,
  children,
  shellClassName = "",
  panelClassName = "",
  topOffsetPx = 0,
}: ModalShellProps) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none ${shellClassName}`}
      style={{ zIndex: Z_MODAL_BACKDROP }}
    >
      <div
        className="absolute inset-0 pointer-events-auto bg-slate-950/55 backdrop-blur-2xl"
        aria-hidden="true"
        onClick={onBackdropClick}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto overscroll-y-contain px-4 sm:px-6 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{ zIndex: Z_MODAL_PANEL }}
      >
        <div
          className={`relative w-full max-w-2xl pointer-events-auto ${panelClassName}`}
          style={{
            marginTop: topOffsetPx
              ? `calc(${topOffsetPx}px + env(safe-area-inset-top) + 0.75rem)`
              : undefined,
          }}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
