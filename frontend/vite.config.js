import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:8000",
      "/assessment": "http://localhost:8000",
      "/me": "http://localhost:8000",
    },
  },
  build: {
    sourcemap: false,
    minify: "esbuild",
  },
});
