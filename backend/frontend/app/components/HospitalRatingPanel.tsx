"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, CheckCircle2, X } from "lucide-react";
import AppLogo from "./AppLogo";

export type LangKey = "en" | "ne" | "hi";

interface EmojiOption {
  value: number;
  emoji: string;
  type: "complaint" | "feedback" | "praise";
}

export interface HospitalRatingPayload {
  rating: number;
  emoji: string;
  label: string;
  type: EmojiOption["type"];
  text: string;
}

export const HOSPITAL_EMOJI_OPTIONS: EmojiOption[] = [
  { value: 1, emoji: "😞", type: "complaint" },
  { value: 2, emoji: "🙁", type: "complaint" },
  { value: 3, emoji: "🙂", type: "feedback" },
  { value: 4, emoji: "😊", type: "feedback" },
  { value: 5, emoji: "☺️", type: "praise" },
];

export const HOSPITAL_RATING_TR: Record<
  LangKey,
  {
    title: string;
    subtitle: string;
    helper: string;
    closeAria: string;
    complaintPrompt: string;
    complaintYes: string;
    complaintNo: string;
    labels: Record<number, string>;
    prompts: Record<number, string>;
    placeholders: Record<number, string>;
  }
> = {
  ne: {
    title: "हाम्रो अस्पतालमा तपाईंको समग्र अनुभव कस्तो रह्यो?",
    subtitle: "तपाईंको मूल्याङ्कन र प्रतिक्रियाले हामीलाई हाम्रो हेरचाह र सेवाहरूको गुणस्तर बढाउन प्रेरित गर्दछ।",
    helper: "थप प्रतिक्रिया (लेख्न मन लागेमा मात्र)",
    closeAria: "बन्द गर्नुहोस्",
    complaintPrompt: "तपाईंको असन्तुष्टिप्रति हामी क्षमाप्रार्थी छौं। सेवा सुधारका लागि कृपया आफ्नो गुनासो साझा गरिदिनुहोला।",
    complaintYes: "गुनासो दर्ता गर्नुहोस्!",
    complaintNo: "मूल्याङ्कन पठाउनुहोस्",
    labels: { 1: "धेरै खराब", 2: "खराब", 3: "ठीकै", 4: "राम्रो", 5: "उत्कृष्ट" },
    prompts: {
      1: "हामी साँच्चै दुःखी छौं। के गलत भयो भन्नुहोस् ताकि हामी कारबाही गर्न सकौं।",
      2: "हामी अझ राम्रो गर्न चाहन्छौं। केले निराश बनायो भन्नुहोस्।",
      3: "आउनुभएकोमा धन्यवाद। हामी कसरी सुधार गर्न सक्छौं प्रतिक्रिया दिनुहोस्।",
      4: "तपाईंको राम्रो अनुभव भएकोमा खुशी छौं! थप सुधारका लागि केही सुझाव?",
      5: "उत्कृष्ट! तपाईंलाई कुन कुराले सबैभन्दा प्रभावित गर्‍यो भन्नुहोस्।",
    },
    placeholders: {
      1: "के गलत भयो वर्णन गर्नुहोस्…",
      2: "के सुधार्नुपर्छ भन्नुहोस्…",
      3: "तपाईंको प्रतिक्रिया लेख्नुहोस्…",
      4: "अझ राम्रो के गर्न सक्थ्यौं?",
      5: "केले सबैभन्दा प्रभावित गर्‍यो?",
    },
  },
  hi: {
    title: "हमारे अस्पताल में आपका समग्र अनुभव कैसा रहा?",
    subtitle: "आपका मूल्यांकन और प्रतिक्रिया हमें अपनी देखभाल और सेवाओं की गुणवत्ता बेहतर बनाने के लिए प्रेरित करती है।",
    helper: "अतिरिक्त प्रतिक्रिया (केवल यदि आप चाहें)",
    closeAria: "बंद करें",
    complaintPrompt: "आपके असंतोष के लिए हम क्षमाप्रार्थी हैं। सेवा में सुधार के लिए कृपया अपनी शिकायत साझा करें।",
    complaintYes: "शिकायत दर्ज करें!",
    complaintNo: "मूल्यांकन भेजें",
    labels: { 1: "बहुत खराब", 2: "खराब", 3: "ठीक-ठाक", 4: "अच्छा", 5: "उत्कृष्ट" },
    prompts: {
      1: "हमें वास्तव में खेद है। कृपया बताएं क्या गलत हुआ ताकि हम कार्रवाई कर सकें।",
      2: "हम बेहतर करना चाहते हैं। कृपया बताएं किस बात ने निराश किया।",
      3: "आने के लिए धन्यवाद। हम कैसे सुधार कर सकते हैं, अपनी प्रतिक्रिया दें।",
      4: "खुशी है कि आपका अनुभव अच्छा रहा! और बेहतर करने के लिए कोई सुझाव?",
      5: "अद्भुत! बताएं किस बात ने आपको सबसे ज्यादा प्रभावित किया।",
    },
    placeholders: {
      1: "क्या गलत हुआ बताएं…",
      2: "हमें क्या सुधारना चाहिए बताएं…",
      3: "अपनी प्रतिक्रिया साझा करें…",
      4: "हम और बेहतर क्या कर सकते थे?",
      5: "किस बात ने सबसे ज्यादा प्रभावित किया?",
    },
  },
  en: {
    title: "How was your overall experience with our hospital?",
    subtitle: "Your rating and feedback motivate us to enhance our quality of care and services.",
    helper: "Additional feedback (optional)",
    closeAria: "Close",
    complaintPrompt: "We apologize for your dissatisfaction. Please share your complaint to help us improve our services.",
    complaintYes: "File a Complaint!",
    complaintNo: "Send rating",
    labels: { 1: "Very bad", 2: "Bad", 3: "Okay", 4: "Good", 5: "Excellent" },
    prompts: {
      1: "We are truly sorry. Please tell us what went wrong so we can act on your complaint.",
      2: "We want to do better. Please tell us what disappointed you.",
      3: "Thanks for visiting. Share any feedback on how we can improve.",
      4: "Glad you had a good visit! Any feedback to help us improve further?",
      5: "Wonderful! Tell us what impressed you the most.",
    },
    placeholders: {
      1: "Describe what went wrong…",
      2: "Tell us what we should fix…",
      3: "Share your feedback…",
      4: "Anything we could do even better?",
      5: "What impressed you the most?",
    },
  },
};

