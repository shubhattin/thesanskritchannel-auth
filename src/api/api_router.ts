import { Hono } from 'hono';
import { getUserSessionMiddleware } from './context';
import { app_scopes_router } from './routes/app_scopes';

const router = new Hono().use(getUserSessionMiddleware).route('/app_scopes', app_scopes_router);

export const api_handler = new Hono().route('/api', router);

export type Router = typeof router;
