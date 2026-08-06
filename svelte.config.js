import adapter_vercel from '@sveltejs/adapter-vercel';
import adapter_cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: process.env.BUILD_MODE == 'cloudflare' ? adapter_cloudflare() : adapter_vercel(),
    alias: {
      '~': 'src'
    }
  }
};

export default config;
