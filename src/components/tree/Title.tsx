/** 標題：清晰的文字框，不搶樹的視覺焦點 */
export function Title() {
  return (
    <div className="pointer-events-none absolute left-[3vw] top-[3vh] z-30">
      <div
        className="rounded-3xl px-7 py-4 backdrop-blur-md"
        style={{
          background: "color-mix(in oklab, var(--cream) 88%, transparent)",
          border: "2px solid color-mix(in oklab, var(--bark) 30%, transparent)",
          boxShadow: "0 14px 40px color-mix(in oklab, var(--bark) 40%, transparent)",
        }}
      >
        <h1
          className="font-display text-bark"
          style={{
            fontSize: "clamp(30px, 3.6vw, 60px)",
            fontWeight: 700,
            letterSpacing: "0.05em",
            lineHeight: 1.15,
          }}
        >
          本年主題：仁愛
        </h1>
      </div>
    </div>
  );
}
