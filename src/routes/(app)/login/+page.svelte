<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { signIn } from '$lib/auth-client';
  import { Icon } from 'svelte-icons-pack';
  import { GoogleIcon } from '~/lib/components/icons';

  async function handleGoogleLogin() {
    await signIn.social({ provider: 'google', callbackURL: window.location.origin + '/' });
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>
<div class="flex min-h-[70vh] items-center justify-center">
  <div class="w-full max-w-sm space-y-6 text-center">
    <h1 class="text-2xl font-semibold tracking-tight">Sign in</h1>
    <p class="text-muted-foreground">Use your Google account to continue</p>

    <Button class="w-full gap-2" variant="outline" onclick={handleGoogleLogin}>
      <Icon src={GoogleIcon} className="size-5" />
      Continue with Google
    </Button>
  </div>
</div>
