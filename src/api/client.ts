import { hc } from 'hono/client';
import type { Router } from './api_router';
import { browser } from '$app/environment';

export const client = hc<Router>((browser ? window.location.origin : '') + '/api');
