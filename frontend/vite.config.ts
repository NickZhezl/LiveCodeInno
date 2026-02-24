import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api/piston": {
        target: "http://localhost:2000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/piston/, ""),
      },
      "/yjs": {
        target: "ws://127.0.0.1:1234",
        ws: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
});