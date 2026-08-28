/** 極輕暖色漸變：讓 UI 清楚可讀，中央幾近透明以保留學生身影 */
export function WarmOverlay({ opacity = 1 }: { opacity?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ opacity }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--sunlight) 55%, transparent) 0%, color-mix(in oklab, var(--sunlight) 8%, transparent) 32%, transparent 55%, color-mix(in oklab, var(--apple-glow) 18%, transparent) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 50% 12%, color-mix(in oklab, var(--sunlight) 32%, transparent) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
