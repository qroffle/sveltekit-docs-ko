<script>
    import * as hovers from '$lib/docs/client/hovers.js';

    /** @type {import('./$types').PageData} */
    export let data;

    hovers.setup();
</script>

<svelte:head>
    <title>자주 묻는 질문 • SvelteKit 한국어 문서</title>

    <meta name="twitter:title" content="SvelteKit 자주 묻는 질문" />
    <meta name="twitter:description" content="SvelteKit 과 관련된 자주 묻는 질문들의 모음입니다." />
    <meta name="description" content="SvelteKit 과 관련된 자주 묻는 질문들의 모음입니다." />
</svelte:head>

<div class="faqs text">
    <h1>자주 묻는 질문</h1>
    <div class="faqs-content">
        <section>
            {#each data.sections as faq}
                <article class="faq">
                    <h2 id={faq.slug}>
                        {faq.title}

                        <a href="#{faq.slug}" class="permalink">
                            <span class="visually-hidden">permalink</span>
                        </a>
                    </h2>
                    {@html faq.content}
                </article>
            {/each}
        </section>
    </div>
</div>

<style>
    .faqs {
        padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom)
        var(--sk-page-padding-side);
    }

    h1,
    .faqs-content {
        max-width: var(--sk-line-max-width);
        margin: 0 auto;
    }
</style>