const PENDULUM_MOTION = {
  animate: { rotate: [-10, 10, -10] },
  transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const },
  style: { transformOrigin: "50% 50%" },
};

function RatingTitleWithPendulumQuestion({
  title,
  pendulumClassName = "",
  variant = "inline",
}: {
  title: string;
  pendulumClassName?: string;
  variant?: "modal" | "inline";
}) {
  const trimmed = title.trimEnd();
  const hasQuestion = trimmed.endsWith("?");

  if (!hasQuestion) {
    return <>{title}</>;
  }
  return (
    <>
      {trimmed.slice(0, -1)}
      <motion.span
        {...PENDULUM_MOTION}
        className={`inline-block ${variant === "inline" ? "ml-0.5 sm:ml-1.5" : "ml-1.5 sm:ml-2"} ${pendulumClassName}`.trim()}
      >
        ?
      </motion.span>
    </>
  );
}

function playPop() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
    osc.onended = () => ctx.close();
  } catch {
    /* audio not supported */
  }
}

export interface HospitalRatingPanelProps {
  isDark: boolean;
  lang: LangKey;
  onSubmit: (data: HospitalRatingPayload) => void | Promise<void>;
  onHaveComplaint: (data: HospitalRatingPayload) => void;
  title?: string;
  subtitle?: string;
  headerExtra?: ReactNode;
  variant?: "modal" | "inline";
  showCloseButton?: boolean;
  onClose?: () => void;
  titleId?: string;
  /** Increment to collapse expanded feedback/complaint UI back to emoji-only (inline card). */
  resetToken?: number;
  isRated?: boolean;
  ratedBadge?: string;
  /** Inline card: parent renders mobile close button at container edge. */
  onInlineExpandedChange?: (expanded: boolean) => void;
  /** Department rating modal: mobile-only tighter layout. */
  mobileCompact?: boolean;
}

