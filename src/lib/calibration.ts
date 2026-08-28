import { useCallback, useEffect, useState } from "react";

/** 安裝人員可調整的校正設定（存於本機） */
export type Calibration = {
  /** 鏡頭畫面水平位移（% 畫面寬） */
  offsetX: number;
  /** 鏡頭畫面垂直位移（% 畫面高） */
  offsetY: number;
  /** 鏡頭畫面縮放 */
  scale: number;
  /** 是否水平鏡像（學生看見自己時通常需要） */
  mirror: boolean;
  /** 鏡頭畫面透明度 0–1（半透明可見鏡頭前的人） */
  cameraOpacity: number;
  /** 樹圖層透明度 0–1 */
  treeOpacity: number;
  /** 暖色遮罩透明度 0–1 */
  overlayOpacity: number;
  /** 蘋果大小倍率 */
  appleScale: number;
  /** 手掌命中半徑（畫面比例） */
  hitRadius: number;
  /** 樹幹縮放倍率 */
  trunkScale: number;
  /** 樹幹垂直位置（% 畫面高，正值往下） */
  trunkOffsetY: number;
  /** 樹冠縮放倍率 */
  canopyScale: number;
};

export const DEFAULT_CALIBRATION: Calibration = {
  offsetX: -2,
  offsetY: -2,
  scale: 1.01,
  mirror: true,
  cameraOpacity: 0.31,
  treeOpacity: 1,
  overlayOpacity: 0.11,
  appleScale: 0.85,
  hitRadius: 0.06,
  trunkScale: 1.66,
  trunkOffsetY: 17,
  canopyScale: 1.8,
};


/** 常見安裝螢幕比例的樹冠／樹幹預設，可一鍵套用再微調 */
export type TreePreset = {
  id: string;
  label: string;
  hint: string;
  /** 目標寬高比，用於自動標示最貼近目前螢幕的預設 */
  aspect: number;
  values: Pick<Calibration, "canopyScale" | "trunkScale" | "trunkOffsetY" | "appleScale">;
};

export const TREE_PRESETS: TreePreset[] = [
  {
    id: "16-9",
    label: "16:9",
    hint: "橫向大屏（1920×1080）",
    aspect: 16 / 9,
    values: { canopyScale: 1.8, trunkScale: 1.66, trunkOffsetY: 17, appleScale: 0.85 },
  },
  {
    id: "16-10",
    label: "16:10",
    hint: "闊螢幕（1920×1200）",
    aspect: 16 / 10,
    values: { canopyScale: 1.62, trunkScale: 1.45, trunkOffsetY: 13, appleScale: 0.88 },
  },
  {
    id: "4-3",
    label: "4:3",
    hint: "方形觸控屏（1024×768）",
    aspect: 4 / 3,
    values: { canopyScale: 1.3, trunkScale: 1.15, trunkOffsetY: 7, appleScale: 0.95 },
  },
  {
    id: "9-16",
    label: "9:16",
    hint: "直立豎屏（1080×1920）",
    aspect: 9 / 16,
    values: { canopyScale: 1, trunkScale: 0.85, trunkOffsetY: 0, appleScale: 1 },
  },
];

/** 找出最貼近指定寬高比的預設 */
export function closestPreset(aspect: number) {
  return TREE_PRESETS.reduce((best, preset) =>
    Math.abs(preset.aspect - aspect) < Math.abs(best.aspect - aspect) ? preset : best,
  );
}

const STORAGE_KEY = "kindness-tree-calibration";

export function useCalibration() {
  const [calibration, setCalibration] = useState<Calibration>(DEFAULT_CALIBRATION);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setCalibration({ ...DEFAULT_CALIBRATION, ...(JSON.parse(raw) as Partial<Calibration>) });
      }
    } catch {
      /* 忽略 */
    }
  }, []);

  const update = useCallback(<K extends keyof Calibration>(key: K, value: Calibration[K]) => {
    setCalibration((current) => {
      const next = { ...current, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* 忽略 */
      }
      return next;
    });
  }, []);

  const merge = useCallback((patch: Partial<Calibration>) => {
    setCalibration((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* 忽略 */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCalibration(DEFAULT_CALIBRATION);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* 忽略 */
    }
  }, []);

  return { calibration, update, merge, reset };
}
