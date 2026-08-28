/** 現場一鍵靜音／開聲 */
export function SoundToggle({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={onToggle}
      aria-label={muted ? "開啟音效" : "關閉音效"}
      className="absolute bottom-[4vh] right-[4vw] z-30 flex items-center gap-3 rounded-full px-6 py-3 backdrop-blur-md transition-transform active:scale-95"
      style={{
        background: "color-mix(in oklab, var(--cream) 30%, transparent)",
        border: "1px solid color-mix(in oklab, var(--cream) 45%, transparent)",
        boxShadow: "0 10px 30px color-mix(in oklab, var(--bark) 25%, transparent)",
      }}
    >
      <span style={{ fontSize: "clamp(20px, 2vw, 30px)", lineHeight: 1 }}>
        {muted ? "🔇" : "🔊"}
      </span>
      <span
        className="font-sans font-medium text-cream"
        style={{
          fontSize: "clamp(14px, 1.3vw, 20px)",
          textShadow: "0 2px 10px color-mix(in oklab, var(--bark) 60%, transparent)",
        }}
      >
        {muted ? "音效已靜音" : "音效開啟"}
      </span>
    </button>
  );
}
