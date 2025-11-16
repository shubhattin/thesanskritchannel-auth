import { db } from '~/db/db';
import { user_app_scope_join, AppScopeEnum } from '~/db/schema';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { redis } from '~/db/redis';
import { REDIS_CACHE_KEYS } from '~/db/redis';
import { Hono } from 'hono';
import { protectedAdminRoute, protectedRoute } from '../context';
import { zValidator } from '@hono/zod-validator';
import ms from 'ms';
import { waitUntil } from '@vercel/functions';

const CACHE_TIME_S = ms('25days') / 1000;

const router = new Hono()
  .get('/get_user_app_scope_list', protectedAdminRoute, async (c) => {
    const user = c.get('user')!;
    const app_scopes = await db.query.user_app_scope_join.findMany({
      where: (tbl, { eq }) => eq(tbl.user_id, user.id)
    });
    return c.json(app_scopes.map((scope) => scope.scope));
  })
  .get(
    '/get_user_app_scope_status',
    //  public route
    zValidator('query', z.object({ scope_name: AppScopeEnum, user_id: z.string() })),
    async (c) => {
      const { scope_name, user_id } = c.req.valid('query');
      const cache = await redis.get<boolean>(REDIS_CACHE_KEYS.user_app_scope(user_id, scope_name));
      if (cache !== null && cache !== undefined) return c.json(Boolean(cache));

      const app_scope = await db.query.user_app_scope_join.findFirst({
        where: (tbl, { eq, and }) => and(eq(tbl.user_id, user_id), eq(tbl.scope, scope_name))
      });
      // store cache in background
      waitUntil(
        redis.set(REDIS_CACHE_KEYS.user_app_scope(user_id, scope_name), !!app_scope, {
          ex: CACHE_TIME_S
        })
      );

      return c.json(!!app_scope);
    }
  )
  .post(
    '/add_user_app_scope',
    protectedRoute,
    zValidator('json', z.object({ scope: AppScopeEnum, user_id: z.string() })),
    async (c) => {
      const { scope, user_id } = c.req.valid('json');
      await db.insert(user_app_scope_join).values({ user_id, scope });
      // precache the result in background
      waitUntil(
        redis.set(REDIS_CACHE_KEYS.user_app_scope(user_id, scope), true, {
          ex: CACHE_TIME_S
        })
      );
      return c.json({ success: true });
    }
  )
  .post(
    '/remove_user_app_scope',
    protectedAdminRoute,
    zValidator('json', z.object({ scope: AppScopeEnum, user_id: z.string() })),
    async (c) => {
      const { scope, user_id } = c.req.valid('json');
      await Promise.all([
        db
          .delete(user_app_scope_join)
          .where(
            and(eq(user_app_scope_join.user_id, user_id), eq(user_app_scope_join.scope, scope))
          ),
        redis.del(REDIS_CACHE_KEYS.user_app_scope(user_id, scope))
      ]);
      return c.json({ success: true });
    }
  );

export const app_scopes_router = router;
