"use client";

import AppLogo from "./AppLogo";
import TilgangaLogo from "./TilgangaLogo";
import {
  HOSPITAL_NAME_LINE1,
  HOSPITAL_NAME_LINE2,
  HOSPITAL_NAME_SINGLE_LINE,
  MANAGEMENT_LINE1,
  MANAGEMENT_LINE2,
} from "../lib/hospitalBranding";

export type HospitalHeaderVariant = "navbar" | "login";

interface HospitalHeaderBrandingProps {
  variant?: HospitalHeaderVariant;
  isDark?: boolean;
  showLogo?: boolean;
  logoPriority?: boolean;
  className?: string;
}

function HospitalNameBlock({ navbar = false }: { navbar?: boolean }) {
  if (navbar) {
    return (
      <div className="hospital-brand-block">
        <div className="hospital-brand-lines-mobile">
          <p className="hospital-brand-name-line">{HOSPITAL_NAME_LINE1}</p>
          <p className="hospital-brand-name-line">{HOSPITAL_NAME_LINE2}</p>
        </div>
        <p className="hospital-brand-name-single-line header-brand-name-half-md">
          {HOSPITAL_NAME_SINGLE_LINE}
        </p>
      </div>
    );
  }

  return (
    <div className="hospital-brand-block">
      <p className="hospital-brand-name-line">{HOSPITAL_NAME_LINE1}</p>
      <p className="hospital-brand-name-line">{HOSPITAL_NAME_LINE2}</p>
    </div>
  );
}

function ManagementText({ centered, navbar }: { centered?: boolean; navbar?: boolean }) {
  const alignment = centered ? "text-center mx-auto" : "";

  if (navbar) {
    return (
      <div className="hospital-brand-management-block header-brand-mgmt-block-half-md">
        <p className={`header-brand-mgmt-half-md ${alignment}`.trim()}>{MANAGEMENT_LINE1}</p>
        <p className={`header-brand-mgmt-half-md ${alignment}`.trim()}>{MANAGEMENT_LINE2}</p>
      </div>
    );
  }

  return (
    <div className={`hospital-brand-management-block ${centered ? "text-center w-full" : ""}`.trim()}>
      <p className={`hospital-brand-management-line ${alignment}`.trim()}>{MANAGEMENT_LINE1}</p>
      <p className={`hospital-brand-management-line ${alignment}`.trim()}>{MANAGEMENT_LINE2}</p>
    </div>
  );
}

export default function HospitalHeaderBranding({
  variant = "navbar",
  isDark = false,
  showLogo = true,
  logoPriority = false,
  className = "",
}: HospitalHeaderBrandingProps) {
  const isLogin = variant === "login";

  if (isLogin) {
    return (
      <div className={`flex flex-col items-center gap-3 w-full ${className}`.trim()}>
        {showLogo && <AppLogo size="login" priority={logoPriority} />}
        <div className="flex flex-col items-center gap-2 w-full max-w-2xl">
          <div className="hospital-brand-block items-center text-center">
            <p className="hospital-brand-name-line text-center">{HOSPITAL_NAME_LINE1}</p>
            <p className="hospital-brand-name-line text-center">{HOSPITAL_NAME_LINE2}</p>
          </div>
          <ManagementText centered />
          <TilgangaLogo variant="login" isDark={isDark} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hospital-brand-text-cluster hospital-brand-text-cluster--navbar header-brand-cluster-half-md items-start min-w-0 md:max-lg:gap-0 lg:items-stretch lg:w-full ${className}`.trim()}
    >
      <HospitalNameBlock navbar />
      <ManagementText navbar />
    </div>
  );
}
