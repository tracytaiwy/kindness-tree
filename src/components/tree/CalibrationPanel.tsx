import { useEffect, useState } from "react";
import { TREE_PRESETS, closestPreset, type Calibration } from "@/lib/calibration";

type Props = {
  calibration: Calibration;
  update: <K extends keyof Calibration>(key: K, value: Calibration[K]) => void;
  merge: (patch: Partial<Calibration>) => void;
  reset: () => void;
  onClose: () => void;
  handCount: number;
  status: string;
};

function Row({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm text-bark">
        <span>{label}</span>
        <span className="font-medium tabular-nums">
          {Math.round(value * 100) / 100}
          {suffix ?? ""}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--apple)]"
      />
    </label>
  );
}

/** 螢幕比例預設：一鍵套用樹冠／樹幹比例後再微調 */
function PresetPicker({ merge }: { merge: (patch: Partial<Calibration>) => void }) {
  const [aspect, setAspect] = useState(16 / 9);
  const [applied, setApplied] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setAspect(window.innerWidth / window.innerHeight);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const suggested = closestPreset(aspect).id;

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-bark">螢幕比例預設（可套用後再微調）</p>
      <div className="grid grid-cols-2 gap-2">
        {TREE_PRESETS.map((preset) => {
          const isSuggested = preset.id === suggested;
          const isApplied = preset.id === applied;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                merge(preset.values);
                setApplied(preset.id);
              }}
              className="rounded-2xl px-3 py-2 text-left text-bark transition"
              style={{
                background: isApplied
                  ? "color-mix(in oklab, var(--apple) 25%, transparent)"
                  : "color-mix(in oklab, var(--bark) 10%, transparent)",
                border: isSuggested
                  ? "1.5px solid var(--apple)"
                  : "1px solid color-mix(in oklab, var(--bark) 18%, transparent)",
              }}
            >
              <span className="block text-sm font-bold">
                {preset.label}
                {isSuggested ? " ·目前" : ""}
              </span>
              <span className="block text-[11px] leading-tight text-bark/70">{preset.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 校正模式：安裝人員可調整鏡頭對齊與遮罩透明度（按 C 或連點左上角開啟） */
export function CalibrationPanel({
  calibration,
  update,
  merge,
  reset,
  onClose,
  handCount,
  status,
}: Props) {
  return (
    <>
      {/* 對齊參考線 */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <div className="absolute left-1/2 top-0 h-full w-px bg-cream/50" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cream/50" />
        <div className="absolute inset-[10%] border border-dashed border-cream/40" />
      </div>

      <div
        className="absolute left-[2vw] top-[2vh] z-50 w-[340px] max-w-[90vw] cursor-auto rounded-3xl p-5 backdrop-blur-xl"
        style={{
          background: "color-mix(in oklab, var(--cream) 92%, transparent)",
          border: "1px solid color-mix(in oklab, var(--bark) 25%, transparent)",
          boxShadow: "0 18px 50px color-mix(in oklab, var(--bark) 35%, transparent)",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-bark">相機校正模式</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-bark"
            style={{ background: "color-mix(in oklab, var(--bark) 12%, transparent)" }}
          >
            關閉
          </button>
        </div>

        <p className="mb-4 text-xs text-bark/70">
          追蹤狀態：{status} · 目前偵測到 {handCount} 隻手
        </p>

        <PresetPicker merge={merge} />

        <div className="space-y-3">
          <Row
            label="鏡頭水平位移"
            value={calibration.offsetX}
            suffix="%"
            min={-30}
            max={30}
            step={0.5}
            onChange={(v) => update("offsetX", v)}
          />
          <Row
            label="鏡頭垂直位移"
            value={calibration.offsetY}
            suffix="%"
            min={-30}
            max={30}
            step={0.5}
            onChange={(v) => update("offsetY", v)}
          />
          <Row
            label="鏡頭縮放"
            value={calibration.scale}
            suffix="×"
            min={0.6}
            max={2}
            step={0.01}
            onChange={(v) => update("scale", v)}
          />
          <Row
            label="鏡頭畫面透明度"
            value={calibration.cameraOpacity}
            min={0.1}
            max={1}
            step={0.01}
            onChange={(v) => update("cameraOpacity", v)}
          />
          <Row
            label="樹圖層透明度"
            value={calibration.treeOpacity}
            min={0.2}
            max={1}
            step={0.01}
            onChange={(v) => update("treeOpacity", v)}
          />
          <Row
            label="暖色遮罩透明度"
            value={calibration.overlayOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => update("overlayOpacity", v)}
          />
          <Row
            label="樹幹縮放"
            value={calibration.trunkScale}
            suffix="×"
            min={0.5}
            max={2}
            step={0.01}
            onChange={(v) => update("trunkScale", v)}
          />
          <Row
            label="樹幹垂直位置"
            value={calibration.trunkOffsetY}
            suffix="vh"
            min={-25}
            max={25}
            step={0.5}
            onChange={(v) => update("trunkOffsetY", v)}
          />
          <Row
            label="樹葉縮放"
            value={calibration.canopyScale}
            suffix="×"
            min={0.6}
            max={1.8}
            step={0.01}
            onChange={(v) => update("canopyScale", v)}
          />
          <Row
            label="蘋果大小"
            value={calibration.appleScale}
            suffix="×"
            min={0.6}
            max={1.6}
            step={0.01}
            onChange={(v) => update("appleScale", v)}
          />
          <Row
            label="手掌命中範圍"
            value={calibration.hitRadius}
            min={0.04}
            max={0.18}
            step={0.005}
            onChange={(v) => update("hitRadius", v)}
          />

          <label className="flex items-center justify-between text-sm text-bark">
            <span>水平鏡像（學生看見自己）</span>
            <input
              type="checkbox"
              checked={calibration.mirror}
              onChange={(e) => update("mirror", e.target.checked)}
              className="h-5 w-5 accent-[var(--apple)]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-4 w-full rounded-full py-2 text-sm font-medium text-cream"
          style={{ background: "var(--apple)" }}
        >
          回復預設值
        </button>
      </div>
    </>
  );
}
