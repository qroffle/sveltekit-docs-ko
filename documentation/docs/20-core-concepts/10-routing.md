---
title: 라우팅
---

SvelteKit 은 _파일시스템 기반 라우터_ 를 가지고 있습니다. 사용자가 접근할 수 있는 URL 경로를 정의하는 앱의 라우트는 코드베이스의 디렉토리에 의해 정의됩니다.

- `src/routes` 디렉토리는 앱의 라우트를 정의합니다.
- `src/routes/about` 디렉토리는 `/about` 경로에 대한 라우트를 정의합니다.
- `src/routes/blog/[slug]` 디렉토리는 `/blog/hello-world` 와 같은 경로를 요청할 때 동적으로 데이터를 로드할 수 있는 _파라미터_ `slug` 를 가진 라우트를 생성합니다.

> `src/routes` 를 다른 디렉토리로 변경하려면 [프로젝트 설정](configuration) 을 편집하세요.

각 라우트 디렉토리는 하나 이상의 _라우트 파일_ 을 가지고 있습니다. 라우트 파일은 `+` 접두사로 식별할 수 있습니다.

## +page

### +page.svelte

`+page.svelte` 컴포넌트는 앱의 페이지를 정의합니다. 기본적으로 페이지는 초기 요청에 대한 서버([SSR](glossary#ssr))에서 렌더링되며, 이후의 네비게이션에 대한 브라우저([CSR](glossary#csr))에서 렌더링됩니다.

```svelte
/// file: src/routes/+page.svelte
<h1>스벨트의 협곡에 오신 것을 환영합니다!</h1>
<a href="/about">정보 알아보기</a>
```

```svelte
/// file: src/routes/about/+page.svelte
<h1>스벨트의 협곡 정보</h1>
<p>TODO...</p>
<a href="/">홈</a>
```

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<h1>{data.title}</h1>
<div>{@html data.content}</div>
```

> SvelteKit 은 `<a>` 태그를 사용하여 라우트 간의 이동을 처리합니다. 프레임워크 종속적인 `<Link>` 컴포넌트 등을 사용하지 않습니다.

### +page.js

페이지가 렌더링 되기 전에 데이터를 로드해야 할 수도 있습니다. 이를 위해 `+page.js` 모듈을 추가하여 `load` 함수를 내보냅니다.

```js
/// file: src/routes/blog/[slug]/+page.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	if (params.slug === 'hello-world') {
		return {
			title: 'League of Svelte',
			content: '스벨트의 협곡에 오신 것을 환영합니다. 천지는 쓸쓸한 그림자는 어디 보라...'
		};
	}

	throw error(404, 'Not found');
}
```

이 함수는 `+page.svelte` 와 함께 실행되며, 이는 서버 사이드 렌더링 중 서버에서 실행되고 클라이언트 사이드 네비게이션 중 브라우저에서 실행됨을 의미합니다. API 의 전체적인 내용은 [`load`](load) 를 참고하세요.

`load` 와 함께 `+page.js` 는 페이지의 동작을 구성하는 아래의 값들을 내보낼 수 있습니다:

- `export const prerender = true` 또는 `false` 또는 `'auto'`
- `export const ssr = true` 또는 `false`
- `export const csr = true` 또는 `false`

더 많은 정보는 [페이지 옵션](page-options) 을 참고하세요.

### +page.server.js

`load` 함수가 서버에서만 작동하도록 제한하려면
— 예를 들어 데이터베이스에서 데이터를 가져와야 하거나 API 키와 같은 [환경 변수](modules#$env-static-private) 에 접근해야 하는 경우 —
`+page.js` 를 `+page.server.js` 로 이름을 변경하고 `PageLoad` 타입을 `PageServerLoad` 로 변경할 수 있습니다.

```js
/// file: src/routes/blog/[slug]/+page.server.js

// @filename: ambient.d.ts
declare global {
	const getPostFromDatabase: (slug: string) => {
		title: string;
		content: string;
	}
}

export {};

