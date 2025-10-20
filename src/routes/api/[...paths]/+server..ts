import { api_handler } from '~/api/api_router';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request }) => api_handler.fetch(request);
export const POST: RequestHandler = ({ request }) => api_handler.fetch(request);
