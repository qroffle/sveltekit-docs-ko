---
title: 단일 페이지 앱
---

어댑터와 관계없이 SvelteKit 은 루트 레이아웃에서 SSR 을 비활성화 하는 것으로 완전히 클라이언트단 렌더링으로 작동하는 단일 페이지 앱(SPA)을 만들 수 있습니다.

```js
/// file: src/routes/+layout.js
export const ssr = false;
```

> 대부분의 경우에서 이러한 방법은 권장되지 않습니다: SEO 를 해칠 수 있고, 느린 성능을 유발하며, JavaScript 가 실패하거나 비활성화된 경우 사용자가 앱에 접근할 수 없습니다. ([생각보다 자주 일어납니다](https://kryogenix.org/code/browser/everyonehasjs.html)).

서버에서 작동하는 로직 (`+page.server.js`, `+layout.server.js`, `+server.js` 파일 등) 이 존재하지 않는 경우 [`adapter-static`](adapter-static) 을 사용하여 _폴백 페이지_ 를 추가하여 SPA 를 만들 수 있습니다. 

## Usage

`npm i -D @sveltejs/adapter-static` 으로 어댑터를 설치하고, 다음 옵션을 사용하여 `svelte.config.js` 에 어댑터를 추가합니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			fallback: '200.html' // may differ from host to host
		})
	}
};
```

`fallback` 페이지는 SvelteKit 이 페이지 템플릿 (예: `app.html`) 으로부터 생성할 HTML 페이지이며, 앱을 로드하고 올바른 경로로 이동합니다.
예를 들어 정적 웹 호스트인 [Surge](https://surge.sh/help/adding-a-200-page-for-client-side-routing) 에서는 정적 자산이나 사전 렌더링된 페이지에 해당하지 않는 요청을 처리하는 `200.html` 파일을 추가할 수 있습니다.

일부 플랫폼에서는 `index.html` 이거나 다른 이름일 수도 있습니다. 플랫폼의 문서를 참조하십시오.

## Apache

[Apache](https://httpd.apache.org/) 에서 SPA 를 실행하려면 `static/.htaccess` 파일을 추가하여 요청을 폴백 페이지로 라우팅해야 합니다.

```
<IfModule mod_rewrite.c>
	RewriteEngine On
	RewriteBase /
	RewriteRule ^200\.html$ - [L]
	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteCond %{REQUEST_FILENAME} !-d
	RewriteRule . /200.html [L]
</IfModule>
```

## Prerendering individual pages

특정 페이지가 미리 렌더링되도록 하려면, `ssr` 옵션을 다시 활성화 시키고 `prerender` 옵션을 활성화합니다.

```js
/// file: src/routes/my-prerendered-page/+page.js
export const prerender = true;
export const ssr = true;
```