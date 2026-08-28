import { useMemo } from "react";

const PARTICLE_COUNT = 26;

/** 蘋果被摘下：愛心粒子向上與四周飄散，原位留下柔光 */
export function HeartParticles({ x, y }: { x: number; y: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random();
        const distance = 90 + Math.random() * 190;
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance * 0.55 - (140 + Math.random() * 220),
          size: 14 + Math.random() * 24,
          delay: Math.random() * 0.22,
          duration: 1.3 + Math.random() * 0.8,
          rotate: -50 + Math.random() * 100,
        };
      }),
    [],
  );

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* 原位柔光 */}
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "clamp(96px, 9vw, 150px)",
          height: "clamp(96px, 9vw, 150px)",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--apple-glow) 70%, transparent) 0%, transparent 70%)",
          animation: "soft-glow-fade 1.5s ease-out forwards",
        }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            fontSize: p.size,
            lineHeight: 1,
            filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--apple-glow) 60%, transparent))",
            animation: `heart-float ${p.duration}s ease-out ${p.delay}s forwards`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            ["--rot" as string]: `${p.rotate}deg`,
          }}
        >
          ❤️
        </span>
      ))}
      <style>{`
        @keyframes heart-float {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(0deg); }
          18% { opacity: 1; transform: translate(calc(-50% + var(--dx) * 0.25), calc(-50% + var(--dy) * 0.22)) scale(1.1) rotate(calc(var(--rot) * 0.3)); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.55) rotate(var(--rot)); }
        }
      `}</style>

    </div>
  );
}