// @filename: index.js
// ---cut---
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const post = await getPostFromDatabase(params.slug);

	if (post) {
		return post;
	}

	throw error(404, 'Not found');
}
```

클라이언트 사이드 네비게이션 중에 SvelteKit 은 서버에서 이 데이터를 로드합니다. 이는 반환된 값이 [devalue](https://github.com/rich-harris/devalue) 를 사용하여 직렬화할 수 있어야 함을 의미합니다. API 의 전체적인 내용은 [`load`](load) 를 참고하세요.

`+page.js` 와 마찬가지로 `+page.server.js` 는 [페이지 옵션](page-options) — `prerender`, `ssr` 그리고 `csr` — 를 내보낼 수 있습니다.

`+page.server.js` 파일은 또한 _액션_ 을 내보낼 수 있습니다. `load` 는 서버에서 데이터를 읽을 수 있게 해주고, `actions` 는 `<form>` 요소를 사용하여 데이터를 서버에 쓸 수 있게 해줍니다. 사용법에 대해서는 [폼 액션](form-actions) 섹션을 참고하세요.

## +error

`load` 함수가 에러를 던지면 SvelteKit 은 기본 에러 페이지를 렌더링합니다. 이 기본 에러 페이지를 커스터마이징하려면 라우트별로 `+error.svelte` 파일을 추가하세요:

```svelte
/// file: src/routes/blog/[slug]/+error.svelte
<script>
	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>
```

SvelteKit 은 제일 가까운 에러 파일을 찾기 위해 트리를 탐색합니다
— 위의 파일이 존재하지 않는다면 `src/routes/blog/+error.svelte` 그리고 `src/routes/+error.svelte` 를 찾은 후 기본 에러 페이지를 렌더링합니다.
만약 그것도 실패한다면 (또는 에러가 루트 `+layout` 의 `load` 함수에서 발생했다면, 이는 루트 `+error` 의 `load` 함수에서 발생한 것이 아님을 의미합니다)
SvelteKit 은 정적인 기본 에러 페이지를 렌더링합니다. 이 기본 에러 페이지는 `src/error.html` 파일을 생성하여 커스터마이징할 수 있습니다.

`+layout(.server).js` 파일의 `load` 함수에서 에러가 발생하면, 트리에서 가장 가까운 에러 경계는 그 레이아웃의 _위쪽_ 에 있는 `+error.svelte` 파일입니다 (그 옆에 있는 것이 아닙니다).

라우트가 발견되지 않을 경우 (404) `src/routes/+error.svelte` (또는 그 파일이 존재하지 않는다면 기본 에러 페이지) 가 사용됩니다.

> `+error.svelte` 는 [`handle`](hooks#server-hooks-handle) 또는 [+server.js](#server) 요청 핸들러 내에서 에러가 발생할 때 _사용되지 않습니다._

[에러](errors) 섹션에서 에러 처리에 대해 더 읽어보세요.

## +layout

기본적으로 각 페이지들은 완전히 독립적인 컴포넌트로 취급됩니다 — 네비게이션을 통해 이동할 때마다 기존의 `+page.svelte` 컴포넌트는 제거되고 새로운 컴포넌트가 그 자리를 차지합니다.

그러나 대다수의 앱에는 _모든_ 페이지에서 보여져야 하는 상단 네비게이션 또는 푸터와 같은 요소들이 있습니다. `+page.svelte` 에서 반복적으로 이러한 요소들을 사용하는 대신, 우리는 _레이아웃_ 에 넣을 수 있습니다.

### +layout.svelte

모든 페이지에 적용되는 레이아웃을 만드려면 `src/routes/+layout.svelte` 파일을 생성하세요. 기본 레이아웃 (SvelteKit 이 사용하는 레이아웃으로 직접 작성하지 마세요) 은 다음과 같습니다.

```html
<slot></slot>
```

`<slot>` 은 페이지 컨텐츠가 렌더링되는 곳입니다. 레이아웃에는 `<slot>` 을 포함한 어떠한 마크업, 스타일, 작동을 작성해도 무방합니다.
예를 들어, `src/routes/index.svelte` 는 다음과 같이 레이아웃을 사용할 수 있습니다.

```html
/// file: src/routes/+layout.svelte
<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/settings">Settings</a>
</nav>

