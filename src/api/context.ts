import type { Context, Next } from 'hono';
import { auth } from '~/lib/auth';

type SessionType = typeof auth.$Infer.Session;

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionType['user'] | null;
    session: SessionType['session'] | null;
  }
}

export const getUserSessionMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });
  // @ts-ignore
  c.set('session', session?.session);
  // @ts-ignore
  c.set('user', session?.user);

  await next();
};

export const protectedRoute = async (c: Context, next: Next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

export const protectedAdminRoute = async (c: Context, next: Next) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  if (user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
};
