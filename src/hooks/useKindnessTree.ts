import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const KINDNESS_WORDS = ["關愛", "同理心", "尊重"] as const;
export type KindnessWord = (typeof KINDNESS_WORDS)[number];

export type Apple = {
  id: number;
  anchor: number;
  word: KindnessWord;
  bornAt: number;
};

export type Burst = { id: number; x: number; y: number };

/** 樹冠內的枝條錨點（基準座標，映射到樹葉範圍橢圓內），彼此保持足夠間距不重疊 */
export const ANCHORS: { x: number; y: number }[] = [
  { x: 49.0, y: 12.2 }, { x: 63.6, y: 15.6 }, { x: 34.1, y: 19.5 }, { x: 16.1, y: 23.2 },
  { x: 82.3, y: 26.5 }, { x: 53.2, y: 30.3 }, { x: 28.5, y: 30.3 }, { x: 41.1, y: 31.7 },
  { x: 66.2, y: 33.4 }, { x: 93.2, y: 33.8 }, { x: 10.2, y: 37.4 }, { x: 33.3, y: 41.3 },
  { x: 51.4, y: 42.9 }, { x: 63.9, y: 45.8 }, { x: 90.8, y: 46.5 }, { x: 76.5, y: 46.9 },
  { x: 20.0, y: 50.6 }, { x: 43.2, y: 53.3 }, { x: 30.7, y: 58.8 }, { x: 61.5, y: 59.4 },
];

const ACTIVE_APPLES = 18;
const STORAGE_KEY = "kindness-tree-count";

/** 錨點基準座標系（與 ANCHORS 一致）：以此換算成樹冠內的相對位置 */
const ROW_CENTER = 37;
const COL_CENTER = 50;
const ROW_SPAN = 25; // 錨點 y 的最大偏移
const COL_SPAN = 45; // 錨點 x 的最大偏移

export type CanopyField = { cx: number; cy: number; rx: number; ry: number };

/**
 * 依前層樹冠的實際幾何（與 TreeLayer 的計算一致）算出「樹葉範圍」橢圓，
 * 蘋果只會落在這個橢圓內，絕不會離開樹。
 */
export function canopyField(
  width: number,
  height: number,
  canopyScale: number,
): CanopyField {
  if (!width || !height) return { cx: 50, cy: 40, rx: 22, ry: 20 };
  // TreeLayer 前層：width: min(102*cs vw, 63*cs vh)，top: 16%
  const wPx = Math.min((102 * canopyScale * width) / 100, (63 * canopyScale * height) / 100);
  const hPx = (wPx * 1280) / 1920; // 素材比例
  const topPx = 0.16 * height;
  return {
    cx: 50,
    cy: ((topPx + hPx * 0.46) / height) * 100,
    rx: ((wPx * 0.52) / width) * 100,
    ry: ((hPx * 0.44) / height) * 100,
  };
}

/** 將基準錨點映射到樹冠橢圓內（超出者收回邊界內） */
export function scaledAnchor(anchor: { x: number; y: number }, f: CanopyField) {
  let u = (anchor.x - COL_CENTER) / COL_SPAN;
  let v = (anchor.y - ROW_CENTER) / ROW_SPAN;
  const r = Math.hypot(u, v);
  if (r > 1) {
    u /= r;
    v /= r;
  }
  return { x: f.cx + u * f.rx, y: f.cy + v * f.ry };
}


function useViewport() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const read = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
    };
  }, []);
  return size;
}

function randomWord(): KindnessWord {
  return KINDNESS_WORDS[Math.floor(Math.random() * KINDNESS_WORDS.length)]!;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function useKindnessTree(_appleScale = 1, canopyScale = 1) {
  const { width, height } = useViewport();
  const nextId = useRef(1000);
  const [apples, setApples] = useState<Apple[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [count, setCount] = useState(0);

  // 初始蘋果：從錨點池隨機挑選
  useEffect(() => {
    const pool = [...ANCHORS.keys()].sort(() => Math.random() - 0.5);
    setApples(
      pool.slice(0, ACTIVE_APPLES).map((anchor, i) => ({
        id: i,
        anchor,
        word: randomWord(),
        bornAt: 0,
      })),
    );
  }, []);

  // 單機當日累計（跨日自動重設）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { date: string; count: number };
        if (saved.date === todayKey()) setCount(saved.count);
      }
    } catch {
      /* 忽略 */
    }
  }, []);

  const persist = useCallback((value: number) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayKey(), count: value }),
      );
    } catch {
      /* 忽略 */
    }
  }, []);

  const pick = useCallback(
    (id: number) => {
      setApples((current) => {
        const target = current.find((a) => a.id === id);
        if (!target) return current;

        const used = new Set(current.map((a) => a.anchor));
        const free = [...ANCHORS.keys()].filter((i) => !used.has(i));
        const nextAnchor =
          free.length > 0
            ? free[Math.floor(Math.random() * free.length)]!
            : target.anchor;

        const spot = ANCHORS[target.anchor]!;
        const burstId = nextId.current++;
        setBursts((b) => [...b, { id: burstId, x: spot.x, y: spot.y }]);
        window.setTimeout(
          () => setBursts((b) => b.filter((item) => item.id !== burstId)),
          2200,
        );

        setCount((c) => {
          const next = c + 1;
          persist(next);
          return next;
        });

        return [
          ...current.filter((a) => a.id !== id),
          {
            id: nextId.current++,
            anchor: nextAnchor,
            word: randomWord(),
            bornAt: Date.now(),
          },
        ];
      });
    },
    [persist],
  );

  const factors = useMemo(
    () => canopyField(width, height, canopyScale),
    [width, height, canopyScale],
  );

  const positioned = useMemo(
    () => apples.map((a) => ({ ...a, ...scaledAnchor(ANCHORS[a.anchor]!, factors) })),
    [apples, factors],
  );

  const scaledBursts = useMemo(
    () => bursts.map((b) => ({ ...b, ...scaledAnchor({ x: b.x, y: b.y }, factors) })),
    [bursts, factors],
  );

  return { apples: positioned, bursts: scaledBursts, count, pick };
}
