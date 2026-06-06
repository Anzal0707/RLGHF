"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, CheckCircle2 } from "lucide-react";

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
}: HospitalRatingPanelProps) {
  const [selected, setSelected] = useState<EmojiOption | null>(null);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (variant !== "inline" || resetToken === 0) return;
    setSelected(null);
    setText("");
  }, [resetToken, variant]);
  const tr = HOSPITAL_RATING_TR[lang] ?? HOSPITAL_RATING_TR.en;
  const displayTitle = title ?? tr.title;
  const displaySubtitle = subtitle ?? tr.subtitle;
  const isInline = variant === "inline";
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
    ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/10"
    : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/10";
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
        className={`${sendRatingButtonBase} ${enabled ? sendRatingButtonActive : sendRatingButtonInactive}`}
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

  return (
    <>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={tr.closeAria}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors cursor-pointer z-10 ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div
        className={`flex flex-col ${
          isInline ? "items-start text-left gap-4" : "items-center text-center gap-2 mb-3 xl:gap-1.5 xl:mb-2"
        }`}
      >
        {!isInline && (
          <div className="w-14 h-14 xl:w-12 xl:h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20">
            <svg
              className="w-8 h-8 xl:w-7 xl:h-7 text-slate-950"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={isInline ? "w-full relative" : "px-4 max-w-2xl mx-auto"}
        >
          {isRated && isInline && (
            <div
              className={`absolute top-0 right-0 z-30 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md ${
                isDark
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" aria-hidden />
              <span>{ratedBadge}</span>
            </div>
          )}
          <h2
            id={titleId}
            className={
              isInline
                ? `text-xl sm:text-2xl font-extrabold tracking-tight leading-snug ${isRated ? "pr-24" : ""} ${
                    isDark
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400"
                      : "text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600"
                  }`
                : `text-2xl sm:text-3xl lg:text-4xl xl:text-3xl font-extrabold tracking-normal leading-snug ${
                    isDark
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400"
                      : "text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600"
                  }`
            }
          >
            {displayTitle}
          </h2>
          <p
            className={`${
              isInline ? "text-sm sm:text-base mt-2" : "text-base sm:text-lg mt-3 xl:mt-2 xl:text-base"
            } leading-relaxed font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            {displaySubtitle}
          </p>
          {headerExtra && <div className={`mt-3 ${isInline ? "" : "flex justify-center"}`}>{headerExtra}</div>}
        </motion.div>
      </div>

      <div
        className={`mt-4 sm:mt-5 w-full ${
          isInline ? "max-w-4xl" : "max-w-3xl lg:max-w-4xl mx-auto"
        }`}
      >
        <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full items-end">
          {HOSPITAL_EMOJI_OPTIONS.map((opt) => {
            const isActive = selected?.value === opt.value;
            return (
              <div
                key={opt.value}
                className="group flex flex-col items-center justify-end gap-1.5 sm:gap-2 min-w-0 w-full"
              >
                <span
                  className={`w-full text-center text-[0.625rem] leading-tight sm:text-xs md:text-sm font-bold tracking-tight px-0.5 transition-colors duration-200 ${
                    isActive
                      ? isDark
                        ? "text-teal-300"
                        : "text-teal-700"
                      : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
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
                  className={`inline-flex items-center justify-center rounded-xl border-2 transition-colors leading-none aspect-square w-full max-w-[3.25rem] sm:max-w-[3.75rem] md:max-w-[4.5rem] lg:max-w-[4.75rem] text-[1.75rem] sm:text-4xl md:text-5xl ${
                    isActive
                      ? isDark
                        ? "bg-teal-500/15 border-teal-400 shadow-md shadow-teal-500/20 cursor-pointer"
                        : "bg-teal-50 border-teal-500 shadow-md shadow-teal-500/15 cursor-pointer"
                      : isDark
                        ? "bg-slate-800/70 border-slate-600 hover:border-teal-400/80 hover:bg-slate-800 cursor-pointer"
                        : "border-slate-300 hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer"
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
            className="mt-3 xl:mt-2 space-y-2 overflow-hidden w-full"
          >
            {selected.type === "complaint" ? (
              <div className="space-y-4 xl:space-y-3">
                <div
                  className={`p-4 xl:p-3 rounded-xl text-sm sm:text-base font-medium ${
                    isInline ? "text-left" : "text-center"
                  } ${isDark ? "bg-teal-500/10 text-teal-200" : "bg-teal-50 text-teal-800"}`}
                >
                  {tr.complaintPrompt}
                </div>
                <div className="flex flex-col items-stretch gap-3 w-full">
                  {renderSendRatingButton()}
                  <button
                    type="button"
                    onClick={handleHaveComplaint}
                    className={`w-full px-4 py-3.5 sm:py-4 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-3 text-sm sm:text-base ${
                      isDark
                        ? "bg-slate-800/50 border-2 border-teal-500 hover:bg-teal-600 hover:shadow-lg text-slate-200 hover:text-slate-950"
                        : "bg-slate-50 border-2 border-emerald-500 hover:bg-teal-600 hover:shadow-lg text-slate-800 hover:text-white"
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
              <div className="space-y-3 xl:space-y-2.5">
                <div
                  className={`p-3.5 xl:p-3 rounded-xl text-sm sm:text-base font-medium ${
                    isInline ? "text-left" : "text-center"
                  } ${isDark ? "bg-teal-500/10 text-teal-200" : "bg-teal-50 text-teal-800"}`}
                >
                  {tr.prompts[selected.value]}
                </div>
                <label
                  htmlFor={`hospital-rating-text-${titleId}`}
                  className={`block text-xs sm:text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}
                >
                  {tr.helper}
                </label>
                <div className="flex flex-col gap-3 w-full">
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
                    className={`w-full px-4 py-3 rounded-xl border-2 resize-none text-sm sm:text-base transition-colors focus:outline-none ${
                      isDark
                        ? "bg-slate-800/70 border-teal-500/60 text-slate-100 placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/25"
                        : "bg-white border-emerald-500/50 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                  {renderSendRatingButton()}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
