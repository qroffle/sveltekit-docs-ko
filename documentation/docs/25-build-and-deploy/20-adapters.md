---
title: 어댑터
---

빌드된 SvelteKit 앱을 배포하려면 배포 대상에 맞게 앱을 _조정_ 해야 합니다. 어댑터는 빌드된 앱을 입력으로 받아 배포를 위한 출력을 생성하는 작은 플러그인입니다.

다양한 플랫폼을 위한 공식 어댑터가 존재합니다 — 이들은 다음 페이지에서 문서화합니다:

- [`@sveltejs/adapter-cloudflare`](adapter-cloudflare) - Cloudflare Pages
- [`@sveltejs/adapter-cloudflare-workers`](adapter-cloudflare-workers) - Cloudflare Workers
- [`@sveltejs/adapter-netlify`](adapter-netlify) - Netlify
- [`@sveltejs/adapter-node`](adapter-node) - Node 서버
- [`@sveltejs/adapter-static`](adapter-static) - 정적 사이트 생성기 (SSG)
- [`@sveltejs/adapter-vercel`](adapter-vercel) - Vercel

또, 다른 플랫폼들을 위한 [커뮤니티 제공 어댑터](https://sveltesociety.dev/components#adapters)들이 존재합니다.

## Using adapters

사용할 어탭터는 `svelte.config.js` 에서 지정합니다:

```js
/// file: svelte.config.js
// @filename: ambient.d.ts
declare module 'svelte-adapter-foo' {
	const adapter: (opts: any) => import('@sveltejs/kit').Adapter;
	export default adapter;
}

// @filename: index.js
// ---cut---
import adapter from 'svelte-adapter-foo';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// adapter options go here
		})
	}
};

export default config;
```

## Platform-specific context

몇몇 어탭터들은 요청에 대한 추가 정보에 접근할 수 있습니다.
예를 들어, Cloudflare Workers 는 KV 네임스페이스 등을 포함하는 `env` 객체에 접근할 수 있습니다.
이는 [hooks](hooks) 와 [server routes](routing#server) 에서 사용되는 `RequestEvent` 에 `platform` 속성으로 전달될 수 있습니다 — 각 어탭터의 문서를 참고해 더 자세히 알아보세요.

