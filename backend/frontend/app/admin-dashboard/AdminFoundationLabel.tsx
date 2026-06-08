const FOUNDATION_NAME = "Ramlal Golchha Eye Hospital Foundation";

interface AdminFoundationLabelProps {
  isDark: boolean;
  variant?: "header" | "sidebar";
  className?: string;
}

export default function AdminFoundationLabel({
  isDark,
  variant = "header",
  className = "",
}: AdminFoundationLabelProps) {
  const colorClass = isDark ? "text-sky-300" : "text-blue-900";
  const variantClass =
    variant === "header"
      ? "text-xs sm:text-[13px] font-medium tracking-[0.04em] leading-snug"
      : "text-[10px] font-semibold tracking-[0.03em] leading-snug";

  return (
    <p
      className={`${variantClass} ${colorClass} text-pretty ${className}`.trim()}
      title={FOUNDATION_NAME}
    >
      {FOUNDATION_NAME}
    </p>
  );
}
