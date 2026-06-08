"use client";

import Image from "next/image";
import { useId } from "react";
import { TILGANGA_LOGO_ALT } from "../lib/hospitalBranding";

interface TilgangaLogoProps {
  className?: string;
  variant?: "header" | "login";
  isDark?: boolean;
}

function TilgangaColorFilter({ id, isDark }: { id: string; isDark: boolean }) {
  if (isDark) {
    return (
      <svg aria-hidden="true" width="0" height="0" className="absolute overflow-hidden pointer-events-none">
        <defs>
          <filter id={id} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.42 0 0 0 0.52  0 0.48 0 0 0.55  0 0 0.58 0 0.62  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.18" intercept="0.1" />
              <feFuncG type="linear" slope="1.22" intercept="0.12" />
              <feFuncB type="linear" slope="1.28" intercept="0.16" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute overflow-hidden pointer-events-none">
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.58 0 0 0 0  0 0.64 0 0 0  0 0 0.78 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.08" intercept="-0.04" />
            <feFuncG type="linear" slope="1.1" intercept="-0.05" />
            <feFuncB type="linear" slope="1.12" intercept="-0.03" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}

export default function TilgangaLogo({
  className = "",
  variant = "header",
  isDark = false,
}: TilgangaLogoProps) {
  const filterId = useId().replace(/:/g, "");
  const sizeClass =
    variant === "header"
      ? "h-14 sm:h-20 md:h-16 lg:h-[3.6rem] xl:h-16 2xl:h-[4.2rem] w-auto max-w-[8.5rem] sm:max-w-[11rem] md:max-w-[8.8rem] lg:max-w-[8.8rem] xl:max-w-none"
      : "h-12 sm:h-14 md:h-16 w-auto";

  const colorFilter = isDark
    ? `url(#${filterId}) brightness(1.12) contrast(1.05) saturate(1.08)`
    : `url(#${filterId}) contrast(1.15) saturate(1.2)`;

  return (
    <span className="header-tilganga-box relative inline-flex shrink-0 items-stretch m-0 p-0">
      <TilgangaColorFilter id={filterId} isDark={isDark} />
      <Image
        src="/tilganga.png"
        alt={TILGANGA_LOGO_ALT}
        width={480}
        height={180}
        className={`block shrink-0 object-contain rounded-none ${sizeClass} ${
          isDark ? "mix-blend-lighten" : ""
        } ${className}`.trim()}
        style={{ filter: colorFilter }}
      />
    </span>
  );
}