export default function HospitalRatingPanel({
  isDark,
  lang,
  onSubmit,
  onHaveComplaint,
  title,
  subtitle,
  headerExtra,
  variant = "modal",
  showCloseButton = false,
  onClose,
  titleId = "hospital-rating-title",
  resetToken = 0,
  isRated = false,
  ratedBadge = "Rated",
  onInlineExpandedChange,
  mobileCompact = false,
}: HospitalRatingPanelProps) {
  const [selected, setSelected] = useState<EmojiOption | null>(null);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const collapseExpanded = () => {
    setSelected(null);
    setText("");
  };

  useEffect(() => {
    if (variant !== "inline" || resetToken === 0) return;
    collapseExpanded();
  }, [resetToken, variant]);
  const tr = HOSPITAL_RATING_TR[lang] ?? HOSPITAL_RATING_TR.en;
  const displayTitle = title ?? tr.title;
  const displaySubtitle = subtitle ?? tr.subtitle;
  const isInline = variant === "inline";
  const showInlineClose = isInline && selected !== null;

  useEffect(() => {
    if (!isInline) return;
    onInlineExpandedChange?.(showInlineClose);
  }, [isInline, showInlineClose, onInlineExpandedChange]);

  const titleGradientClass = isInline
    ? "bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent"
    : isDark
      ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-sky-400"
      : "text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600";
  const canSubmit = selected !== null;

  const buildPayload = (): HospitalRatingPayload | null => {
    if (!selected) return null;
    return {
      rating: selected.value,
      emoji: selected.emoji,
      label: tr.labels[selected.value],
      type: selected.type,
      text: text.trim(),
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit(payload));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHaveComplaint = () => {
    const payload = buildPayload();
    if (payload) onHaveComplaint(payload);
  };

  const sendRatingButtonBase =
    "w-full px-4 py-3.5 sm:py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-sm sm:text-base active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";
  const sendRatingButtonActive = isDark
    ? "bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950 shadow-lg shadow-blue-500/10"
    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10";
  const sendRatingButtonInactive = isDark
    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
    : "bg-slate-200 text-slate-400 cursor-not-allowed";

  const renderSendRatingButton = (label: string = tr.complaintNo) => {
    const enabled = canSubmit && !isSubmitting;
    return (
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!enabled}
        aria-label="Submit rating"
        aria-busy={isSubmitting}
        className={`${sendRatingButtonBase}${modalMobileActionBtnClass} ${enabled ? sendRatingButtonActive : sendRatingButtonInactive}`}
      >
        {enabled ? (
          <motion.div
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ originY: 1, originX: 0.5 }}
            className="inline-flex shrink-0"
            aria-hidden
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        ) : (
          <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden />
        )}
        <span>{label}</span>
      </button>
    );
  };

  const inlineCloseButton = (
    <button
      type="button"
      onClick={collapseExpanded}
      aria-label={tr.closeAria}
      className={`shrink-0 inline-flex items-center justify-center min-w-10 min-h-10 w-10 h-10 rounded-lg border transition-colors cursor-pointer antialiased ${
        isDark
          ? "text-slate-200 bg-slate-800/95 border-slate-600 hover:bg-blue-600 hover:border-blue-500 hover:text-white"
          : "text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-blue-600 hover:border-blue-600 hover:text-white"
      }`}
    >
      <X className="w-5 h-5 shrink-0" strokeWidth={2.5} aria-hidden />
    </button>
  );

  const mobileHeaderInteractive = isInline && (isRated || showInlineClose);

  const inlineTitleBase =
    "font-black bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent leading-snug";

  const desktopTitleReserve =
    isRated && showInlineClose
      ? " sm:pr-28 md:pr-32"
      : isRated
        ? " sm:pr-24 md:pr-28"
        : showInlineClose
          ? " sm:pr-14 md:pr-16"
          : "";

  const ratedBadgeEl =
    isRated && isInline ? (
      <div
        className={`flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md ${
          isDark
            ? "bg-green-500/20 text-green-400 border border-green-500/40"
            : "bg-green-50 text-green-600 border border-green-300"
        }`}
      >
        <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isDark ? "text-green-400" : "text-green-600"}`} aria-hidden />
        <span className="whitespace-nowrap">{ratedBadge}</span>
      </div>
    ) : null;

  const titleContent = (
    <RatingTitleWithPendulumQuestion
      title={displayTitle}
      pendulumClassName={titleGradientClass}
      variant={variant}
    />
  );

  const mobileTitleClass = mobileHeaderInteractive
    ? "hospital-rating-title-mobile-active"
    : "hospital-rating-title-mobile-default max-sm:px-0.5";

  const modalMobileTitleClass =
    mobileCompact && !isInline
      ? " department-rating-modal-title max-md:text-[1.2rem] max-md:leading-snug"
      : "";
  const modalMobileSubtitleClass =
    mobileCompact && !isInline ? " max-md:text-sm max-md:mt-1.5" : "";
  const modalMobileHeaderGapClass =
    mobileCompact && !isInline ? " max-md:gap-1.5 max-md:mb-2" : "";
  const modalMobileHeaderExtraClass =
    mobileCompact && !isInline ? " max-md:mt-2" : "";
  const modalMobileLogoClass =
    mobileCompact && !isInline ? " max-md:scale-[0.8] max-md:-my-2" : "";
  const modalMobileEmojiSectionClass =
    mobileCompact && !isInline ? " max-md:mt-3" : "";
  const modalMobileEmojiGridClass =
    mobileCompact && !isInline ? " max-md:gap-2" : "";
  const modalMobileEmojiBtnClass =
    mobileCompact && !isInline
      ? " max-md:max-w-[2.75rem] max-md:text-3xl"
      : "";
  const modalMobileExpandedClass =
    mobileCompact && !isInline ? " max-md:mt-2 max-md:space-y-2" : "";
  const modalMobileComplaintBlockClass =
    mobileCompact && !isInline ? " max-md:space-y-2.5" : "";
  const modalMobilePromptClass =
    mobileCompact && !isInline ? " max-md:p-3 max-md:text-sm" : "";
  const modalMobileActionsClass =
    mobileCompact && !isInline ? " max-md:gap-2" : "";
  const modalMobileActionBtnClass =
    mobileCompact && !isInline ? " max-md:py-3" : "";

  const inlineHeaderEl = isInline ? (
    <div
      className={`relative w-full min-w-0 ${showInlineClose ? "max-sm:pr-12" : ""} ${
        mobileHeaderInteractive ? "max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-2" : ""
      }`}
    >
      {(isRated || showInlineClose) && (
        <div className="hidden sm:flex absolute top-0 right-0 z-40 flex-col items-end gap-2">
          {isRated ? ratedBadgeEl : null}
          {showInlineClose ? inlineCloseButton : null}
        </div>
      )}
      <h2
        id={titleId}
        className={`${inlineTitleBase} sm:text-2xl min-w-0 transition-[text-align] duration-200 ${mobileTitleClass}${desktopTitleReserve}`}
      >
        {titleContent}
      </h2>
      {isRated ? <div className="shrink-0 sm:hidden">{ratedBadgeEl}</div> : null}
    </div>
  ) : (
    <h2
      id={titleId}
      className={`text-2xl sm:text-3xl lg:text-4xl xl:text-3xl font-extrabold tracking-normal leading-snug${
        modalMobileTitleClass
      } ${
        isDark
          ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-sky-400"
          : "text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600"
      }`}
    >
      {titleContent}
    </h2>
  );

  return (
    <div className="relative w-full">
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={tr.closeAria}
          className={`absolute top-3 right-3 p-2 rounded-lg border transition-colors cursor-pointer z-20 antialiased${
            mobileCompact && !isInline ? " max-md:top-2 max-md:right-2 max-md:p-1.5" : ""
          } ${
            isDark
              ? "text-slate-100 bg-slate-800 border-slate-600 hover:text-white hover:bg-slate-700"
              : "text-slate-800 bg-slate-100 border-slate-200 hover:text-slate-950 hover:bg-slate-200"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div
        className={`flex flex-col ${
          isInline
            ? `items-start text-left gap-4${
                mobileHeaderInteractive ? "" : " max-sm:items-center max-sm:text-center"
              }`
            : `items-center text-center gap-2 mb-3 xl:gap-1.5 xl:mb-2${modalMobileHeaderGapClass}`
        }`}
      >
        {!isInline && (
          <div className={`shrink-0${modalMobileLogoClass}`}>
            <AppLogo size="rating" />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={isInline ? "w-full relative" : "px-4 max-w-2xl mx-auto max-md:px-2"}
        >
          {inlineHeaderEl}
          <p
            className={`${
              isInline ? "text-sm sm:text-base mt-2" : "text-base sm:text-lg mt-3 xl:mt-2 xl:text-base"
            } leading-relaxed font-medium ${isDark ? "text-slate-300" : "text-slate-600"}${modalMobileSubtitleClass}${
              isInline && !mobileHeaderInteractive ? " max-sm:text-center max-sm:px-0.5" : ""
            }`}
          >
            {displaySubtitle}
          </p>
          {headerExtra && (
            <div className={`mt-3${modalMobileHeaderExtraClass} ${isInline ? "" : "flex justify-center"}`}>
              {headerExtra}
            </div>
          )}
        </motion.div>
      </div>

      <div
        className={`mt-4 sm:mt-5 w-full${
          modalMobileEmojiSectionClass
        } ${isInline ? "max-w-4xl" : "max-w-3xl lg:max-w-4xl mx-auto"}`}
      >
        <div className={`grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full items-end${modalMobileEmojiGridClass}`}>
          {HOSPITAL_EMOJI_OPTIONS.map((opt) => {
            const isActive = selected?.value === opt.value;
            return (
              <div
                key={opt.value}
                className={`group flex flex-col items-center justify-end gap-1.5 sm:gap-2 min-w-0 w-full${
                  mobileCompact && !isInline ? " max-md:gap-1" : ""
                }`}
              >
                <span
                  className={`w-full text-center text-xs sm:text-sm font-bold leading-snug px-0.5 transition-colors duration-200 antialiased ${
                    isActive
                      ? isDark
                        ? "text-blue-200"
                        : "text-blue-800"
                      : isDark
                        ? "text-slate-200"
                        : "text-slate-700"
                  }`}
                >
                  {tr.labels[opt.value]}
                </span>
                <motion.button
                  type="button"
                  onClick={() => {
                    playPop();
                    setSelected(opt);
                  }}
                  aria-label={tr.labels[opt.value]}
                  aria-pressed={isActive}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className={`inline-flex items-center justify-center rounded-xl border-2 transition-colors leading-none aspect-square w-full max-w-[3.25rem] sm:max-w-[3.75rem] md:max-w-[4.5rem] lg:max-w-[4.75rem] text-[1.75rem] sm:text-4xl md:text-5xl${modalMobileEmojiBtnClass} ${
                    isActive
                      ? isDark
                        ? "bg-blue-500/15 border-blue-400 shadow-md shadow-blue-500/20 cursor-pointer"
                        : "bg-blue-50 border-blue-500 shadow-md shadow-blue-500/15 cursor-pointer"
                      : isDark
                        ? "bg-slate-800/70 border-slate-600 hover:border-blue-400/80 hover:bg-slate-800 cursor-pointer"
                        : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer"
                  }`}
                >
                  {opt.emoji}
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.value}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-3 xl:mt-2 space-y-2 overflow-hidden w-full${modalMobileExpandedClass}`}
          >
            {selected.type === "complaint" ? (
              <div className={`space-y-4 xl:space-y-3${modalMobileComplaintBlockClass}`}>
                <div
                  className={`p-4 xl:p-3 rounded-xl text-sm sm:text-base font-medium${
                    modalMobilePromptClass
                  } ${isInline ? "text-left" : "text-center"} ${
                    isDark ? "bg-blue-500/10 text-blue-200" : "bg-blue-50 text-blue-800"
                  }`}
                >
                  {tr.complaintPrompt}
                </div>
                <div className={`flex flex-col items-stretch gap-3 w-full${modalMobileActionsClass}`}>
                  {renderSendRatingButton()}
                  <button
                    type="button"
                    onClick={handleHaveComplaint}
                    className={`w-full px-4 py-3.5 sm:py-4 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-3 text-sm sm:text-base${modalMobileActionBtnClass} ${
                      isDark
                        ? "bg-slate-800/50 border-2 border-blue-500 hover:bg-blue-600 hover:shadow-lg text-slate-200 hover:text-slate-950"
                        : "bg-slate-50 border-2 border-sky-500 hover:bg-blue-600 hover:shadow-lg text-slate-800 hover:text-white"
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: [-10, 10, -10] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      style={{ originY: 1, originX: 0.5 }}
                      className="inline-flex shrink-0"
                      aria-hidden
                    >
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                    <span>{tr.complaintYes}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`space-y-3 xl:space-y-2.5${
                  mobileCompact && !isInline ? " max-md:space-y-2" : ""
                }`}
              >
                <div
                  className={`p-3.5 xl:p-3 rounded-xl text-sm sm:text-base font-medium${
                    modalMobilePromptClass
                  } ${isInline ? "text-left" : "text-center"} ${
                    isDark ? "bg-blue-500/10 text-blue-200" : "bg-blue-50 text-blue-800"
                  }`}
                >
                  {tr.prompts[selected.value]}
                </div>
                <label
                  htmlFor={`hospital-rating-text-${titleId}`}
                  className={`block text-xs sm:text-sm font-semibold${
                    mobileCompact && !isInline ? " max-md:text-xs" : ""
                  } ${isDark ? "text-slate-300" : "text-slate-500"}`}
                >
                  {tr.helper}
                </label>
                <div className={`flex flex-col gap-3 w-full${modalMobileActionsClass}`}>
                  <textarea
                    id={`hospital-rating-text-${titleId}`}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      const el = e.target;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                    placeholder={tr.placeholders[selected.value]}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-xl border-2 resize-none text-sm sm:text-base transition-colors focus:outline-none${
                      mobileCompact && !isInline ? " max-md:py-2.5 max-md:min-h-[3.5rem]" : ""
                    } ${
                      isDark
                        ? "bg-slate-800/70 border-blue-500/60 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25"
                        : "bg-white border-sky-500/50 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    }`}
                  />
                  {renderSendRatingButton()}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
