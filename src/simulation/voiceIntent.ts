import type { CommandAction } from "@/types/whiteboard";

/**
 * F8 "use voice commands to prompt the eraser" — pure voice intent
 * parser.
 *
 * Given a raw ASR transcript, normalize it (lowercase, strip
 * punctuation, collapse whitespace) and match against a small,
 * explicit phrase table. Returns a typed `VoiceIntent` with the
 * matched `CommandAction` (or null) and a coarse confidence score
 * derived from phrase specificity — the ASR layer can supply its own
 * confidence separately via `ExternalVoiceIntent`.
 *
 * Pure — no audio, no `SpeechRecognition`, no React. Consumed by the
 * FR2 command guard and by the audit pipeline.
 */

export const DEFAULT_VOICE_CONFIDENCE_MIN = 0.6;

/** Default wake-word prefixes — callers may override per deployment. */
export const DEFAULT_WAKE_WORDS: readonly string[] = [
  "eraser",
  "hey eraser",
  "ok eraser",
  "robot",
];

export interface VoiceIntent {
  action: CommandAction | null;
  confidence: number;
  matchedPhrase: string | null;
  wakeWord: string | null;
  raw: string;
  normalized: string;
}

interface PhraseEntry {
  action: CommandAction;
  phrases: readonly string[];
  /** Base confidence before wake-word / length bonuses. */
  baseConfidence: number;
}

/**
 * Phrase table. Order matters only for test logging — matching runs
 * across all entries and picks the highest-confidence result.
 */
const PHRASE_TABLE: readonly PhraseEntry[] = [
  {
    action: "start",
    baseConfidence: 0.85,
    phrases: [
      "start erase",
      "start erasing",
      "erase the board",
      "erase whiteboard",
      "begin erase",
      "go",
    ],
  },
  {
    action: "pause",
    baseConfidence: 0.85,
    phrases: ["pause", "pause erase", "pause erasing", "hold on", "wait"],
  },
  {
    action: "stop",
    baseConfidence: 0.9,
    phrases: ["stop", "stop erase", "stop erasing", "cancel", "abort"],
  },
];

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripWakeWord = (
  text: string,
  wakeWords: readonly string[],
): { remainder: string; wakeWord: string | null } => {
  for (const w of wakeWords) {
    const normalizedWake = normalize(w);
    if (!normalizedWake) continue;
    if (
      text === normalizedWake ||
      text.startsWith(`${normalizedWake} `)
    ) {
      return {
        remainder: text.slice(normalizedWake.length).trim(),
        wakeWord: w,
      };
    }
  }
  return { remainder: text, wakeWord: null };
};

export interface ParseVoiceIntentOptions {
  wakeWords?: readonly string[];
  /** ASR-supplied confidence (0..1) when available. Blended with phrase confidence. */
  asrConfidence?: number;
}

export function parseVoiceIntent(
  transcript: string,
  options: ParseVoiceIntentOptions = {},
): VoiceIntent {
  const wakeWords = options.wakeWords ?? DEFAULT_WAKE_WORDS;
  const raw = transcript ?? "";
  const normalized = normalize(raw);
  const { remainder, wakeWord } = stripWakeWord(normalized, wakeWords);

  let best: {
    entry: PhraseEntry;
    phrase: string;
    confidence: number;
  } | null = null;

  for (const entry of PHRASE_TABLE) {
    for (const phrase of entry.phrases) {
      const np = normalize(phrase);
      if (!np) continue;
      const matches = remainder === np || remainder.endsWith(` ${np}`) || remainder.startsWith(`${np} `) || remainder.includes(` ${np} `);
      if (!matches) continue;
      const wakeBonus = wakeWord ? 0.1 : 0;
      const exactBonus = remainder === np ? 0.05 : 0;
      const confidence = Math.min(
        1,
        entry.baseConfidence + wakeBonus + exactBonus,
      );
      if (!best || confidence > best.confidence) {
        best = { entry, phrase, confidence };
      }
    }
  }

  if (!best) {
    return {
      action: null,
      confidence: 0,
      matchedPhrase: null,
      wakeWord,
      raw,
      normalized,
    };
  }

  const blended =
    options.asrConfidence != null && Number.isFinite(options.asrConfidence)
      ? Math.min(1, (best.confidence + Math.max(0, Math.min(1, options.asrConfidence))) / 2)
      : best.confidence;

  return {
    action: best.entry.action,
    confidence: blended,
    matchedPhrase: best.phrase,
    wakeWord,
    raw,
    normalized,
  };
}
