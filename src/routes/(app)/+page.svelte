<script lang="ts">
  import { user_info } from '~/state/user.svelte';
  import { signOut } from '$lib/auth-client';
  import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
  import { Popover, PopoverTrigger, PopoverContent } from '$lib/components/ui/popover';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';

  async function handleLogout() {
    await signOut();
    goto('/login');
  }
</script>

<svelte:head>
  <title>User Info</title>
</svelte:head>

<div class="space-y-6 py-8">
  {#if $user_info}
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <Avatar class="size-12">
          <AvatarImage src={$user_info.image ?? undefined} alt={$user_info.name ?? 'User'} />
          <AvatarFallback>{$user_info.name?.slice(0, 2)?.toUpperCase() ?? 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 class="text-xl font-semibold">{$user_info.name ?? 'Unnamed user'}</h2>
          <p class="text-muted-foreground">{$user_info.email}</p>
          {#if $user_info.username}
            <p class="text-muted-foreground">@{$user_info.username}</p>
          {/if}
          {#if $user_info.role}
            <p
              class="mt-1 inline-flex rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {$user_info.role}
            </p>
          {/if}
        </div>
      </div>

      <Popover>
        <PopoverTrigger>
          <Button type="button" variant="outline">Account</Button>
        </PopoverTrigger>
        <PopoverContent class="w-56">
          <div class="space-y-2">
            <div class="text-sm">
              <div class="font-medium">{$user_info.name ?? 'User'}</div>
              <div class="text-muted-foreground">{$user_info.email}</div>
            </div>
            <Button type="button" variant="destructive" class="w-full" onclick={handleLogout}>
              Log out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  {:else}
    <div class="text-muted-foreground">No user info found.</div>
  {/if}
</div>
