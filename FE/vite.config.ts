import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_")
  const apiUrl = env.VITE_API_URL ?? "http://localhost:8080/api"
  const apiOriginPattern = new RegExp(
    `^${apiUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("/api", "")}/api/.*`,
    "i"
  )

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: true, // Bật PWA cả trong dev để test
        },
        includeAssets: ["tori_icon.png"],
        manifest: {
          name: "Tori Coffee",
          short_name: "Tori Coffee",
          description: "Sổ công thức pha chế Tori Coffee — tra cứu nhanh trên điện thoại",
          theme_color: "#d97706",
          background_color: "#fafaf9",
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/",
          start_url: "/so-cong-thuc",
          lang: "vi",
          icons: [
            {
              src: "tori_icon.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "tori_icon.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "tori_icon.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          categories: ["food", "productivity", "utilities"],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: apiOriginPattern,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24h
                },
                networkTimeoutSeconds: 5,
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
