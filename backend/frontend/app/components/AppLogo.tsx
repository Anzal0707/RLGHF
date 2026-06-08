"use client";

import Image from "next/image";

const CONTAINER_STYLES = {
  navbar: "h-14 sm:h-20 md:h-20 lg:h-[4.5rem] xl:h-20 2xl:h-[5.25rem]",
  sidebar: "h-14 sm:h-16 md:h-[72px]",
  login: "h-24 sm:h-28 md:h-32",
  rating: "h-20 sm:h-24 md:h-28",
  sm: "h-14 sm:h-16",
} as const;

const CONTAINER_FRAME =
  "header-logo-box inline-flex items-center justify-center shrink-0 overflow-hidden m-0 p-0 box-border rounded-none bg-white dark:bg-slate-900/60 max-w-full";

export type AppLogoSize = keyof typeof CONTAINER_STYLES;

interface AppLogoProps {
  size?: AppLogoSize;
  className?: string;
  priority?: boolean;
}

export default function AppLogo({
  size = "navbar",
  className = "",
  priority = false,
}: AppLogoProps) {
  return (
    <div className={`${CONTAINER_FRAME} ${CONTAINER_STYLES[size]} ${className}`.trim()}>
      <Image
        src="/hd-logo.png"
        alt="Ramlal Golchha Eye Hospital Foundation"
        width={512}
        height={512}
        priority={priority}
        className="block h-full w-auto max-w-full m-0 p-0 object-contain rounded-none"
      />
    </div>
  );
}
