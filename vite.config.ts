import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // 把原本的 vite: { base: '/kindness-tree/' } 刪除或註解掉
  tanstackStart: {
    server: { entry: "server" },
  },
});
