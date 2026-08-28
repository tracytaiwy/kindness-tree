import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { KindnessTreeScene } from "@/components/tree/KindnessTreeScene";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "仁愛之樹 · 開學日互動體驗" },
      {
        name: "description",
        content:
          "開學第一天早上的校門互動裝置：揮揮手摘下仁愛蘋果，讓關愛、同理心與尊重化成愛心，一起讓仁愛之樹成長。",
      },
      { property: "og:title", content: "仁愛之樹 · 開學日互動體驗" },
      {
        property: "og:description",
        content: "揮揮手，向仁愛之樹打個招呼，一起收集全校的仁愛果實。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly
      fallback={
        <div
          className="flex h-[100dvh] w-screen items-center justify-center"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 10%, var(--sunlight) 0%, color-mix(in oklab, var(--leaf) 40%, var(--cream)) 100%)",
          }}
        >
          <p className="font-display text-3xl text-bark">仁愛之樹 · 準備中…</p>
        </div>
      }
    >
      <KindnessTreeScene />
    </ClientOnly>
  );
}
