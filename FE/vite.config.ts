import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig(({ mode }) => {
  // Đọc env theo mode (development / production) để dùng trong vite.config
  const env = loadEnv(mode, process.cwd(), "VITE_")
  const apiUrl = env.VITE_API_URL ?? "http://localhost:8080/api"
  // Tạo pattern từ base URL (loại bỏ /api path để match mọi request)
  const apiOriginPattern = new RegExp(
    `^${apiUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("/api", "")}/api/.*`,
    "i"
  )

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "Coffee Manager - Sổ Công Thức",
          short_name: "Coffee Manager",
          description: "Hệ thống quản lý và tra cứu công thức pha chế nội bộ",
          theme_color: "#d97706",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          lang: "vi",
          icons: [
            {
              src: "favicon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
          categories: ["food", "productivity", "utilities"],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              // Pattern đọc từ env — không hardcode
              urlPattern: apiOriginPattern,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24,
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
