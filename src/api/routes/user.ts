import { Hono } from 'hono';
import { protectedAdminRoute } from '../context';
import { db } from '~/db/db';
import { tbValidator } from '@hono/typebox-validator';
import Type from 'typebox';

const router = new Hono()
  .use(protectedAdminRoute)
  // all routes are protected admin routes
  .get(
    '/list_users',
    tbValidator('query', Type.Object({ user_id: Type.String() })),
    async (c) => {
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
    }
  );

export const user_router = router;

// .post('/remove_user', tbValidator('json', Type.Object({ user_id: Type.String() })), async (c) => {
//   const cookie = c.header('Cookie');
//   const { user_id } = c.req.valid('json');
//   const { sessions } = await auth.api.listUserSessions({
//     body: {
//       userId: user_id
//     },
//     headers: {
//       Cookie: cookie!
//     }
//   });
//   await Promise.allSettled([db.delete(user).where(eq(user.id, user_id))]);
//   await Promise.allSettled([
//     ...sessions.map(async (session, i) => {
//       await redis.del(session.token);
//     })
//   ]);
//   return c.json({ success: true });
// });
