import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const isCloudflareBuild = process.env.BUILD_MODE === 'cloudflare';

export default defineConfig({
  // Cloudflare builds must not bake local `.env` into the bundle — runtime vars
  // come from the Worker dashboard bindings.
  envDir: isCloudflareBuild ? false : undefined,
  plugins: [tailwindcss(), sveltekit(), devtoolsJson()]
});
