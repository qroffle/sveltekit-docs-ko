---
title: 어댑터 작성하기
---

배포하고자 하는 환경을 지원하는 어댑터가 존재하지 않는다면, 이를 직접 작성할 수 있습니다.
[기존 어탭터 소스코드](https://github.com/sveltejs/kit/tree/master/packages)에서 유사한 플랫폼을 찾아 복사하여 시작하는 것을 권장합니다.

어탭터 패키지는 `Adapter` 를 생성하는 아래의 API 를 구현해야 합니다.

```js
// @filename: ambient.d.ts
type AdapterSpecificOptions = any;

// @filename: index.js
// ---cut---
/** @param {AdapterSpecificOptions} options */
export default function (options) {
	/** @type {import('@sveltejs/kit').Adapter} */
	const adapter = {
		name: 'adapter-package-name',
		async adapt(builder) {
			// adapter implementation
		}
	};

	return adapter;
}
```

`Adapter` 의 타입과 파라미터들은 [types/index.d.ts](https://github.com/sveltejs/kit/blob/master/packages/kit/types/index.d.ts) 에서 확인할 수 있습니다.

`adapt` 메서드 내부에서 어댑터가 해야할 일들이 있습니다:

- 빌드 디렉토리 비우기
- `builder.writeClient`, `builder.writeServer`, `builder.writePrerendered` 를 사용하여 SvelteKit 출력물 작성
- 코드 출력물:
	- `${builder.getServerDirectory()}/index.js` 에서 `Server` 를 import
	- `builder.generateManifest({ relativePath })` 로 생성된 manifest 를 사용하여 앱 인스턴스화
	- 플랫폼으로부터의 요청을 수신하고, 필요하다면 표준 [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) 로 변환하고 `server.respond(request, { getClientAddress })` 함수를 호출하여 [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) 를 생성하고 응답
	- `server.respond` 를 통해 플랫폼에 특화된 정보를 `platform` 옵션을 통해 SvelteKit 에 노출
	- 필요하다면 `node-fetch` 를 사용할 수 있는 플랫폼에 대해 `@sveltejs/kit/install-fetch` 헬퍼를 제공하는 `fetch` 를 전역적으로 할당
- 필요하다면 의존성을 설치하지 않고 번들링
- 사용자의 정적 파일과 생성된 JS/CSS 를 플랫폼에 맞는 위치에 배치

가능한 경우, 중간 출력물은 `.svelte-kit/[adapter-name]` 에 두고 어댑터 출력물은 `build/` 디렉토리 아래에 두는 것을 권장합니다.
