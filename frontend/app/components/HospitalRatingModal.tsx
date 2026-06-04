"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";
import ModalShell from "./ModalShell";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LangKey = "en" | "ne" | "hi";

/** A single emoji rating option and its associated behavior. */
interface EmojiOption {
  /** Numeric rating 1–5 (maps to backend rating scale). */
  value: number;
  /** The emoji shown in the selector. */
  emoji: string;
  /** Intent category derived from the emoji choice. */
  type: "complaint" | "feedback" | "praise";
}

/** Payload emitted to the parent when the user submits a rating. */
export interface HospitalRatingPayload {
  rating: number;
  emoji: string;
  label: string;
  type: EmojiOption["type"];
  text: string;
}

interface HospitalRatingModalProps {
  /** Dark/light theme flag, kept in sync with the host page. */
  isDark: boolean;
  /** Active language, controlled by the header language switcher. */
  lang: LangKey;
  /** Pushes the modal panel below the header/menu area. */
  topOffsetPx?: number;
  /** Called to send the rating DIRECTLY to admin (no complaint). May be async. */
  onSubmit: (data: HospitalRatingPayload) => void | Promise<void>;
  /** Called when the user chooses to file a complaint (negative ratings). */
  onHaveComplaint: (data: HospitalRatingPayload) => void;
  /** Called when the user dismisses via the top-right X button. */
  onClose: () => void;
  /** Override default hospital-wide title (e.g. department rating question). */
  title?: string;
  /** Override default subtitle. */
  subtitle?: string;
  /** Optional content below subtitle (e.g. department name chip). */
  headerExtra?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Emoji → behavior mapping (exact spec)
//   😞 Very bad  → complaint
//   😐 Bad       → complaint
//   🙂 Okay      → feedback
//   😊 Good      → feedback
//   😍 Excellent → praise ("what impressed you")
// ─────────────────────────────────────────────────────────────────────────────

const EMOJI_OPTIONS: EmojiOption[] = [
  { value: 1, emoji: "😞", type: "complaint" },
  { value: 2, emoji: "😐", type: "complaint" },
  { value: 3, emoji: "🙂", type: "feedback" },
  { value: 4, emoji: "😊", type: "feedback" },
  { value: 5, emoji: "😍", type: "praise" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Localized strings (en / ne / hi) — Nepali is the app default.
// labels/prompts/placeholders are indexed by the emoji `value` (1–5).
// ─────────────────────────────────────────────────────────────────────────────

const TR: Record<LangKey, {
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
}> = {
  ne: {
    title: "हाम्रो अस्पतालमा तपाईंको समग्र अनुभव कस्तो रह्यो?",
    subtitle: "तपाईंको मूल्याङ्कन र प्रतिक्रियाले हामीलाई हाम्रो हेरचाह र सेवाहरूको गुणस्तर बढाउन प्रेरित गर्दछ।",
    helper: "थप प्रतिक्रिया (लेख्न मन लागेमा मात्र)",
    closeAria: "बन्द गर्नुहोस्",
    complaintPrompt: "तपाईंको असन्तुष्टिप्रति हामी क्षमाप्रार्थी छौं। सेवा सुधारका लागि कृपया आफ्नो गुनासो साझा गरिदिनुहोला।",
    complaintYes: "गुनासो दर्ता गर्नुहोस्",
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
    complaintYes: "शिकायत दर्ज करें",
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
    complaintYes: "Yes, file a complaint",
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

// ─────────────────────────────────────────────────────────────────────────────
// Click sound — generated with the Web Audio API so no asset file is required.
// Triggered on user gesture (click), which satisfies browser autoplay policies.
// ─────────────────────────────────────────────────────────────────────────────

function playPop() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    /* audio not supported — silently ignore */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

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
  const [selected, setSelected] = useState<EmojiOption | null>(null);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tr = TR[lang] ?? TR.en;
  const displayTitle = title ?? tr.title;
  const displaySubtitle = subtitle ?? tr.subtitle;

  // Text is OPTIONAL — a rating can be submitted with just an emoji selected.
  // (Complaint/feedback text is never required to send a rating.)
  const canSubmit = selected !== null;

  const handleSelect = (opt: EmojiOption) => {
    playPop();           // play click sound on every emoji tap
    setSelected(opt);
  };

  // Build the payload for the currently selected emoji.
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

  // Send the rating DIRECTLY to admin (positive ratings, or "just send my rating").
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

  // User wants to file a complaint → reaction is saved in state by the parent
  // and the existing complaint flow opens. Nothing is posted yet.
  const handleHaveComplaint = () => {
    const payload = buildPayload();
    if (payload) onHaveComplaint(payload);
  };

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const panel = isDark
    ? "bg-slate-900 border-slate-600 shadow-2xl shadow-black/50"
    : "bg-white border-slate-200 shadow-2xl shadow-slate-400/20";
  const heading = isDark ? "text-white" : "text-slate-900";
  const sub = isDark ? "text-slate-300" : "text-slate-500";
  const inputCls = isDark
    ? "bg-slate-800/80 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-teal-400"
    : "bg-[#fbfdfd] border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-600";

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
          {/* X close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.closeAria}
            className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors cursor-pointer z-10 ${
              isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo + title */}
          <div className="flex flex-col items-center text-center gap-2 mb-3 xl:gap-1.5 xl:mb-2">
            <div className="w-14 h-14 xl:w-12 xl:h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <svg className="w-8 h-8 xl:w-7 xl:h-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="px-4 max-w-2xl mx-auto"
            >
              <h2
                id="hospital-rating-title"
                className={`text-2xl sm:text-3xl lg:text-4xl xl:text-3xl font-extrabold tracking-normal leading-snug ${
                  isDark
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600"
                }`}
              >
                {displayTitle}
              </h2>
              <p className={`text-base sm:text-lg mt-3 xl:mt-2 xl:text-base leading-relaxed font-medium ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}>
                {displaySubtitle}
              </p>
              {headerExtra && (
                <div className="mt-3 flex justify-center">{headerExtra}</div>
              )}
            </motion.div>
          </div>

          {/* Emoji selector — mt-2 clears title, pt-10 reserves space for floating labels above */}
          <div className="flex items-end justify-center gap-1 sm:gap-2 lg:gap-3 xl:gap-2 mt-2 pt-10 pb-2 xl:pt-8 xl:pb-1 xl:mt-1">
            {EMOJI_OPTIONS.map((opt) => {
              const isActive = selected?.value === opt.value;
              return (
                <div
                  key={opt.value}
                  className="group relative flex flex-col items-center shrink-0 w-[4.75rem] sm:w-[5.25rem] lg:w-[6.25rem] xl:w-[5.25rem]"
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 6, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.8 }}
                        className={`absolute -top-10 sm:-top-12 xl:-top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg z-30 pointer-events-none ${
                          isDark ? "bg-teal-500 text-slate-950" : "bg-teal-600 text-white"
                        }`}
                      >
                        {tr.labels[opt.value]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <div className="flex items-end justify-center w-full h-14 sm:h-16 lg:h-[4.75rem] xl:h-16">
                    <motion.button
                      type="button"
                      onClick={() => handleSelect(opt)}
                      aria-label={tr.labels[opt.value]}
                      aria-pressed={isActive}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                      className={`inline-flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl xl:text-5xl rounded-xl border-2 w-14 h-14 sm:w-16 sm:h-16 lg:w-[4.75rem] lg:h-[4.75rem] xl:w-16 xl:h-16 cursor-pointer origin-bottom transition-colors leading-none relative z-0 group-hover:z-20 ${
                        isActive
                          ? isDark
                            ? "bg-teal-500/15 border-teal-400 shadow-md shadow-teal-500/20"
                            : "bg-teal-50 border-teal-500 shadow-md shadow-teal-500/15"
                          :                           isDark
                            ? "bg-slate-800/70 border-slate-600 hover:border-teal-400/80 hover:bg-slate-800"
                            : "border-slate-300 hover:border-teal-500 hover:bg-teal-50/50"
                      }`}
                    >
                      {opt.emoji}
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conditional section after emoji selection */}
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.value}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 xl:mt-2 space-y-2 overflow-hidden"
              >
                {selected.type === "complaint" ? (
                  <div className="space-y-4 xl:space-y-3">
                    <div className={`p-4 xl:p-3 rounded-xl text-sm sm:text-base font-medium text-center ${
                      isDark ? "bg-teal-500/10 text-teal-200" : "bg-teal-50 text-teal-800"
                    }`}>
                      {tr.complaintPrompt}
                    </div>
                    <div className="flex flex-row items-stretch gap-3">
                      <button
                        type="button"
                        onClick={handleHaveComplaint}
                        className={`flex-1 px-3 py-3.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base ${
                          isDark
                            ? "bg-slate-800/50 border-2 border-teal-500 hover:bg-teal-600 hover:shadow-lg text-slate-200 hover:text-slate-950"
                            : "bg-slate-50 border-2 border-emerald-500 hover:bg-teal-600 hover:shadow-lg text-slate-800 hover:text-white"
                        }`}
                      >
                        <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ originY: 1, originX: 0.5 }} className="inline-flex">
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        {tr.complaintYes}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={isSubmitting}
                        className={`flex-1 px-3 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
                          isDark
                            ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/10"
                            : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/10"
                        }`}
                      >
                        <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ originY: 1, originX: 0.5 }} className="inline-flex">
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        {tr.complaintNo}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 xl:space-y-2.5">
                    <div className={`p-3.5 xl:p-3 rounded-xl text-sm sm:text-base font-medium text-center ${
                      isDark ? "bg-teal-500/10 text-teal-200" : "bg-teal-50 text-teal-800"
                    }`}>
                      {tr.prompts[selected.value]}
                    </div>
                    <label htmlFor="hospital-rating-text" className={`block text-xs sm:text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                      {tr.helper}
                    </label>
                    <div className="flex flex-row items-start gap-3">
                      <textarea
                        id="hospital-rating-text"
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                          const el = e.target;
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }}
                        placeholder={tr.placeholders[selected.value]}
                        rows={2}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 resize-none text-sm sm:text-base transition-colors focus:outline-none ${
                          isDark
                            ? "bg-slate-800/70 border-teal-500/60 text-slate-100 placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/25"
                            : "bg-white border-emerald-500/50 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={!canSubmit || isSubmitting}
                        aria-label="Submit rating"
                        aria-busy={isSubmitting}
                        className={`shrink-0 h-12 px-4 sm:px-5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap ${
                          canSubmit && !isSubmitting
                            ? isDark
                              ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/10 active:scale-[0.98] cursor-pointer"
                              : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/10 active:scale-[0.98] cursor-pointer"
                            : isDark
                              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {canSubmit ? (
                          <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ originY: 1, originX: 0.5 }} className="inline-flex shrink-0">
                            <Send className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <Send className="w-4 h-4 shrink-0" />
                        )}
                        <span>{tr.complaintNo}</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
    </ModalShell>
  );
}
