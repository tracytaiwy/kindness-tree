import { useEffect, useRef, useState } from "react";

export type HandPoint = { x: number; y: number };
export type TrackingStatus = "idle" | "starting" | "ready" | "unavailable";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/**
 * 開啟前置鏡頭並以 MediaPipe HandLandmarker 追蹤最多 10 隻手（可同時服務約 5 位學生）。
 * 回傳的 handsRef 為「已鏡像」的正規化座標（0–1），可直接與畫面百分比比較。
 * 全部運算在瀏覽器本機進行，影像不會離開裝置。
 */
export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: { numHands?: number; mirror?: boolean } = {},
) {
  const numHands = options.numHands ?? 10;
  const mirror = options.mirror ?? true;
  const mirrorRef = useRef(mirror);
  mirrorRef.current = mirror;
  const handsRef = useRef<HandPoint[]>([]);
  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [cameraReady, setCameraReady] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let landmarker: { detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks: HandPoint[][] }; close: () => void } | null =
      null;
    let raf = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const start = async () => {
      setStatus("starting");
      const video = videoRef.current;
      if (!video) return;

      // 逐步降級的鏡頭條件：部分裝置/瀏覽器不接受高解析度或 facingMode
      const candidates: MediaStreamConstraints[] = [
        { video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: { width: { ideal: 640 } }, audio: false },
        { video: true, audio: false },
      ];
      let lastError: unknown = null;
      for (const constraints of candidates) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (e) {
          lastError = e;
          stream = null;
        }
      }
      if (cancelled) return;
      if (!stream) {
        const err = lastError as { name?: string; message?: string } | null;
        const name = err?.name ?? "Error";
        setError(
          name === "NotAllowedError"
            ? "鏡頭權限被拒絕，請在瀏覽器允許鏡頭後重試"
            : name === "NotReadableError" || name === "TrackStartError"
              ? "鏡頭正被其他程式或分頁佔用，請關閉後重試"
              : name === "NotFoundError"
                ? "找不到可用的鏡頭裝置"
                : `無法啟動鏡頭（${name}）`,
        );
        setStatus("unavailable");
        // 自動重試，讓佔用釋放後可自行恢復
        retryTimer = setTimeout(() => {
          if (!cancelled) setAttempt((a) => a + 1);
        }, 4000);
        return;
      }
      setError(null);
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setCameraReady(true);


      try {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
        const created = await vision.HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands,
        });
        if (cancelled) {
          created.close();
          return;
        }
        landmarker = created as unknown as typeof landmarker;
        setStatus("ready");
      } catch {
        // 鏡頭已開啟，只是手勢模型載入失敗
        setError("手勢追蹤模型載入失敗，仍可觸控輕點蘋果");
        setStatus("unavailable");
        return;
      }

      let lastTime = -1;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        const v = videoRef.current;
        if (!v || !landmarker || v.readyState < 2) return;
        if (v.currentTime === lastTime) return;
        lastTime = v.currentTime;
        try {
          const result = landmarker.detectForVideo(v, performance.now());
          const points: HandPoint[] = [];
          for (const marks of result.landmarks ?? []) {
            const palm = marks[9] ?? marks[0];
            if (!palm) continue;
            // 畫面已水平翻轉成鏡像，座標同步翻轉
            points.push({ x: mirrorRef.current ? 1 - palm.x : palm.x, y: palm.y });
          }
          handsRef.current = points;
          setHandCount((c) => (c === points.length ? c : points.length));

        } catch {
          handsRef.current = [];
        }
      };
      raf = requestAnimationFrame(loop);
    };

    void start();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      cancelAnimationFrame(raf);
      landmarker?.close();
      stream?.getTracks().forEach((t) => t.stop());
      setCameraReady(false);
    };
  }, [videoRef, numHands, attempt]);

  const restart = () => setAttempt((a) => a + 1);

  return { handsRef, status, cameraReady, handCount, error, restart };
}

