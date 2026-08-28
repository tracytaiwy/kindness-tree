/** 常駐互動提示（非 popup），固定於畫面一角 */
export function WaveHint() {
  return (
    <div className="pointer-events-none absolute bottom-[4vh] left-1/2 -translate-x-1/2 md:left-[4vw] md:translate-x-0">
      <div
        className="flex items-center gap-4 rounded-full px-7 py-4 backdrop-blur-md"
        style={{
          background: "color-mix(in oklab, var(--cream) 32%, transparent)",
          border: "1px solid color-mix(in oklab, var(--cream) 45%, transparent)",
          boxShadow: "0 10px 34px color-mix(in oklab, var(--bark) 25%, transparent)",
        }}
      >
        <span
          className="animate-wave-hand inline-block origin-bottom"
          style={{ fontSize: "clamp(28px, 3vw, 44px)", lineHeight: 1 }}
        >
          👋
        </span>
        <span
          className="font-sans font-medium text-cream"
          style={{
            fontSize: "clamp(19px, 1.9vw, 30px)",
            textShadow: "0 2px 10px color-mix(in oklab, var(--bark) 60%, transparent)",
          }}
        >
          揮揮手，向仁愛之樹打個招呼吧！
        </span>
      </div>
    </div>
  );
}
