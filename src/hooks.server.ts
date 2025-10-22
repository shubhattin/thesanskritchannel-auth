import type { Handle } from '@sveltejs/kit';
import { auth, ALLOWED_ORIGINS } from '$lib/auth'; // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

export const AUTH_DOMAIN_REGEX = new RegExp(`^https:\/\/.*\.${env.AUTH_DOMAIN}$`);

export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get('origin');
  const isAllowedOrigin =
    !!origin &&
    (import.meta.env.PROD
      ? ALLOWED_ORIGINS.includes(origin) || (env.AUTH_DOMAIN && AUTH_DOMAIN_REGEX.test(origin))
      : /^http:\/\/localhost:.+$/.test(origin));
  const IS_CORS_ALLOWED_URL = /^\/api\/.+$/.test(event.url.pathname);
  // Required for CORS to work
  if (IS_CORS_ALLOWED_URL && event.request.method === 'OPTIONS' && isAllowedOrigin) {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With, X-Captcha-Response' + ', X-Bhasha',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': origin,
        Vary: 'Origin'
      }
    });
  }
  const res: Response = await svelteKitHandler({
    event,
    resolve,
    auth,
    building
  });
  if (IS_CORS_ALLOWED_URL && isAllowedOrigin) {
    res.headers.append('Access-Control-Allow-Origin', origin);
    res.headers.append('Access-Control-Allow-Credentials', 'true');
    res.headers.append('Vary', 'Origin');
  }
  return res;
};

// buffer pollyfill for netlify
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
