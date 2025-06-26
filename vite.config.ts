import { defineConfig } from "vite";
import path, { resolve } from "path";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  base: process.env.BASE_URL,

  define: {
    "process.env": {
      NODE_ENV: process.env.NODE_ENV,
      BASE_URL: process.env.BASE_URL,
      VITE_REACT_APP_ROUTER_BASE: process.env.VITE_REACT_APP_ROUTER_BASE,
      VITE_API_URL: process.env.VITE_API_URL,
      DEBUG: process.env.DEBUG,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "ti-react-template/components": path.resolve(
        __dirname,
        "./template-components"
      ),
    },
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://13.216.80.182:7001/",
  //       changeOrigin: true,
  //       secure: false,
  //       rewrite: (path) => path.replace(/^\/api/, "/trainings/api"),
  //     },
  //   },
  // },

  optimizeDeps: {
    include: ["@react-pdf-viewer/core", "@react-pdf-viewer/default-layout"],
  },
  build: {
    
    commonjsOptions: {
      include: [/@react-pdf-viewer/, /node_modules/],
    },
    emptyOutDir: true,
    outDir: "dist/",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});
