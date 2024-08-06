import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.platform": JSON.stringify(process.platform),
    "process.env": {},
  },
  plugins: [react()],
  base: "/radio-alert",
  server: {
    port: 4200,
    host: "localhost",
  },
  build: {
    outDir: "dist",
  },
});
