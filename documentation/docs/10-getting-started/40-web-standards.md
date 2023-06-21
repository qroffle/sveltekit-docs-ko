---
title: 웹 표준
---

SvelteKit 은 [Web APIs](https://developer.mozilla.org/ko/docs/Web/API) 를 기반으로 구축됩니다. 바퀴를 재발명하는 대신, 우리는 _플랫폼을 사용합니다_.
이는 기존의 웹 개발 기술이 SvelteKit 에 적용될 수 있음을 의미합니다. 반대로, SvelteKit 을 배우는 시간은 다른 곳에서 더 나은 웹 개발자가 되는 데 도움이 될 것입니다.

이러한 API 는 모든 최신 브라우저와 Cloudflare Workers, Deno, Vercel Edge Functions 과 같은 많은 비 브라우저 환경에서 사용할 수 있습니다.
개발 중에는 [adapters](adapters) 에서 필요한 경우 폴리필을 통해 사용할 수 있습니다. (현재는 Node 는 더 많은 웹 표준을 지원하고 있습니다.)

특히 다음과 같은 것들에 익숙해질 것입니다.

## Fetch APIs

SvelteKit 은 네트워크에서 데이터를 가져오기 위해 [`fetch`](https://developer.mozilla.org/ko/docs/Web/API/fetch) 를 사용합니다.
이는 [hooks](hooks) 와 [server routes](routing#server) 뿐만 아니라 브라우저에서도 사용할 수 있습니다.

> **참고:** [`load`](load) 함수, [server hooks](hooks#server-hooks) 와 [API routes](routing#server) 에서는 HTTP 호출 없이 서버 측 렌더링 중에 엔드포인트를 직접 호출하기 위해 `fetch` 의 특별한 버전이 사용될 수 있습니다.
> (서버 측 `fetch` 를 사용하여 자격 증명을 유지하면서 서버 측 코드 외부에서 자격 증명을 유지하려면 `cookie` 와/또는 `authorization` 헤더를 명시적으로 전달해야 합니다.)
> 또한 상대적인 요청을 만들 수 있도록 합니다. 서버 측 `fetch` 는 일반적으로 완전히 정규화된 URL 을 필요로 합니다.

[Fetch API](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API) 에는 `fetch` 자체 외에도 다음과 같은 인터페이스가 포함되어 있습니다.

### Request

[`Request`](https://developer.mozilla.org/ko/docs/Web/API/Request) 의 인스턴스는 [hooks](hooks) 와 [server routes](routing#server) 에서 `event.request` 로 접근할 수 있습니다.
`request.json()` 과 `request.formData()` 와 같은 유용한 메서드를 사용하여 엔드포인트에 게시된 데이터를 가져올 수 있습니다.

### Response

[`Response`](https://developer.mozilla.org/ko/docs/Web/API/Response) 의 인스턴스는 `await fetch(...)` 와 `+server.js` 파일의 핸들러에서 반환됩니다.
기본적으로 SvelteKit 앱은 `Request` 를 `Response` 로 변환하는 데 사용되는 기계입니다.

### Headers

[`Headers`](https://developer.mozilla.org/ko/docs/Web/API/Headers) 인터페이스를 사용하면 들어오는 `request.headers` 를 읽고 나가는 `response.headers` 를 설정할 수 있습니다.

```js
// @errors: 2461
/// file: src/routes/what-is-my-user-agent/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET(event) {
	// 모든 헤더를 출력합니다.
	console.log(...event.request.headers);

	return json({
		// 특정 헤더의 값을 가져옵니다.
		userAgent: event.request.headers.get('user-agent')
	});
}
```

## FormData

HTML 네이티브 폼 제출을 다룰 때는 [`FormData`](https://developer.mozilla.org/ko/docs/Web/API/FormData) 객체를 사용합니다.

```js
// @errors: 2461
/// file: src/routes/hello/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const body = await event.request.formData();

	// 모든 필드를 출력합니다.
	console.log([...body]);

	return json({
		// 특정 필드의 값을 가져옵니다.
		name: body.get('name') ?? 'world'
	});
}
```

## Stream APIs

대부분의 경우, 엔드포인트는 `userAgent` 예제와 같이 완전한 데이터를 반환합니다. 그러나, 때때로 한 번에 메모리에 맞지 않거나 청크로 전달되는 응답을 반환해야 할 수도 있습니다.
이를 위해 플랫폼은 [Streams API](https://developer.mozilla.org/ko/docs/Web/API/Streams_API) — [ReadableStream](https://developer.mozilla.org/ko/docs/Web/API/ReadableStream), [WritableStream](https://developer.mozilla.org/ko/docs/Web/API/WritableStream) 과 [TransformStream](https://developer.mozilla.org/ko/docs/Web/API/TransformStream) 을 제공합니다.

## URL APIs

URL 들은 [`URL`](https://developer.mozilla.org/ko/docs/Web/API/URL) 인터페이스로 표현됩니다.
이 인터페이스에는 `origin` 과 `pathname` (그리고 브라우저에서는 `hash`)과 같은 유용한 속성이 포함되어 있습니다.
이 인터페이스는 [hooks](hooks) 와 [server routes](routing#server) 에서 `event.url`, [pages](routing#page) 에서 [`$page.url`](modules#$app-stores), [`beforeNavigate` 와 `afterNavigate`](modules#$app-navigation) 에서 `from` 과 `to` 등 다양한 곳에서 나타납니다.

### URLSearchParams

`url.searchParams` 를 사용하여 URL 쿼리 문자열을 쉽게 구문 분석할 수 있습니다. 이는 [`URLSearchParams`](https://developer.mozilla.org/ko/docs/Web/API/URLSearchParams) 의 인스턴스입니다.

```js
// @filename: ambient.d.ts
declare global {
	const url: URL;
}

export {};

// @filename: index.js
// ---cut---
const foo = url.searchParams.get('foo');
```

## Web Crypto

[Web Crypto API](https://developer.mozilla.org/ko/docs/Web/API/Web_Crypto_API) 는 전역적으로 선언된 `crypto` 를 통해 사용할 수 있습니다.
내부적으로 [Content Security Policy](configuration#csp) 헤더에 사용되지만 UUID 생성과 같은 작업에도 사용할 수 있습니다.

```js
const uuid = crypto.randomUUID();
```
