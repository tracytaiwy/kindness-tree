import type { KindnessWord } from "@/hooks/useKindnessTree";

type AppleProps = {
  x: number;
  y: number;
  word: KindnessWord;
  hovered: boolean;
  isNew: boolean;
  sizeScale?: number;
  onPick: () => void;
};

/** 仁愛蘋果：柔和立體、微微發光，中央為中文字詞 */
export function Apple({ x, y, word, hovered, isNew, sizeScale = 1, onPick }: AppleProps) {
  const size = `calc(clamp(84px, 8.5vw, 132px) * ${sizeScale})`;
  return (
    <button
      type="button"
      onPointerDown={onPick}
      aria-label={`仁愛果實：${word}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: isNew ? "apple-grow 0.7s cubic-bezier(0.2,0.9,0.3,1.2)" : undefined,
      }}
    >
      <span
        className="animate-apple-breathe block"
        style={{ animationDelay: `${(x % 7) * 0.35}s` }}
      >
        <span
          className="relative block transition-[transform,filter] duration-200 ease-out"
          style={{
            width: size,
            height: size,
            transform: hovered ? "scale(1.09)" : "scale(1)",
            filter: hovered
              ? "drop-shadow(0 0 26px color-mix(in oklab, var(--apple-glow) 70%, transparent))"
              : "drop-shadow(0 0 14px color-mix(in oklab, var(--apple-glow) 40%, transparent))",
            animation: hovered ? "apple-shake 0.32s ease-in-out infinite" : undefined,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id={`apple-body-${x}-${y}`} cx="34%" cy="26%" r="78%">
                <stop
                  offset="0%"
                  stopColor="color-mix(in oklab, var(--apple-glow) 85%, white 15%)"
                />
                <stop offset="52%" stopColor="var(--apple)" />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--apple) 68%, black)"
                />
              </radialGradient>
            </defs>
            {/* 果梗 */}
            <path
              d="M50 24 C50 14, 54 8, 60 4"
              fill="none"
              stroke="color-mix(in oklab, var(--bark, #6b4a2f) 90%, black 10%)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* 葉子 */}
            <path
              d="M55 16 C64 4, 80 4, 84 8 C80 20, 66 24, 55 16 Z"
              fill="var(--leaf)"
            />
            {/* 蘋果本體 */}
            <path
              d="M50 30 C43 18, 24 16, 15 32 C5 51, 17 85, 33 91 C40 94, 45 89, 50 89 C55 89, 60 94, 67 91 C83 85, 95 51, 85 32 C76 16, 57 18, 50 30 Z"
              fill={`url(#apple-body-${x}-${y})`}
            />
            {/* 高光 */}
            <ellipse
              cx="33"
              cy="42"
              rx="11"
              ry="14"
              fill="color-mix(in oklab, white 62%, transparent)"
              opacity="0.55"
              transform="rotate(-22 33 42)"
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center pt-[6%] font-display text-cream"
            style={{
              fontSize: word.length > 2 ? "clamp(17px, 1.7vw, 26px)" : "clamp(23px, 2.3vw, 34px)",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textShadow: "0 2px 6px color-mix(in oklab, black 45%, transparent)",
            }}
          >
            {word}
          </span>
        </span>
      </span>
    </button>
  );
}
