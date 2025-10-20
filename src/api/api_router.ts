import { Hono } from 'hono';
import { getUserSessionMiddleware } from './context';

const router = new Hono().use(getUserSessionMiddleware);

export const api_handler = new Hono().route('/api', router);

export type Router = typeof router;
