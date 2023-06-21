---
title: 앱 빌드하기
---

`vite build` (일반적으로 `npm run build` 를 통해 실행) 를 실행하면 SvelteKit 는 앱을 두 단계로 나눠 빌드합니다.

먼저, Vite 는 서버 코드, 브라우저 코드, 서비스 워커(있는 경우)의 최적화된 프로덕션 빌드를 생성합니다.
[Prerendering](page-options#prerender) 이 적절한 경우 이 단계에서 실행됩니다.

두 번째로, _어댑터_ 는 이 프로덕션 빌드를 대상 환경에 맞게 튜닝합니다 — 다음 페이지에서 자세히 다루겠습니다.

## During the build

SvelteKit 은 빌드 중 `+page/layout(.server).js` 파일들과 그들이 import 하는 모든 파일들을 분석하기 위해 실행합니다. 이 단계에서 실행되지 않아야 하는 코드는 [`$app/environment`](modules#$app-environment) 의 `building` 이 `false` 인지 확인해야 합니다.

```diff
+import { building } from '$app/environment';
import { setupMyDatabase } from '$lib/server/database';

+if (!building) {
	setupMyDatabase();
+}

export function load() {
	// ...
}
```

## Preview your app

빌드가 완료되면 `vite preview` (일반적으로 `npm run preview` 를 통해 실행) 를 통해 로컬에서 프로덕션 빌드를 실행할 수 있습니다.
이는 앱을 Node 에서 실행하므로 배포된 앱과 완벽히 동일하지는 않습니다 — [특정 플랫폼 종속 컨텍스트](adapters#platform-specific-context) 와 같은 어댑터 특정 조정은 미리보기에서는 적용되지 않습니다.
