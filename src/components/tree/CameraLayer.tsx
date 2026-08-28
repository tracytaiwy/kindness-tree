import { DEFAULT_CALIBRATION, type Calibration } from "@/lib/calibration";

/** 最底層：即時鏡頭影像（可由校正模式調整鏡像、位移與縮放） */
export function CameraLayer({
  videoRef,
  calibration = DEFAULT_CALIBRATION,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  calibration?: Calibration;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-bark">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-full w-full object-cover"
        style={{
          opacity: calibration.cameraOpacity,
          transform: `translate(${calibration.offsetX}%, ${calibration.offsetY}%) scale(${
            calibration.scale
          }) scaleX(${calibration.mirror ? -1 : 1})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

