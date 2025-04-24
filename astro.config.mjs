// @ts-nocheck
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://carajo-stream.vercel.app",
  integrations: [react(), sitemap()],
  output: "server",

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
