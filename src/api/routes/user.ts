import { Hono } from 'hono';
import { protectedAdminRoute } from '../context';
import { db } from '~/db/db';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { auth } from '~/lib/auth';
import { redis } from '~/db/redis';
import { user } from '~/db/auth-schema';
import { eq } from 'drizzle-orm';

const router = new Hono()
  .use(protectedAdminRoute)
  // all routes are protected admin routes
  .get('/list_users', zValidator('query', z.object({ user_id: z.string() })), async (c) => {
    const { user_id } = c.req.valid('query');

    const users = await db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      where: ({ id }, { ne }) => ne(id, user_id),
      with: {
        app_scopes: {
          columns: {
            scope: true
          }
        }
      }
    });
    return c.json(users);
  })
  .delete('/remove_user', zValidator('query', z.object({ user_id: z.string() })), async (c) => {
    const cookie = c.header('Cookie');
    const { user_id } = c.req.valid('query');
    const { sessions } = await auth.api.listUserSessions({
      body: {
        userId: user_id
      },
      headers: {
        Cookie: cookie!
      }
    });
    await Promise.allSettled([db.delete(user).where(eq(user.id, user_id))]);
    await Promise.allSettled([
      ...sessions.map(async (session, i) => {
        await redis.del(session.token);
      })
    ]);
    return c.json({ success: true });
  });

export const user_router = router;
