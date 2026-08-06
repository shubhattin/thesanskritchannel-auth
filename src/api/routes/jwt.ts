import { tbValidator } from '@hono/typebox-validator';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { Hono } from 'hono';
import { createLocalJWKSet, decodeProtectedHeader, jwtVerify, type JSONWebKeySet } from 'jose';
import ky from 'ky';
import { REDIS_CACHE_KEYS, redis } from '~/db/redis';
import Type from 'typebox';
import { Value } from 'typebox/value';

const jwksResponseSchema = Type.Object({
  keys: Type.Array(Type.Record(Type.String(), Type.Unknown()))
});

function getJwksCacheKey() {
  return REDIS_CACHE_KEYS.current_jwks_token(PUBLIC_BETTER_AUTH_URL);
}

async function fetchAndCacheJwks(): Promise<JSONWebKeySet> {
  const cacheKey = getJwksCacheKey();
  const fetchedJwks = Value.Parse(
    jwksResponseSchema,
    await ky
      .get(new URL('/api/auth/jwks', PUBLIC_BETTER_AUTH_URL), {
        timeout: 5000
      })
      .json()
  ) as JSONWebKeySet;

  // No Redis TTL: Better Auth JWKS changes rarely and can be cached indefinitely.
  // Stale entries are refreshed when a token's `kid` is missing from cache (see getJwksForToken).
  // https://better-auth.com/docs/plugins/jwt#verifying-the-token
  await redis.set(cacheKey, fetchedJwks);
  return fetchedJwks;
}

async function getCachedJwks(): Promise<JSONWebKeySet | null> {
  const cacheKey = getJwksCacheKey();
  const cachedJwks = await redis.get<JSONWebKeySet>(cacheKey);
  if (cachedJwks) {
    return Value.Parse(jwksResponseSchema, cachedJwks) as JSONWebKeySet;
  }

  return null;
}

/** True when cached JWKS includes the key id (`kid`) from the JWT header. */
function jwksContainsKid(jwks: JSONWebKeySet, kid: string | undefined) {
  if (!kid) {
    return jwks.keys.length > 0;
  }

  return jwks.keys.some((key) => key.kid === kid);
}

/**
 * Resolve JWKS for verifying this token.
 *
 * Better Auth signs JWTs with a key whose id (`kid`) is in the token header. If we
 * have a cached JWKS but none of its keys match that `kid` (e.g. after key rotation),
 * refetch from `/api/auth/jwks` instead of relying on a time-based cache expiry.
 *
 * @see https://better-auth.com/docs/plugins/jwt#verifying-the-token
 */
async function getJwksForToken(token: string) {
  const { kid } = decodeProtectedHeader(token);
  const cachedJwks = await getCachedJwks();

  if (cachedJwks && jwksContainsKid(cachedJwks, kid)) {
    return cachedJwks;
  }

  return fetchAndCacheJwks();
}

const router = new Hono().get(
  '/verify',
  tbValidator('query', Type.Object({ token: Type.String() })),
  async (c) => {
    const { token } = c.req.valid('query');

    try {
      let jwks = await getJwksForToken(token);
      let jwkSet = createLocalJWKSet(jwks);
      let verifiedToken;

      try {
        verifiedToken = await jwtVerify(token, jwkSet, {
          issuer: PUBLIC_BETTER_AUTH_URL,
          audience: PUBLIC_BETTER_AUTH_URL
        });
      } catch {
        // `kid` matched but verify still failed (e.g. grace-period overlap); refetch once.
        jwks = await fetchAndCacheJwks();
        jwkSet = createLocalJWKSet(jwks);
        verifiedToken = await jwtVerify(token, jwkSet, {
          issuer: PUBLIC_BETTER_AUTH_URL,
          audience: PUBLIC_BETTER_AUTH_URL
        });
      }

      const { payload, protectedHeader } = verifiedToken;

      return c.json(
        {
          valid: true,
          payload,
          protectedHeader
        },
        200
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token verification failed';
      return c.json(
        {
          valid: false,
          error: message
        },
        401
      );
    }
  }
);

export const jwt_router = router;
