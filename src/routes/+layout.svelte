<script>
  import CookieCacheRefresh from '$lib/CookieCacheRefresh.svelte';
  import InitUserState from './InitUserState.svelte';
  import '@fontsource/roboto/latin.css';
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { queryClient } from '~/state/queryClient';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';

  let { children } = $props();
</script>

<QueryClientProvider client={queryClient}>
  <ModeWatcher />
  <div class="contaiiner mx-auto mb-1 max-w-screen-lg">
    <div class="mx-2">
      {@render children()}
    </div>
  </div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>

<InitUserState />
<CookieCacheRefresh />
