import { useEffect, useRef, useState } from "react";

import { useHandTracking } from "@/hooks/useHandTracking";
import { useKindnessTree } from "@/hooks/useKindnessTree";
import { useCalibration } from "@/lib/calibration";
import { useKindnessSound } from "@/lib/sound";
import { Apple } from "./Apple";
import { CalibrationPanel } from "./CalibrationPanel";
import { CameraLayer } from "./CameraLayer";
import { Counter } from "./Counter";
import { HeartParticles } from "./HeartParticles";
import { SoundToggle } from "./SoundToggle";
import { Title } from "./Title";
import { TreeLayer } from "./TreeLayer";
import { WarmOverlay } from "./WarmOverlay";
import { WaveHint } from "./WaveHint";

/** 觸發「揮手」所需的橫向移動量（畫面比例／每幀累積） */
const WAVE_TRAVEL = 0.055;
/** 同一顆蘋果的冷卻，避免一次揮手觸發多次 */
const PICK_COOLDOWN = 700;
/** 同時追蹤的手數上限（約可服務 5–8 位學生） */
const MAX_HANDS = 10;

type HandTrail = { x: number; y: number; travel: number; time: number };

export function KindnessTreeScene() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { calibration, update, merge, reset } = useCalibration();
  const { handsRef, status, handCount, cameraReady, error, restart } = useHandTracking(videoRef, {
    numHands: MAX_HANDS,
    mirror: calibration.mirror,
  });
  const { apples, bursts, count, pick } = useKindnessTree(
    calibration.appleScale,
    calibration.canopyScale,
  );
  const { muted, toggleMuted, playHint, playSuccess } = useKindnessSound();

  const [hoveredIds, setHoveredIds] = useState<number[]>([]);
  const [calibrating, setCalibrating] = useState(false);
  const applesRef = useRef(apples);
  applesRef.current = apples;
  const trailsRef = useRef<HandTrail[]>([]);
  const lastPickRef = useRef<Map<number, number>>(new Map());
  const hitRadiusRef = useRef(calibration.hitRadius);
  hitRadiusRef.current = calibration.hitRadius;

  const pickRef = useRef(pick);
  pickRef.current = pick;
  const soundRef = useRef({ playHint, playSuccess });
  soundRef.current = { playHint, playSuccess };

  /** 安裝人員入口：按 C 鍵，或連點左上角 3 下 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") setCalibrating((v) => !v);
      if (e.key === "Escape") setCalibrating(false);
      if (e.key === "m" || e.key === "M") toggleMuted();
    };
    let taps = 0;
    let timer = 0;
    const onPointer = (e: PointerEvent) => {
      if (e.clientX > 120 || e.clientY > 120) return;
      taps += 1;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (taps = 0), 900);
      if (taps >= 3) {
        taps = 0;
        setCalibrating(true);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.clearTimeout(timer);
    };
  }, [toggleMuted]);

  useEffect(() => {
    let raf = 0;
    let hadHover = false;
    const step = () => {
      raf = requestAnimationFrame(step);
      const hands = handsRef.current;
      const now = performance.now();
      const hovered: number[] = [];

      hands.forEach((hand, index) => {
        const prev = trailsRef.current[index];
        const dx = prev ? Math.abs(hand.x - prev.x) : 0;
        const decay = prev && now - prev.time < 500 ? prev.travel * 0.88 : 0;
        const travel = decay + dx;
        trailsRef.current[index] = { x: hand.x, y: hand.y, travel, time: now };

        // 找最接近的蘋果（判定寬鬆，適合小學生大幅度揮手）
        let nearest: { id: number; dist: number } | null = null;
        for (const apple of applesRef.current) {
          const d = Math.hypot(hand.x - apple.x / 100, hand.y - apple.y / 100);
          if (d < hitRadiusRef.current && (!nearest || d < nearest.dist)) {
            nearest = { id: apple.id, dist: d };
          }
        }
        if (!nearest) return;

        hovered.push(nearest.id);
        const last = lastPickRef.current.get(nearest.id) ?? 0;
        if (travel > WAVE_TRAVEL && now - last > PICK_COOLDOWN) {
          lastPickRef.current.set(nearest.id, now);
          trailsRef.current[index] = { x: hand.x, y: hand.y, travel: 0, time: now };
          pickRef.current(nearest.id);
          soundRef.current.playSuccess();
        }
      });

      // 手剛靠近蘋果時的提示音
      if (hovered.length > 0 && !hadHover) soundRef.current.playHint();
      hadHover = hovered.length > 0;

      trailsRef.current.length = hands.length;
      setHoveredIds((current) =>
        current.length === hovered.length && current.every((id, i) => id === hovered[i])
          ? current
          : hovered,
      );
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [handsRef]);

  return (
    <main
      className={`${calibrating ? "" : "installation-mode"} relative h-[100dvh] w-screen overflow-hidden bg-bark`}
    >
      <CameraLayer videoRef={videoRef} calibration={calibration} />
      <WarmOverlay opacity={calibration.overlayOpacity} />
      <TreeLayer
        opacity={calibration.treeOpacity}
        trunkScale={calibration.trunkScale}
        trunkOffsetY={calibration.trunkOffsetY}
        canopyScale={calibration.canopyScale}
      />

      {/* 互動蘋果層 */}
      <div className="absolute inset-0">
        {apples.map((apple) => (
          <Apple
            key={apple.id}
            x={apple.x}
            y={apple.y}
            word={apple.word}
            hovered={hoveredIds.includes(apple.id)}
            isNew={apple.bornAt > 0}
            sizeScale={calibration.appleScale}
            onPick={() => {
              pick(apple.id);
              playSuccess();
            }}
          />
        ))}
      </div>

      {/* 愛心粒子層 */}
      <div className="pointer-events-none absolute inset-0">
        {bursts.map((b) => (
          <HeartParticles key={b.id} x={b.x} y={b.y} />
        ))}
      </div>

      <Title />
      <Counter count={count} />
      <WaveHint />
      <SoundToggle muted={muted} onToggle={toggleMuted} />

      {!calibrating && (
        <button
          type="button"
          onPointerDown={() => setCalibrating(true)}
          aria-label="開啟相機校正模式"
          className="absolute right-[4vw] top-[3vh] z-30 flex items-center gap-2 rounded-full px-5 py-3 backdrop-blur-md transition-transform active:scale-95"
          style={{
            background: "color-mix(in oklab, var(--cream) 30%, transparent)",
            border: "1px solid color-mix(in oklab, var(--cream) 45%, transparent)",
            boxShadow: "0 10px 30px color-mix(in oklab, var(--bark) 25%, transparent)",
          }}
        >
          <span style={{ fontSize: "clamp(18px, 1.7vw, 26px)", lineHeight: 1 }}>⚙️</span>
          <span
            className="font-sans font-medium text-cream"
            style={{
              fontSize: "clamp(13px, 1.2vw, 19px)",
              textShadow: "0 2px 10px color-mix(in oklab, var(--bark) 60%, transparent)",
            }}
          >
            校正模式
          </span>
        </button>
      )}


      {calibrating && (
        <CalibrationPanel
          calibration={calibration}
          update={update}
          merge={merge}
          reset={reset}
          onClose={() => setCalibrating(false)}
          handCount={handCount}
          status={status}
        />
      )}

      {!cameraReady && (
        <div className="absolute bottom-[11vh] right-[4vw] flex items-center gap-3">
          <p
            className="font-sans text-cream/80"
            style={{ fontSize: "clamp(12px, 1vw, 16px)" }}
          >
            {error ?? "鏡頭啟動中…"}
          </p>
          <button
            type="button"
            onClick={restart}
            className="rounded-full border border-cream/40 px-4 py-1.5 font-sans text-cream/90 transition hover:bg-cream/15"
            style={{ fontSize: "clamp(12px, 1vw, 16px)" }}
          >
            重新啟動鏡頭
          </button>
        </div>
      )}

    </main>
  );
}
