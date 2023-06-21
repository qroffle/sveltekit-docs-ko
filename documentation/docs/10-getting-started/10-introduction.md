---
title: 소개합니다
---

## Before we begin

> Svelte 또는 SvelteKit 을 처음 접해보신다면, [인터랙티브 튜토리얼 (영문)](https://learn.svelte.dev)을 확인해 보시는건 어떠세요?
>
> [디스코드 서버](https://svelte.dev/chat) 에서 도움을 받으실 수도 있습니다.

## What is SvelteKit?

SvelteKit 은 [Svelte](https://svelte.dev/) 를 사용하여 강력하고 성능이 우수한 웹 애플리케이션을 빠르게 개발할 수 있는 프레임워크입니다.
React 에서 오신 분이라면, SvelteKit 은 Next 와 비슷합니다. Vue 에서 오신 분이라면, SvelteKit 은 Nuxt 와 비슷합니다.

## What is Svelte?

Svelte 는 사용자가 브라우저에서 보고 상호작용하는 UI 컴포넌트를 작성하는 방법입니다. 네비게이션 바, 댓글 섹션, 또는 연락처 양식과 같은 컴포넌트를 작성할 수 있습니다.
Svelte 컴파일러는 컴포넌트를 페이지의 HTML 로 렌더링하고 페이지에 스타일을 적용할 수 있는 JavaScript 로 변환합니다.
이 가이드의 나머지 부분을 이해하려면 Svelte 를 알 필요는 없지만, 도움이 될 것입니다. 더 알고 싶다면 [Svelte 튜토리얼](https://svelte.dev/tutorial) 을 확인해 보세요.

## SvelteKit vs Svelte

SvelteKit 은 Svelte 의 상위 집합입니다.

Svelte 는 UI 컴포넌트를 렌더링합니다.
이러한 컴포넌트를 조합하여 Svelte 만으로 전체 페이지를 렌더링할 수 있지만, 전체 앱을 작성하려면 Svelte 만으로는 부족합니다.

SvelteKit 은 Svelte 의 기능을 확장하여 전체 앱을 작성할 수 있도록 합니다.
SvelteKit 은 [라우터](glossary#routing) 와 같은 기본 기능을 제공합니다. 이는 링크를 클릭할 때 UI 를 업데이트합니다.
그리고 [서버 사이드 렌더링 (SSR)](glossary#ssr) 을 포함합니다. 그러나 그 이상으로 모던한 앱을 만드는 것은 굉장히 복잡합니다.
이러한 모던한 앱을 만드는 것은 [빌드 최적화](https://vitejs.dev/guide/features.html#build-optimizations)를 포함하여 링크를 클릭하기 전에 페이지를 [사전 로드](link-options#data-sveltekit-preload-data)하고,
[오프라인 지원](service-workers)을 제공하며, [SSR](glossary#ssr) 로 서버에서 앱을 렌더링하거나, [CSR](glossary#csr) 로 브라우저에서 앱을 렌더링하거나,
[사전 렌더링](glossary#prerendering)으로 빌드 시간에 앱을 렌더링하는 것을 포함합니다.
SvelteKit 은 이러한 모든 지루한 작업을 대신 처리하여 창의적인 부분에 집중할 수 있도록 합니다.

SvelteKit 은 [Vite](https://vitejs.dev/) 와 [Svelte 플러그인](https://github.com/sveltejs/vite-plugin-svelte) 을 활용하여 [Hot Module Replacement (HMR)](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#hot) 를 수행합니다.
이는 브라우저에서 코드를 실시간으로 반영하여 빠르고 기능이 풍부한 개발 경험을 제공합니다.