import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  // ВАЖНО: Блок server должен быть здесь!
  server: {
  host: true,
  proxy: {
    "/api/piston": {
      target: "http://localhost:2000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/piston/, ""),
    },
    "/yjs": {
      target: "ws://127.0.0.1:8000",
      ws: true,
    },
  },
},


  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },

  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        interviewReport: resolve(root, "interviewReport", "index.html"),
      },
    },
  },
});