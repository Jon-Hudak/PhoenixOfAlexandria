import { defineConfig, sharpImageService } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  }), preact()],
  site: "https://www.PLACEHOLDER.com"
});