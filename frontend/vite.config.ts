import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const STUB = `
export default {};
export const readFile = undefined;
export const writeFile = undefined;
export const access = undefined;
export const stat = undefined;
export const readdir = undefined;
`;

const STREAM_PROMISES_STUB = `
export const access = undefined;
export const copyFile = undefined;
export const open = undefined;
export const opendir = undefined;
export const rename = undefined;
export const truncate = undefined;
export const rm = undefined;
export const rmdir = undefined;
export const mkdir = undefined;
export const readdir = undefined;
export const readlink = undefined;
export const symlink = undefined;
export const lstat = undefined;
export const stat = undefined;
export const link = undefined;
export const unlink = undefined;
export const chmod = undefined;
export const lchmod = undefined;
export const lchown = undefined;
export const chown = undefined;
export const utimes = undefined;
export const lutimes = undefined;
export const realpath = undefined;
export const mkdtemp = undefined;
export const writeFile = undefined;
export const appendFile = undefined;
export const readFile = undefined;
export const watch = undefined;
export const constants = {};
`;

export default defineConfig({
  plugins: [
    nodePolyfills({
      protocolImports: true,
      globals: { Buffer: true, global: true, process: true },
      // Exclude pyodide from polyfill processing
      exclude: ["process"],
    }),

    {
      name: "fix-empty-js-promises",
      enforce: "pre",
      resolveId(source) {
        // 1) срезаем ?query и #hash
        const clean = source.split("?")[0].split("#")[0];
        // 2) нормализуем Windows \ -> /
        const norm = clean.replace(/\\/g, "/");

        // Ловим и относительные, и абсолютные пути
        if (norm.includes("node-stdlib-browser/esm/mock/empty.js/promises")) {
          return "\0__empty_js_promises__";
        }

        // Fix stream-browserify/promises
        if (norm.includes("stream-browserify/promises")) {
          return "\0__stream_promises__";
        }

        return null;
      },
      load(id) {
        if (id === "\0__empty_js_promises__") return STUB;
        if (id === "\0__stream_promises__") return STREAM_PROMISES_STUB;
        return null;
      },
    },

    {
      name: "pyodide-external",
      resolveId(source) {
        // Mark pyodide as external to load from CDN at runtime
        if (source === "pyodide" || source.startsWith("pyodide/")) {
          return { id: source, external: true };
        }
        return null;
      },
      renderChunk(code) {
        // Replace any remaining pyodide imports with CDN reference
        return code.replace(
          /import\s*\{\s*([^}]+)\s*\}\s*from\s*["']pyodide["']/g,
          "// Pyodide loaded from CDN"
        );
      },
    },

    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large dependencies
          pglite: ["@electric-sql/pglite"],
        },
      },
    },
    // Increase chunk size warning limit for pglite
    chunkSizeWarningLimit: 6000,
  },
  // Define global variables for polyfills
  define: {
    global: "globalThis",
  },
});
