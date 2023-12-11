---
title: 데이터 불러오기
---

[`+page.svelte`](routing#page-page-svelte) 컴포넌트(및 [`+layout.svelte`](routing#layout-layout-svelte) 컴포넌트)가 렌더링되기 전에, 종종 데이터를 가져올 필요가 있습니다. 이것은 `load` 함수를 정의함으로써 수행됩니다.

## 페이지 데이터

`+page.svelte` 파일은 `load` 함수를 내보내는 `+page.js`라는 이름의 형제파일(같은 디렉토리 내의 파일)을 가질 수 있습니다. `load` 함수는 페이지에서 `data` 프로퍼티를 통해 사용가능한 값을 반환합니다.

```js
/// file: src/routes/blog/[slug]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return {
		post: {
			title: `${params.slug}의 제목`,
			content: `${params.slug}의 내용`
		}
	};
}
```

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>
```

이미 정의된 `$types` 모듈 덕분에 완전한 타입 안정성을 확보할 수 있습니다.

`+page.js` 파일 내의 `load` 함수는 서버와 브라우저에서 모두 실행됩니다. (단, `export const ssr = false`를 사용하면 [브라우저에서만 실행](https://kit.svelte.dev/docs/page-options#ssr)됩니다.) `load` 함수를 _항상_ 서버에서 실행되게 하고 싶다면(예를 들어 데이터베이스 접근을 위한 비공개 환경 변수등을 사용하기 위해) `+page.server.js`를 대신 사용하세요.

블로그 게시글 페이지를 위한, 서버에서만 실행되어 데이터베이스에서 데이터를 가져오는 보다 현실적인 `load`함수는 다음과 같습니다:

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPost(slug: string): Promise<{ title: string, content: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
```

타입이 `PageLoad`에서 `PageServerLoad`로 바뀐 것에 주의하세요. 서버의 `load` 함수는 추가적인 인수를 사용할 수 있습니다. `+page.js`와 `+page.server.js`를 각각 언제 사용해야 할 지 이해하려면, [범용 vs 서버](load#universal-vs-server) 문단을 확인하세요.

## 레이아웃 데이터

`+layout.svelte` 파일 또한 `+layout.js` 또는 `+layout.server.js`를 통해 데이터를 불러올 수 있습니다.

```js
/// file: src/routes/blog/[slug]/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPostSummaries(): Promise<Array<{ title: string, slug: string }>>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries()
	};
}
```

```svelte
/// file: src/routes/blog/[slug]/+layout.svelte
<script>
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

<main>
	<!-- +page.svelte is rendered in this <slot> -->
	<slot />
</main>

<aside>
	<h2>추가 게시글</h2>
	<ul>
		{#each data.posts as post}
			<li>
				<a href="/blog/{post.slug}">
					{post.title}
				</a>
			</li>
		{/each}
	</ul>
</aside>
```

레이아웃의 `load` 함수에서 반환되는 데이터는 자식 `+layout.svelte` 컴포넌트나 `+page.svelte` 컴포넌트에서도 사용가능합니다.

```diff
/// file: src/routes/blog/[slug]/+page.svelte
<script>
+	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;

+	// `data.posts`는 부모 레이아웃의 `load`함수에서 반환되었습니다.
+	// 따라서 해당 페이지에서 접근가능합니다.
+	$: index = data.posts.findIndex(post => post.slug === $page.params.slug);
+	$: next = data.posts[index - 1];
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

+{#if next}
+	<p>Next post: <a href="/blog/{next.slug}">{next.title}</a></p>
+{/if}
```

> 만약 여러개의 `load` 함수가 같은 key값을 가지는 데이터를 반환하면, 마지막 값이 남습니다 — 레이아웃의 `load` 함수가 `{ a: 1, b: 2 }`를 반환하고, 페이지의 `load` 함수가 `{ b: 3, c: 4 }`를 반환하면 결과는 `{ a: 1, b: 3, c: 4 }`가 됩니다.

## $page.data

`+page.svelte` 컴포넌트와 그 위의 모든 `+layout.svelte` 컴포넌트들은 자신의 데이터와 모든 부모 컴포넌트의 데이터에 접근할 수 있습니다.

하지만 어떤 상황에서는 그 반대의 경우가 필요할 수 있습니다 — 부모 레이아웃이 페이지의 데이터나 자식 레이아웃의 데이터에 접근해야 할 필요가 있을 수 있습니다. 예를 들어, 루트 레이아웃이 `+page.js`나 `+page.server.js`의 `load` 함수에서 반환되는 `title` 프로퍼티에 접근해야 할 수 있습니다. 이 경우 `$page.data`를 이용합니다:

```svelte
/// file: src/routes/+layout.svelte
<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.title}</title>
</svelte:head>
```

`$page.data`의 타입 정보는 `App.PageData`에서 제공됩니다.

## 범용 vs 서버

위에서 보셨다시피, `load` 함수에는 두 종류가 있습니다.

* `+page.js`와 `+layout.js` 파일은 서버와 브라우저에서 모두 실행되는 _범용_ `load` 함수를 내보냅니다.
* `+page.server.js`와 `+layout.server.js` 파일은 서버에서만 실행되는 _서버_ `load` 함수를 내보냅니다.

개념적으로 둘은 같은 것이지만 알아야 할 몇가지 중요한 점이 있습니다.

### 어느 load 함수가 언제 실행되나요?

서버 `load` 함수는 _항상_ 서버에서 실행됩니다.

기본적으로, 범용 `load` 함수는 사용자가 페이지에 처음 방문할 때 SSR을 하는 동안 서버에서 실행됩니다. 수화(Hydration) 과정에서 [fetch 요청](#making-fetch-requests)의 응답을 재사용하여 다시 실행됩니다. 범용 `load` 함수의 모든 후속 실행은 브라우저에서 실행됩니다. [페이지 옵션](page-options)을 통해 동작을 사용자 지정할 수 있습니다. [서버 사이드 렌더링](page-options#ssr)을 비활성화하면, SPA가 생성되며 모든 범용 `load` 함수는 _항상_ 클라이언트에서 실행됩니다.

`load` 함수는 런타임에서 호출되지만, 페이지를 [prerender](page-options#prerender)하면 빌드타임에 호출됩니다.

### 입력

모든 범용 및 서버 `load` 함수는 요청을 설명하는 프로퍼티(`params`, `route` and `url`)와 다양한 함수(`fetch`, `setHeaders`, `parent` and `depends`)에 접근할 수 있습니다. 이것들은 다음 섹션에서 설명하겠습니다.

서버 `load` 함수는 `ServerLoadEvent`와 함께 호출되며, 이는 `RequestEvent`에서 `clientAddress`, `cookies`, `locals`, `platform` 그리고 `request`를 상속받습니다.

범용 `load` 함수는 `LoadEvent`와 함께 호출되며, 이는 `data` 프로퍼티를 가집니다. `+page.js` 와 `+page.server.js`(또는 `+layout.js`와 `layout.server.js`)가 모두 `load` 함수를 가진다면, 서버 `load` 함수에서 반환된 값은 범용 `load` 함수의 인수의 `data` 프로퍼티가 됩니다.

### 출력

범용 `load` 함수는 사용자 지정 클래스나 컴포넌트 구성자같은 아무 값이나 포함할 수 있는 객체를 반환합니다.

서버 `load` 함수는 [devalue](https://github.com/rich-harris/devalue)를 통해 직렬화되어 네트워크를 통해 전송될 수 있는 데이터 — JSON 또는 `BigInt`, `Date`, `맵`, `셋`, `정규식`, 순환 참조, 반복 참조로 표현될 수 있는 모든 것 — 를 반환해야 합니다. 또한 데이터에는 [promise](#streaming-with-promises)가 포함될 수 있으며, 이 경우 브라우저로 stream됩니다.

### 어느 것을 언제 사용해야 하나요?

서버 `load` 함수는 데이터베이스나 파일 시스템에 직접적으로 접근하거나, 비공개 환경 변수를 사용해야하는 상황에서 편리합니다.

범용 `load` 함수는 비공개 자격 증명이 필요 없는 외부 API로부터 데이터를 `fetch` 할 때 유용합니다. 이렇게 하면 SvelteKit이 서버를 통할 필요 없이 바로 데이터를 가져올 수 있습니다. 또한 Svelte 컴포넌트 생성자같은 직렬화될 수 없는 무언가를 반환할 때도 유용합니다.

In rare cases, you might need to use both together — for example, you might need to return an instance of a custom class that was initialised with data from your server.
가끔, 둘 모두를 사용해야 할 때도 있습니다 — 예를 들어, 서버로부터의 데이터로 초기화되는 사용자지정 클래스의 인스턴스를 반환해야 하는 경우가 있습니다.

## URL 데이터 사용

종종 `load` 함수는 어떤 식으로든 URL에 따라 달라지는 경우가 있습니다. 이런 위해 `load` 함수는 `url`, `route`, `params` 프로퍼티를 제공합니다.

### url

`origin`, `hostname`, `pathname`, `searchParams`([`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)형태로 파싱된 쿼리스트링을 포함함.)같은 프로퍼티들을 포함하는 [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)인스터느입니다. `url.hash`는 서버에서 사용 불가능하기 때문에 `load` 하는 동안 접근할 수 없습니다.

> 일부 환경에는 서버 사이드 렌더링을 하는 동안 요청 헤더에서 파생됩니다. 예를 들어 [adapter-node](adapter-node)를 사용하는 경우, URL이 정확해지려면 어댑터를 구성해야 할 수 있습니다.

### route

`src/routes`와 관련된 현재 라우트 디렉토리의 이름을 포함합니다:


```js
/// file: src/routes/a/[b]/[...c]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ route }) {
	console.log(route.id); // '/a/[b]/[...c]'
}
```

### params

`params`는 `url.pathname`과 `route.id`에서 파생됩니다.

`/a/[b]/[...c]`의 `route.id`와 `/a/x/y/z`의 `url.pathname`을 고렿면, `params`객체는 다음과 같을 것입니다:

```json
{
	"b": "x",
	"c": "y/z"
}
```

## fetch 요청 생성

외부 API나 `+server.js` 핸들러에서 데이터를 가져오려면 제공된 `fetch` 함수를 사용할 수 있습니다. 이는 [네이티브 `fetch` 웹 API](https://developer.mozilla.org/en-US/docs/Web/API/fetch)와 동일하게 기능하지만, 몇가지 추가 기능이 있습니다:


- 페이지 요청에 대한 `cookie`와 `authorization`을 상속하므로 서버에서 자격 증명 요청을 수행하는 데 사용될 수 있습니다.
- 서버에서 상대 경로를 통한 요청을 할 수 있습니다(일반적으로 `fetch`는 서버 컨텍스트에서 사용될 때 출처(origin)를 포함한 URL이 필요합니다).
- 내부 요청(예를 들어 `+server.js` 라우트)는 HTTPS 요청으로 인한 오버헤드 없이 핸들러 함수로 바로 요청됩니다.
- 서버 사이드 렌더링 중에, `Response` 객체의 `text`와 `json` 메소드로 후킹하여 응답을 캡쳐하고 렌더링된 HTML로 인라인됩니다. filterSerializedResponseHeaders를 명시적으로 포함하지 않으면 헤더는 직렬화되지 않음을 주의하세요.
- 수화(Hydration) 중에, 응답은 HTML에서 읽혀 일관성을 보장하고 추가적인 네트워크 요청을 방지합니다 - `load` `fetch` 대신 브라우저 `fetch`를 사용했을 때 브라우저 콘솔에서 경고를 받았다면, 그 이유입니다.

```js
/// file: src/routes/items/[id]/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	const res = await fetch(`/api/items/${params.id}`);
	const item = await res.json();

	return { item };
}
```

## 쿠키

서버 `load` 함수는 [`쿠키`](types#public-types-cookies)에 접근하거나 설정할 수 있습니다.

```js
/// file: src/routes/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getUser(sessionid: string | undefined): Promise<{ name: string, avatar: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');

	return {
		user: await db.getUser(sessionid)
	};
}
```

쿠키는 제공된 `fetch` 함수를 통해서만 전달됩니다. 이때 `fetch`의 접근 호스트가 SvelteKit 어플리케이션 또는 이의 서브도메인과 같아야합니다.

예를 듯어, SvelteKi이 my.domain.com에 서비스를 제공하는 경우:
- domain.com 는 쿠키를 **받지 않습니다**.
- my.domain.com 는 쿠키를 **받습니다**.
- api.domain.dom 는 쿠키를 **받지 않습니다**.
- sub.my.domain.com 는 쿠키를 **받습니다**.

다른 쿠키들은 `credentials: 'include'`가 설정되면 전달되지 않습니다. Sveltekit이 어느 쿠키가 어느 도메인에 속하는지 알 수 없어서, 그 중 하나라도 전송하는 것은 안전하지 않기 때문입니다. 그것에 관하여 작업하려면 [handleFetch hook](hooks#server-hooks-handlefetch)를 확인하세요.

> 쿠키를 설정할 때, `path` 프로퍼티에 유의하세요. 기본적으로 쿠키의 `path`는 현재 경로로 설정됩니다. 예를들어 `admin/user` 페이지에서 쿠키를 설정하면, 기본적으로 `admin` 페이지 내에서면 쿠키를 사용할 수 있습니다. 대부분의 경우 앱 전체에서 쿠키를 사용할 것이기 때문에 `path`를 `'/'`로 설정하는 것이 좋습니다.

## 헤더

서버와 범용 `load` 함수는 둘 다 `setHeader` 함수에 접근할 수 있습니다. 서버에서 실행될 때 응답헤더를 설정할 수 있습니다. (브라우저에서 실행되면 아무 효과가 없습니다.) 이것은 페이지를 캐시할 경우 유용합니다. 예를 들어:

```js
// @errors: 2322 1360
/// file: src/routes/products/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/products.json`;
	const response = await fetch(url);

	// cache the page for the same length of time
	// as the underlying data
	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

같은 헤더를 여러번 설정하는 것은(다른 `load` 함수에서의 경우도 포함) 에러를 발생시킵니다  — 지정된 헤더는 한 번만 설정할 수 있습니다. 또한 `cookies.set(name, value, options)` 대신에 `setHeaders`를 사용하여 `set-cookie` 헤더를 추가할 수 없습니다.

## 부모 데이터 사용

Occasionally it's useful for a `load` function to access data from a parent `load` function, which can be done with `await parent()`:
가끕 `load` 함수는 부모의 `load` 함수의 데이터에 접근할 때도 유용합니다. 이때 `await parent()`를 사용합니다.

```js
/// file: src/routes/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return { a: 1 };
}
```

```js
/// file: src/routes/abc/+layout.js
/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
	const { a } = await parent();
	return { b: a + 1 };
}
```

```js
/// file: src/routes/abc/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const { a, b } = await parent();
	return { c: a + b };
}
```

```svelte
<!--- file: src/routes/abc/+page.svelte --->
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<!-- renders `1 + 2 = 3` -->
<p>{data.a} + {data.b} = {data.c}</p>
```

> `+page.js`의 `load` 함수는 부모 레이아웃 뿐 아니라 조상 레이아웃의 `load` 함수의 데이터와도 병합된다는 것에 주의하세요.

`+page.server.js`와 `+layout.server.js` 내부에서 `parent`는 부모 `+layout.server.js` 파일의 데이터를 반환합니다.

`+page.js` 또는 `+layout.js`는 부모 `+layout.js`로 부터의 데이터를 반환합니다. 만약 `+layout.js` 파일이 없는 경우 이는 `({ data }) => data` 함수와 동일하게 취급되어 `+layout.js`파일을 거치지 않은 부모 `+layout.server.js` 파일의 데이터를 반환합니다.

`await parent()`를 사용할 때 waterfall 현상이 생기지 않도록 하세요. 예를 들어, 여기서 `getData(params)`는 `parent()`의 호출 결과와 상관이 없으므로, 렌더링 지연을 피하기 위해 먼저 호출합니다.

```diff
/// file: +page.js
/** @type {import('./$types').PageLoad} */
export async function load({ params, parent }) {
-	const parentData = await parent();
	const data = await getData(params);
+	const parentData = await parent();

	return {
		...data
		meta: { ...parentData.meta, ...data.meta }
	};
}
```

## 에러

`load` 함수 실행 도중 에러가 발생하면, 가장 가까운 [`+error.svelte`](routing#error)가 렌더링 됩니다. _예상된_ 에러에 대해, `@sveltejs/kit`의 `error` 도우미를 사용하여 HTTP 상태 코드와 선택적 메시지를 지정하세요:

```js
/// file: src/routes/admin/+layout.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user?: {
			name: string;
			isAdmin: boolean;
		}
	}
}

// @filename: index.js
// ---cut---
import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		throw error(401, 'not logged in');
	}

	if (!locals.user.isAdmin) {
		throw error(403, 'not an admin');
	}
}
```

만약 _예상치못한_ 에러가 발생하면, SvelteKit은 [`handleError`](hooks#shared-hooks-handleerror)를 발생시키고 500 내부 서버 오류로 처리합니다.

## 리다이렉트

사용자를 리다이렉트 시키기 위해서, `@sveltejs/kit`의 `redirect` 도우미를 사용하여 사용자가 `3xx` 상태 코드에 따라 리다이렉트 될 위치를 지정하세요.

```js
/// file: src/routes/user/+layout.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user?: {
			name: string;
		}
	}
}

// @filename: index.js
// ---cut---
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		throw redirect(307, '/login');
	}
}
```

> try-catch 블록에서 `throw redirect()`를 사용하지 마세요. 이 경우, redirect가 즉시 예외를 발생시킵니다.

`load` 함수 밖에서도 [`$app.navigation`](modules#$app-navigation)의 [`goto`](modules#$app-navigation-goto)를 사용하여 브라우저에서 네비게이팅 하도록 할 수 있습니다.

## promise로 stream 하기

반환된 객체의 _최상위 레벨의_ promise는 대기되어, waterfall 현상을 생성하지 않고도 여러 개의 promise를 쉽게 반환할 수 있습니다. 서버 `load` 함수를 사용할 때, _중첩된_ promise들은 완료되면 브라우저로 stream됩니다. 모든 데이터가 사용가능하지 않아도 페이지를 렌더링 할 수 있기 때문에, 느리거나 비필수 데이터들을 다룰 때 유용합니다.

```js
/// file: src/routes/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export function load() {
	return {
		one: Promise.resolve(1),
		two: Promise.resolve(2),
		streamed: {
			three: new Promise((fulfil) => {
				setTimeout(() => {
					fulfil(3)
				}, 1000);
			})
		}
	};
}
```

로딩 상태 뼈대를 만들 때 유용합니다. 예를 들어:

```svelte
<!--- file: src/routes/+page.svelte --->
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<p>
	one: {data.one}
</p>
<p>
	two: {data.two}
</p>
<p>
	three:
	{#await data.streamed.three}
		Loading...
	{:then value}
		{value}
	{:catch error}
		{error.message}
	{/await}
</p>
```

> AWS Lambda와 같이 streaming을 지원하지 않는 플랫폼에서는 응답이 지연됩니다. 즉, 모든 promise가 해결된 후 페이지가 렌더링됩니다. NGINX 같은 프록시를 사용하는 경우, 프록시가 서버의 응답들을 버퍼링하지 않는 지 확인하세요. 


> 데이터를 stream하는 것은 자바스크립트가 활성화되어 있을 때에만 작동합니다. 페이지가 서버에서 렌더링될 때 범용 `load` 함수에서 중첩된 promise들을 반환하지 않도록 해야합니다. 왜냐하면 이 promise들은  stream되지 _않고,_ 대신 함수가 브라우저에서 재실행될 때 재구성됩니다.

> 응답 헤더나 상태 코드는 응답이 한번 stream되기 시작하면 바꿀 수 없습니다. 그러므로 stream되는 promise 내부에서 `setHeaders`를 사용하거나 redirect를 발생시키지 마세요.

## 병렬 로딩

페이지를 렌더링(또는 네비게이팅)할 때, SvelteKit은 모든 `load` 함수를 동시에 실행하여, 요청의 waterfall 현상을 방지합니다. 클라이언트 사이드 네이게이션에서 다수의 서버 `load` 함수의 결과는 하나의 응답으로 그룹화 됩니다. 모든 `load` 함수가 반환을 하면 페이지가 재렌더링됩니다.

## load 함수 재실행

SvelteKit은 각 `load`함수의 종속성을 추적하여 네비게이션 중에 불필요한 함수 재실행을 방지합니다.

예를 들어, 아래의 두 개의 `load` 함수가 주어지면...

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPost(slug: string): Promise<{ title: string, content: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
```

```js
/// file: src/routes/blog/[slug]/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPostSummaries(): Promise<Array<{ title: string, slug: string }>>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries()
	};
}
```

...`params.slug`가 바뀜에 따라 `+page.server.js`의 `load` 함수는 `/blog/trying-the-raw-meat-diet`에서 `/blog/i-regret-my-choices`로 네비기이팅 할 때 재실행됩니다. 하지만 `+layout.server.js`의 데이터는 여전히 유효하기 때문에, 여기서 `load` 함수는 재실행되지 않습니다. 다시 말해 `db.getPostSummaries()`는 두 번 호출되지 않습니다.

`load` 함수가 재실행될 때 `await parent()`를 호출하는 `load` 함수 또한 재실행됩니다.

종속성 추적은 `load` 함수가 반환된 _이후에는_ 적용되지 않습니다 — 예를 들어, `params.x`를 중첩된 promise 내에서 접근할 때 `params.x`가 바뀌어도 함수를 재실행하지 않습니다. (걱정하지 마세요, 실수로 이렇게 해도 개발할 때 경고가 뜰 것입니다.) 대신, `load` 함수 본문에서 파라미터에 접근할 수 있습니다.

### 수동 무효화

현재 페이지에 적용되는 `load` 함수를 [`invalidate(url)`](modules#$app-navigation-invalidate)과 [`invalidateAll()`](modules#$app-navigation-invalidateall)를 이용하여 재실행할 수 있습니다. `invalidate(url)`은 `url`에 종속된 모든 `load` 함수를 재실행하고, `invalidateAll()`은 모든 `load` 함수를 재실행합니다. 서버 `load` 함수는 기밀 내용이 클라이언트로 누출되는 것을 막기 위해 자동적으로 fetch된 `url`에 종속되지 않습니다.

`load` 함수는 `fetch(url)` 또는 `depends(url)`을 호출하는 경우 `url`에 종속됩니다. `url`은 `[a-z]`로 시작하는 사용자 지정 식별자가 될 수 있슴을 유의하세요:

```js
/// file: src/routes/random-number/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, depends }) {
	// `invalidate('https://api.example.com/random-number')`가 호출되거나...
	const response = await fetch('https://api.example.com/random-number');

	///...또는 `invalidate('app:random')`가 호출될 때 함수가 재실행됩니다.
	depends('app:random');

	return {
		number: await response.json()
	};
}
```

```svelte
<!--- file: src/routes/random-number/+page.svelte --->
<script>
	import { invalidate, invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	function rerunLoadFunction() {
		// 아래의 모든 함수가 load 함수를 재실행할 수 있습니다.
		invalidate('app:random');
		invalidate('https://api.example.com/random-number');
		invalidate(url => url.href.includes('random-number'));
		invalidateAll();
	}
</script>

<p>random number: {data.number}</p>
<button on:click={rerunLoadFunction}>Update random number</button>
```

### 언제 load 함수가 재실행되나요?

요약하자면, `load` 함수는 아래의 상황에서 재실행됩니다.

- 값이 바뀐 `params`의 속성을 참조하여 재실행됩니다.
- 값이 바뀐 `url`의 프로퍼티(`url.pathname`, `url.search` 등)를 참조하여 재실행됩니다.. `request.url`의 프로퍼티는 추적되지 _않습니다._
- `await parent()`를 호출하고 부모 `load` 함수가 재실행되면 재실행됩니다.
- [`fetch`](#making-fetch-requests) (범용 `load` 함수 전용) 또는 [`depends`](types#public-types-loadevent)를 사용하여 특정 URL에 대한 종속성을 선언하고, [`invalidate(url)`](modules#$app-navigation-invalidate)를 통해 해당 URL에 무효화되면 재실행됩니다.
- 모든 활성화된 `load` 함수는 [`invalidateAll()`](modules#$app-navigation-invalidateall)를 통해 강제로 재실행됩니다.

`a` 태그의 링크를 클릭하여 `url` 또는 `params`이 바뀔 때, [`<form>` 상호작용](form-actions#get-vs-post)이 발생할 때, [`goto`](modules#$app-navigation-goto)가 발생할 때, [`redirect`](modules#sveltejs-kit-redirect)가 발생할 때 재실행됩니다.

`load` 함수가 재실행되면 해당하는 `+layout.svelte` 또는 `+page.svelte`의 `data` 프로퍼티가 업데이트 됨에 주의하세요; 이것은 컴포넌트가 재생성되도록 하지 _않습니다._ 내부 상태는 보존됩니다. 만약 초기화해야하는 것이 있다면 [`afterNavigate`](modules#$app-navigation-afternavigate)의 콜백함수를 이용하거나 컴포넌트를 [`{#key ...}`]블록에 감싸세요.