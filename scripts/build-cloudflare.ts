#!/usr/bin/env bun
/**
 * Loads env vars from the Cloudflare Worker dashboard into process.env,
 * then builds with BUILD_MODE=cloudflare (local `.env` is ignored via vite envDir: false).
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const WORKER_NAME = 'tsc-users';

function getAccountId(): string {
  const text = spawnSync('bunx', ['wrangler', 'whoami'], { encoding: 'utf8' }).stdout ?? '';
  const accountId = text.match(/│\s*([a-f0-9]{32})\s*│/)?.[1];
  if (!accountId) throw new Error('Could not resolve Cloudflare account id. Run `wrangler login`.');
  return accountId;
}

function getWranglerToken(): string {
  const configPath = resolve(process.env.HOME ?? '', '.config/.wrangler/config/default.toml');
  if (!existsSync(configPath)) throw new Error('Run `wrangler login` first.');
  const match = readFileSync(configPath, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/);
  if (!match) throw new Error('No oauth_token in wrangler config.');
  return match[1];
}

async function loadDashboardEnv() {
  const accountId = getAccountId();
  const token = getWranglerToken();
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${WORKER_NAME}/settings`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch Worker settings: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as {
    result: { bindings: Array<{ type: string; name: string; text?: string }> };
  };
  const loaded: string[] = [];
  for (const binding of data.result.bindings ?? []) {
    if (binding.type === 'plain_text' && binding.name && binding.text != null) {
      // Dashboard wins — do not keep any local shell/.env value for this build.
      process.env[binding.name] = binding.text;
      loaded.push(binding.name);
    }
  }
  if (!loaded.length) throw new Error('No plain_text bindings found on the Worker dashboard.');
  console.log(`Loaded ${loaded.length} dashboard env vars: ${loaded.join(', ')}`);
}

await loadDashboardEnv();
process.env.BUILD_MODE = 'cloudflare';

const result = spawnSync('bun', ['run', 'build'], {
  stdio: 'inherit',
  env: process.env
});
process.exit(result.status ?? 1);