<slot></slot>
```

`/`, `/about`, `/settings` 페이지를 생성하면,

```html
/// file: src/routes/+page.svelte
<h1>Home</h1>
```

```html
/// file: src/routes/about/+page.svelte
<h1>About</h1>
```

```html
/// file: src/routes/settings/+page.svelte
<h1>Settings</h1>
```

`+layout.svelte` 에서 정의한 `<nav>`가 항상 보여지며, 각 링크를 클릭할 경우 `<h1>` 만 교체됩니다. 

레이아웃들은 _중첩_될 수 있습니다.
`/settings` 페이지 하나만 있는 것이 아니라 `/settings/profile` 과 `/settings/notifications` 과 같은 공유된 서브메뉴를 가진 중첩된 페이지들이 있다고 가정해봅시다. (실제 예시는 [github.com/settings](https://github.com/settings))

루트 레이아웃을 유지하면서 `/settings` 하위의 페이지에만 추가로 적용되는 레이아웃을 작성할 수 있습니다.

```svelte
/// file: src/routes/settings/+layout.svelte
<script>
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

<h1>Settings</h1>

<div class="submenu">
	{#each data.sections as section}
		<a href="/settings/{section.slug}">{section.title}</a>
	{/each}
</div>

<slot></slot>
```

기본적으로 각 레이아웃은 그 위에 있는 레이아웃을 상속합니다. 때때로 그것이 원하는 것이 아닐 수 있습니다 — 이 경우 [고급 레이아웃](advanced-routing#advanced-layouts) 을 사용할 수 있습니다.

### +layout.js

`+page.svelte` 가 `+page.js` 에서 데이터를 가져오는 것 처럼, `+layout.svelte` 컴포넌트는 `+layout.js` 에서 [`load`](load) 함수를 통해 데이터를 가져올 수 있습니다.

```js
/// file: src/routes/settings/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		sections: [
			{ slug: 'profile', title: '프로필' },
			{ slug: 'notifications', title: '알림' }
		]
	};
}
```

`+layout.js` 가  [페이지 옵션](page-options) — `prerender`, `ssr`, `csr` —을 내보낼 경우, 그것들은 자식 페이지들의 기본값으로 사용됩니다.

레이아웃의 `load` 함수가 반환하는 데이터는 모든 자식 페이지에서도 사용할 수 있습니다.

```svelte
/// file: src/routes/settings/profile/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;

	console.log(data.sections); // [{ slug: 'profile', title: '프로필' }, ...]
</script>
```

> 페이지 간의 이동 시 레이아웃 데이터가 변경되지 않는 경우가 있습니다. SvelteKit 은 필요할 때 [`load`](load) 함수를 지능적으로 다시 실행합니다. 

### +layout.server.js

레이아웃의 `load` 함수를 서버에서 실행하려면, 그것을 `+layout.server.js` 로 옮기고 `LayoutLoad` 타입을 `LayoutServerLoad` 로 변경하세요.

`+layout.js` 와 마찬가지로 `+layout.server.js` 는 [페이지 옵션](page-options) — `prerender`, `ssr`, `csr` —을 내보낼 수 있습니다.

## +server

페이지가 하는 것 처럼, `+server.js` 파일 (API 라우트, 엔드포인트 등으로 불리는) 을 통해 라우트를 정의할 수 있습니다.
해당 파일은 `RequestEvent` 인자를 받고 [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) 객체를 반환하는 `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS` 와 같은 HTTP 요청에 대응하는 함수를 내보냅니다.

예를 들어, `GET` 메서드가 정의된 `/apl/random-number` 라우트를 생성할 수 있습니다. 

```js
/// file: src/routes/api/random-number/+server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		throw error(400, 'min 과 max 는 숫자여야 하며, max 는 min 보다 크거나 같아야 합니다.');
	}

	const random = min + Math.random() * d;

	return new Response(String(random));
}
```

반환할 `Response` 의 첫번째 파라미터에는 [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) 이 올 수 있습니다.
이는 많은 양의 데이터를 스트리밍하거나 서버-보내는-이벤트를 생성할 수 있게 해줍니다. (AWS Lambda 와 같이 응답을 버퍼링하는 플랫폼에 배포하지 않는 한)

편의를 위해 `@sveltejs/kit` 에 정의된 [`error`](modules#sveltejs-kit-error), [`redirect`](modules#sveltejs-kit-redirect), [`json`](modules#sveltejs-kit-json) 메서드를 사용할 수 있습니다. (사용하지 않아도 무방합니다.)

`Accept` 헤더에 따라 에러가 던져질 경우 JSON 표현이 반환되거나, `src/error.html` 을 통해 커스터마이징된 에러 페이지가 반환됩니다. [`+error.svelte`](#error) 컴포넌트는 이 경우 렌더링되지 않습니다. 에러 핸들링에 대한 자세한 정보는. [에러](errors) 섹션을 참고하세요.

> `OPTIONS` 요청의 핸들러를 생성할 경우, Vite 는 자동으로 `Access-Control-Allow-Origin` 과 `Access-Control-Allow-Methods` 헤더를 주입합니다 — 이는 프로덕션 환경에서는 작동하지 않습니다. 추가하려면 `+server.js` 등 에서 직접 정의해야 합니다.

### Receiving data

`POST`/`PUT`/`PATCH`/`DELETE`/`OPTIONS` 핸들러를 사용해 `+server.js` 파일을 완전한 API 로 만들 수 있습니다.

```svelte
/// file: src/routes/add/+page.svelte
<script>
	let a = 0;
	let b = 0;
	let total = 0;

	async function add() {
		const response = await fetch('/api/add', {
			method: 'POST',
			body: JSON.stringify({ a, b }),
			headers: {
				'content-type': 'application/json'
			}
		});

		total = await response.json();
	}
