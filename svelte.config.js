import adapter_vercel from '@sveltejs/adapter-vercel';
import adapter_cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { existsSync } from 'node:fs';

// Cloudflare Workers Builds does not inject runtime dashboard bindings into the
// build environment. Prefer the Cloudflare adapter whenever wrangler.jsonc is
// present, unless BUILD_MODE=vercel is set explicitly.
const useCloudflare =
  process.env.BUILD_MODE === 'cloudflare' ||
  (process.env.BUILD_MODE !== 'vercel' && existsSync(new URL('./wrangler.jsonc', import.meta.url)));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: useCloudflare ? adapter_cloudflare() : adapter_vercel(),
    alias: {
      '~': 'src'
    }
  }
};

export default config;
