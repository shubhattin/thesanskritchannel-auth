import { Hono } from 'hono';
import { getUserSessionMiddleware } from './context';
import { app_scopes_router } from './routes/app_scopes';
import { user_router } from './routes/user';

const router = new Hono()
  .use(getUserSessionMiddleware)
  .route('/app_scope', app_scopes_router)
  .route('/user', user_router);

export const api_handler = new Hono().route('/api', router);

export type Router = typeof router;
