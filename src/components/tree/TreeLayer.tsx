import canopy from "@/assets/tree-canopy.png";
import trunk from "@/assets/tree-trunk.png";
import leaf from "@/assets/leaf-cluster.png";

const DRIFTING_LEAVES = [
  { left: "18%", delay: "0s", duration: "16s", size: 54 },
  { left: "39%", delay: "4.5s", duration: "19s", size: 38 },
  { left: "58%", delay: "2.2s", duration: "14s", size: 46 },
  { left: "74%", delay: "7s", duration: "21s", size: 32 },
  { left: "87%", delay: "9.5s", duration: "17s", size: 42 },
];

/** 樹幹 + 多層樹冠，各層以不同幅度極慢搖擺；半透明讓學生身影自然重疊 */
export function TreeLayer({
  opacity = 1,
  trunkScale = 1,
  trunkOffsetY = 0,
  canopyScale = 1,
}: {
  opacity?: number;
  trunkScale?: number;
  trunkOffsetY?: number;
  canopyScale?: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity }}>
      {/* 樹幹（以高度為基準縮放，寬螢幕也不會被裁掉） */}
      <img
        src={trunk}
        alt=""
        width={1280}
        height={1280}
        className="absolute left-1/2 bottom-0 object-contain object-bottom opacity-85"
        style={{
          height: `calc(min(58vh, 62vw) * ${trunkScale})`,
          width: "auto",
          minWidth: `calc(min(46vh, 52vw) * ${trunkScale})`,
          transform: `translateX(-50%) translateY(${trunkOffsetY}vh)`,
          filter: "drop-shadow(0 -10px 40px color-mix(in oklab, var(--bark) 35%, transparent))",
        }}
      />


      {/* 樹冠：後層（寬度以寬螢幕高度為上限，避免覆蓋樹幹） */}
      <img
        src={canopy}
        alt=""
        width={1920}
        height={1280}
        className="animate-canopy-sway absolute left-1/2 top-[8%] -translate-x-1/2 opacity-45 blur-[3px]"
        style={{
          width: `min(${142 * canopyScale}vw, ${75 * canopyScale}vh)`,
          animationDuration: "17s",
          transformOrigin: "50% 90%",
        }}
      />
      {/* 樹冠：中層 */}
      <img
        src={canopy}
        alt=""
        width={1920}
        height={1280}
        className="animate-canopy-sway absolute left-1/2 top-[12%] -translate-x-1/2 opacity-60"
        style={{
          width: `min(${120 * canopyScale}vw, ${69 * canopyScale}vh)`,
          animationDuration: "13s",
          animationDelay: "-4s",
          transformOrigin: "50% 90%",
        }}
      />
      {/* 樹冠：前層（帶柔光） */}
      <img
        src={canopy}
        alt=""
        width={1920}
        height={1280}
        className="animate-canopy-sway absolute left-1/2 top-[16%] -translate-x-1/2 opacity-72"
        style={{
          width: `min(${102 * canopyScale}vw, ${63 * canopyScale}vh)`,
          animationDuration: "11s",
          animationDelay: "-2s",
          transformOrigin: "50% 90%",
          filter: "drop-shadow(0 12px 34px color-mix(in oklab, var(--leaf) 28%, transparent))",
        }}
      />


      {/* 飄落葉片 */}
      {DRIFTING_LEAVES.map((l, i) => (
        <img
          key={i}
          src={leaf}
          alt=""
          width={512}
          height={512}
          className="animate-leaf-drift absolute top-[22%]"
          style={{
            left: l.left,
            width: l.size,
            height: l.size,
            animationDelay: l.delay,
            animationDuration: l.duration,
          }}
        />
      ))}
    </div>
  );
}
