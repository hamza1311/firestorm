<script lang="ts">
    import { Dropdown, DropdownItem, Avatar } from 'flowbite-svelte';
    import { profile } from '../db/users';

    export let signout: () => void;
</script>

{#if $profile !== null}
    <Avatar
        id="profile-user-avatar"
        class="cursor-pointer hover:shadow"
        src={$profile.avatar ?? ''}
    />
    <Dropdown triggeredBy="#profile-user-avatar">
        <div slot="header" class="px-4 py-2">
            <span class="block text-sm font-bold text-gray-900 dark:text-white">
                {$profile.username}
            </span>
            <span class="block truncate text-sm font-medium"> {$profile.email} </span>
        </div>
        <DropdownItem href="/profile/settings">Settings</DropdownItem>
        <DropdownItem slot="footer" on:click={signout}>Sign out</DropdownItem>
    </Dropdown>
{/if}
