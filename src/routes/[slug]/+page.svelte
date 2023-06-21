<script>
    import { page } from '$app/stores';
    import { Icon } from '@sveltejs/site-kit/components';
    import * as hovers from '$lib/docs/client/hovers.js';
    import OnThisPage from './OnThisPage.svelte';
    import Contents from '$lib/docs/Contents.svelte';
    import { TSToggle } from '@sveltejs/site-kit/components';

    /** @type {import('./$types').PageData} */
    export let data;

    $: pages = data.sections.flatMap((section) => section.pages);

    let index;
    $: index = pages.findIndex(({ path }) => path === $page.url.pathname);
    $: prev = pages[index - 1];
    $: next = pages[index + 1];

    hovers.setup();
</script>

<svelte:head>
    <title>{data.page.title} • SvelteKit 한국어 문서</title>

    <meta name="twitter:title" content="SvelteKit 한국어 문서" />
    <meta name="twitter:description" content="{data.page.title} • SvelteKit 한국어 문서" />
    <meta name="Description" content="{data.page.title} • SvelteKit 한국어 문서" />
</svelte:head>

<div class="container">
    <div class="page">
        <div class="text content">
            <h1>{data.page.title}</h1>

            <a class="edit" href="https://github.com/qroffle/sveltekit-docs-ko/edit/master/documentation/{data.page.file}">
                <Icon size={50} name="edit" /> GitHub 에서 페이지 편집하기
            </a>

            <section>
                {@html data.page.content}
            </section>

            <div class="controls">
                <div>
                    <span class:faded={!prev}>이전</span>
                    {#if prev}
                        <a href={prev.path}>{prev.title}</a>
                    {/if}
                </div>

                <div>
                    <span class:faded={!next}>다음</span>
                    {#if next}
                        <a href={next.path}>{next.title}</a>
                    {/if}
                </div>
            </div>
        </div>

        <OnThisPage details={data.page} />
    </div>

    <div class="toc-container">
        <Contents contents={data.sections} />
    </div>

    <div class="ts-toggle">
        <TSToggle />
    </div>
</div>

<style>
    .container {
        --sidebar-menu-width: 28rem;
        --sidebar-width: var(--sidebar-menu-width);
        --ts-toggle-height: 4.2rem;
    }

    .page {
        --on-this-page-display: none;
        padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
    }

    .toc-container {
        background: var(--sk-back-3);
    }

    .toc-container::-webkit-scrollbar {
        display: none;
    }

    .ts-toggle {
        width: 100%;
        border-top: 1px solid var(--sk-back-4);
        background-color: var(--sk-back-3);
    }

    @media (min-width: 832px) {
        .toc-container {
            width: var(--sidebar-width);
            height: calc(
                    100vh - var(--sk-nav-height) - var(--ts-toggle-height) - var(--sk-banner-bottom-height)
            );
            position: fixed;
            left: 0;
            top: var(--sk-nav-height);
            overflow-x: hidden;
            overflow-y: auto;
        }

        .toc-container::before {
            content: '';
            position: fixed;
            width: 0;
            height: 100%;
            top: 0;
            left: calc(var(--sidebar-width) - 1px);
            border-right: 1px solid var(--sk-back-5);
        }

        .page {
            padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
        }

        .ts-toggle {
            position: fixed;
            width: var(--sidebar-width);
            bottom: var(--sk-banner-bottom-height);
            z-index: 1;
            margin-right: 0;
            border-right: 1px solid var(--sk-back-5);
        }
    }

    @media (min-width: 1200px) {
        .container {
            --sidebar-width: max(28rem, 23vw);
        }

        .page {
            --on-this-page-display: block;
            padding: var(--sk-page-padding-top) calc(var(--sidebar-width) + var(--sk-page-padding-side));
            margin: 0 auto;
            max-width: var(--sk-line-max-width);
            box-sizing: content-box;
        }
    }

    .content {
        width: 100%;
        margin: 0;
    }

    .edit {
        position: relative;
        font-size: 1.4rem;
        line-height: 1;
        z-index: 2;
    }

    .edit :global(.icon) {
        position: relative;
        top: -0.1rem;
        left: 0.3rem;
        width: 1.4rem;
        height: 1.4rem;
        margin-right: 0.5rem;
    }

    .controls {
        max-width: calc(var(--sk-line-max-width) + 1rem);
        border-top: 1px solid var(--sk-back-4);
        padding: 1rem 0 0 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: 6rem 0 0 0;
    }

    .controls > :first-child {
        text-align: left;
    }

    .controls > :last-child {
        text-align: right;
    }

    .controls span {
        display: block;
        font-size: 1.2rem;
        text-transform: uppercase;
        font-weight: 600;
        color: var(--sk-text-3);
    }

    .controls span.faded {
        opacity: 0.4;
    }
</style>