</script>

<input type="number" bind:value={a}> +
<input type="number" bind:value={b}> =
{total}

<button on:click={add}>Calculate</button>
```

```js
/// file: src/routes/api/add/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { a, b } = await request.json();
	return json(a + b);
}
```

> 일반적으로, 데이터를 제출하는 용도로는 [폼 액션](form-actions) 를 사용하는 것이 더 좋은 방법입니다.

### Content negotiation
`+server.js` 파일은 `+page` 파일들과 동일한 디렉토리에 위치할 수 있습니다. 이는 동일한 라우트가 페이지 또는 API 엔드포인트가 될 수 있음을 의미합니다.
SvelteKit 은 다음 규칙을 적용하여 어떤 파일에서 요청을 처리할지 결정합니다.

- `PUT`/`PATCH`/`DELETE`/`OPTIONS` 요청은 페이지가 처리할 수 없으므로 항상 `+server.js` 가 담당합니다.
- `GET`/`POST` 요청은 `accept` 헤더가 `text/html` 을 가질 경우 (브라우저 요청일 경우) 페이지 요청으로 취급합니다. 이외의 경우에는 `+server.js` 가 처리합니다.

## $types

위의 예제들에서, 우리는 `$types.d.ts` 파일에서 타입을 가져왔습니다.
이는 SvelteKit 이 루트 파일들을 작성할 때 (TypeScript 를 사용하거나 JSDoc 타입 주석을 사용하는 경우) 타입 안전성을 제공하기 위해 숨겨진 디렉토리에 생성하는 파일입니다.

예를 들어, `export let data` 의 타입을 `PageData` (또는 `LayoutData`, `+layout.svelte` 파일의 경우) 로 주석을 작성하면 TypeScript 에게 `data` 의 타입이 `load` 에서 반환된 것과 동일하다는 것을 알려줍니다.

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>
```

`load` 함수에 대해 차례대로 `PageLoad`, `PageServerLoad`, `LayoutLoad` 또는 `LayoutServerLoad` (각각 `+page.js`, `+page.server.js`, `+layout.js` 및 `+layout.server.js` 에 대해) 를 주석으로 달면 `params` 와 반환값이 올바르게 타입화됩니다.

만약 VS Code 나 LSP, TypeScript 플러그인을 지원하는 IDE 를 사용한다면 이러한 타입들을 완전히 생략할 수 있습니다!
Svelte 의 IDE 도구는 올바른 타입을 자동으로 삽입하므로 직접 작성하지 않아도 타입 체크를 받을 수 있습니다. `svelte-check` 와 함께 사용할 수도 있습니다.

타입 생략과 관련된 더 자세한 내용은 [블로그 포스트 (영문)](https://svelte.dev/blog/zero-config-type-safety) 를 참고하세요.

## Other files

라우트 디렉토리 안의 다른 파일들은 SvelteKit 에서 무시됩니다. 이는 컴포넌트와 유틸리티 모듈을 라우트와 함께 둘 수 있음을 의미합니다.

컴포넌트나 모듈을 여러 라우트에서 사용해야 하는 경우, [`$lib`](modules#$lib) 에 두는 것이 좋습니다.

## Further reading

- [튜토리얼: 라우팅 (영문)](https://learn.svelte.dev/tutorial/pages)
- [튜토리얼: API 라우트 (영문)](https://learn.svelte.dev/tutorial/get-handlers)
- [문서: 고급 라우팅](advanced-routing)
