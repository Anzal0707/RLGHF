"use client";

import { useId } from "react";

interface MicroscopeIconProps {
  className?: string;
  /** Accessible label; defaults to Operation Theater for OT department usage. */
  "aria-label"?: string;
}

/**
 * Colorful clinical microscope icon for the OT (Operation Theater) department.
 * Uses intrinsic SVG fills so it stays visible in both light and dark themes.
 */
export default function MicroscopeIcon({
  className = "w-full h-full",
  "aria-label": ariaLabel = "Operation Theater",
}: MicroscopeIconProps) {
  const uid = useId().replace(/:/g, "");
  const base = `microscope-base-${uid}`;
  const body = `microscope-body-${uid}`;
  const tube = `microscope-tube-${uid}`;
  const lens = `microscope-lens-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label={ariaLabel}
      role="img"
    >
      <defs>
        <linearGradient id={base} x1="3" y1="20" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="55%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id={body} x1="11" y1="7" x2="13" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={tube} x1="16" y1="3" x2="19" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <radialGradient id={lens} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="45%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>
      </defs>

      {/* Base & stand */}
      <rect x="2.5" y="20" width="19" height="2.5" rx="1.1" fill={`url(#${base})`} />
      <rect x="9" y="17.25" width="6" height="2.75" rx="0.55" fill="#0ea5e9" />
      <path
        d="M12 17.25V8.75"
        stroke={`url(#${body})`}
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* Arm curve to head */}
      <path
        d="M12 11.75C12 11.75 15.25 11 16.75 8.75"
        stroke="#38bdf8"
        strokeWidth="1.85"
        strokeLinecap="round"
      />

      {/* Observation tube */}
      <path
        d="M16.75 8.75L18.35 4.15"
        stroke={`url(#${tube})`}
        strokeWidth="2.35"
        strokeLinecap="round"
      />
      <rect x="17.55" y="2.35" width="1.9" height="2.15" rx="0.45" fill="#0ea5e9" stroke="#0369a1" strokeWidth="0.35" />
      <circle cx="18.5" cy="3.95" r="1.85" fill={`url(#${lens})`} stroke="#0369a1" strokeWidth="0.55" />
      <circle cx="18.15" cy="3.55" r="0.55" fill="#ffffff" opacity="0.9" />

      {/* Stage */}
      <rect x="6.25" y="14.15" width="11.5" height="1.35" rx="0.35" fill="#22d3ee" />
      <rect x="5.75" y="15.5" width="12.5" height="0.95" rx="0.25" fill="#0891b2" />
      <rect x="8.25" y="13.55" width="7.5" height="0.55" rx="0.15" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.25" />

      {/* Objective & sample */}
      <circle cx="12" cy="13.35" r="1.15" fill="#14b8a6" stroke="#0f766e" strokeWidth="0.45" />
      <circle cx="12" cy="13.35" r="0.42" fill="#ecfdf5" />
      <rect x="10.35" y="13.95" width="3.3" height="0.45" rx="0.12" fill="#99f6e4" opacity="0.85" />

      {/* Focus knob */}
      <circle cx="14.65" cy="10.15" r="1.2" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.45" />
      <path d="M14.65 9.35v1.6M13.95 10.15h1.4" stroke="#e0f2fe" strokeWidth="0.4" strokeLinecap="round" />

      {/* Subtle highlight on arm */}
      <path
        d="M12.55 9.5V15.5"
        stroke="#ffffff"
        strokeWidth="0.45"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
