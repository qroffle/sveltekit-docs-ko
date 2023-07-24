<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Nav, NavItem, Separator, Shell } from '@sveltejs/site-kit/components';

    import '@sveltejs/site-kit/styles/index.css';
</script>


<Shell>
    <Nav slot="top-nav">
        <svelte:fragment slot="home">
            <span><strong>SvelteKit</strong> 한국어 문서</span>
        </svelte:fragment>

        <svelte:fragment slot="nav-right">
            <NavItem selected={!$page.url.pathname.startsWith(`${base}/faq`) || undefined}
                     href="{base}/">
                문서
            </NavItem>

            <NavItem selected={$page.url.pathname.startsWith(`${base}/faq`) || undefined}
                     href="{base}/faq">
                자주 묻는 질문
            </NavItem>

            <NavItem external="https://learn.svelte.dev/tutorial/introducing-sveltekit">튜토리얼</NavItem>

            <Separator />

            <NavItem external="https://kit.svelte.dev">SvelteKit</NavItem>
            <NavItem external="https://svelte.dev">Svelte</NavItem>
        </svelte:fragment>
    </Nav>

    <slot />
</Shell>

<style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.7/dist/web/variable/pretendardvariable-dynamic-subset.css');
    :root {
        --sk-font: 'Pretendard Variable', 'Overpass', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    }
</style>
