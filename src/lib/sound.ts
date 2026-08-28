import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "kindness-tree-muted";

type Note = { freq: number; start: number; dur: number; gain?: number };

/**
 * 溫暖的木琴風提示音（以 WebAudio 即時合成，無需音檔）。
 * hint：手接近蘋果時的輕柔提示音
 * success：蘋果化成愛心的歡迎音（上行大三和弦）
 */
export function useKindnessSound() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const lastHintRef = useRef(0);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* 忽略 */
    }
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* 忽略 */
      }
      return next;
    });
  }, []);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playNotes = useCallback(
    (notes: Note[], type: OscillatorType = "triangle") => {
      if (muted) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = note.freq;
        const peak = note.gain ?? 0.16;
        gain.gain.setValueAtTime(0.0001, now + note.start);
        gain.gain.exponentialRampToValueAtTime(peak, now + note.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + note.start);
        osc.stop(now + note.start + note.dur + 0.05);
      }
    },
    [ensureCtx, muted],
  );

  /** 手靠近蘋果：輕柔的一聲（自帶節流） */
  const playHint = useCallback(() => {
    const now = performance.now();
    if (now - lastHintRef.current < 900) return;
    lastHintRef.current = now;
    playNotes([{ freq: 880, start: 0, dur: 0.22, gain: 0.08 }], "sine");
  }, [playNotes]);

  /** 成功摘下：溫暖上行三音 + 柔亮尾音 */
  const playSuccess = useCallback(() => {
    playNotes([
      { freq: 523.25, start: 0, dur: 0.28 },
      { freq: 659.25, start: 0.09, dur: 0.3 },
      { freq: 783.99, start: 0.18, dur: 0.38 },
      { freq: 1046.5, start: 0.28, dur: 0.5, gain: 0.1 },
    ]);
  }, [playNotes]);

  /** 使用者首次觸碰畫面時解鎖音訊（瀏覽器政策） */
  useEffect(() => {
    const unlock = () => ensureCtx();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureCtx]);

  return { muted, toggleMuted, playHint, playSuccess };
}
