import { useEffect, useState } from "react";

/** 今日已收集的仁愛果實（單機當日累計） */
export function Counter({ count }: { count: number }) {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (count === 0) return;
    setPop(true);
    const t = window.setTimeout(() => setPop(false), 420);
    return () => window.clearTimeout(t);
  }, [count]);

  return (
    <div className="pointer-events-none absolute right-[4vw] top-[4vh] text-right">
      <p
        className="font-sans text-cream/85"
        style={{ fontSize: "clamp(14px, 1.3vw, 20px)", letterSpacing: "0.14em" }}
      >
        今日已收集
      </p>
      <p
        className="flex items-center justify-end gap-2 font-display text-cream"
        style={{
          fontSize: "clamp(46px, 5.6vw, 92px)",
          fontWeight: 700,
          lineHeight: 1.05,
          textShadow: "0 4px 22px color-mix(in oklab, var(--bark) 65%, transparent)",
          animation: pop ? "count-pop 0.42s ease-out" : undefined,
        }}
      >
        <span style={{ fontSize: "0.55em" }}>❤️</span>
        {count}
      </p>
      <p
        className="font-sans text-cream/85"
        style={{ fontSize: "clamp(14px, 1.3vw, 20px)", letterSpacing: "0.1em" }}
      >
        個仁愛果實
      </p>
    </div>
  );
}
