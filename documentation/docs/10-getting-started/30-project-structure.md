---
title: 프로젝트 구조
---

일반적으로 SvelteKit 프로젝트는 아래와 같은 구조를 가집니다.

```bash
my-project/
├ src/
│ ├ lib/
│ │ ├ server/
│ │ │ └ [your server-only lib files]
│ │ └ [your lib files]
│ ├ params/
│ │ └ [your param matchers]
│ ├ routes/
│ │ └ [your routes]
│ ├ app.html
│ ├ error.html
│ ├ hooks.client.js
│ └ hooks.server.js
├ static/
│ └ [your static assets]
├ tests/
│ └ [your tests]
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
```

이와 더불어 `.gitignore`, `.npmrc` 등 일반적인 파일들도 존재할 수 있습니다. (`.prettierrc`, `.eslintrc.cjs` 와 같은 설정파일도 존재할 수 있으며, 이는 프로젝트 생성시 선택적으로 생성할 수 있습니다.)

## Project files

### src

`src` 디렉토리는 프로젝트의 핵심을 담고 있습니다. `src/routes` 와 `src/app.html` 을 제외한 모든 파일은 선택적입니다.

- `lib` 디렉토리는 라이브러리 코드 (유틸리티, 컴포넌트 등)을 담고 있습니다. [`$lib`](modules#$lib) 별칭을 통해 불러올 수 있으며, [`svelte-package`](packaging) 를 통해 패키징하여 배포할 수 있습니다.
    - `server` 디렉터리는 서버 전용 라이브러리 코드를 담고 있습니다. [`$lib/server`](server-only-modules) 별칭을 통해 불러올 수 있으며, SvelteKit 은 클라이언트 코드에서 이를 불러오는 것을 막습니다.
- `params` 디렉토리는 [파라미터 매처](advanced-routing#matching)를 담고 있습니다.
- `routes` 디렉토리는 [라우트](routing)를 담고 있습니다. 라우트 내에서만 사용되는 컴포넌트도 함께 두어도 됩니다.
- `app.html` 파일은 페이지 템플릿입니다. 아래의 플레이스홀더를 포함하고 있습니다.
    - `%sveltekit.head%` — 앱에 필요한 `<link>` 와 `<script>` 요소, 그리고 `<svelte:head>` 내용
    - `%sveltekit.body%` — 렌더링된 페이지의 마크업. 이는 `<body>` 내부가 아닌 `<div>` 나 다른 요소 내부에 위치해야 합니다. 이는 브라우저 확장 프로그램이 삽입한 요소가 하이드레이션 과정에서 파괴되는 버그를 방지하기 위함입니다. 이를 충족하지 못할 경우 개발 모드에서 경고가 발생합니다.
    - `%sveltekit.assets%` — [`paths.assets`](configuration#paths) 가 지정되어 있다면 해당 경로, 그렇지 않다면 [`paths.base`](configuration#paths) 의 상대 경로를 가리킵니다.
    - `%sveltekit.nonce%` — 수동으로 포함된 링크와 스크립트를 위한 [CSP](configuration#csp) nonce 를 가리킵니다.
    - `%sveltekit.env.[NAME]%` - 렌더링 시 `[NAME]` 환경 변수로 대체됩니다. 이는 [`publicPrefix`](configuration#env) (일반적으로 `PUBLIC_`) 로 시작하는 변수여야 합니다. 매칭되는 변수가 없다면 `''` 로 대체됩니다.
- `error.html` 파일은 모든 것이 실패했을 때 렌더링되는 페이지입니다. 아래의 플레이스홀더를 포함하고 있습니다.
    - `%sveltekit.status%` — HTTP 상태 코드
    - `%sveltekit.error.message%` — 에러 메시지
- `hooks.client.js` 파일은 클라이언트 전용 [훅](hooks)을 담고 있습니다.
- `hooks.server.js` 파일은 서버 전용 [훅](hooks)을 담고 있습니다.
- `service-worker.js` 파일은 [서비스 워커](service-workers)를 담고 있습니다.

(프로젝트에 `.ts` 파일이 포함되어 있다면, `.js` 대신 `.ts` 확장자를 사용합니다. 이는 프로젝트 생성시 TypeScript 를 사용하도록 선택했는지에 따라 달라집니다. 이 문서의 하단에 있는 토글을 통해 JavaScript 와 TypeScript 를 전환할 수 있습니다.)

프로젝트를 생성할 때 [Vitest](https://vitest.dev) 를 추가했다면, 유닛 테스트는 `.test.js` 확장자를 가진 `src` 디렉토리에 위치합니다.

### static

`robots.txt`, `favicon.png` 와 같이 그대로 제공되어야 하는 정적 파일은 이 디렉토리에 위치합니다.

### tests

프로젝트를 생성할 때 [Playwright](https://playwright.dev/) 를 추가했다면, 브라우저 테스트는 이 디렉토리에 위치합니다.

### package.json

`package.json` 파일은 `@sveltejs/kit`, `svelte`, `vite` 를 `devDependencies` 로 포함해야 합니다.

`npm create svelte@latest` 를 통해 프로젝트를 생성하면, `package.json` 파일에는 `type` 필드가 `"module"` 으로 설정되어 있습니다. 이는 `.js` 파일이 `import` 와 `export` 키워드를 사용하는 네이티브 자바스크립트 모듈로 해석되는 것을 의미합니다. 레거시 CommonJS 파일은 `.cjs` 확장자를 사용해야 합니다.

### svelte.config.js

이 파일은 Svelte 와 SvelteKit [설정](configuration)을 담고 있습니다.

### tsconfig.json

`npm create svelte@latest` 를 통해 타입 체크를 추가했다면 이 파일(또는 `jsconfig.json`)은 TypeScript 를 설정합니다. SvelteKit 은 특정 설정이 특정한 방식으로 설정되어야 정상 작동하므로, `extends` 를 통해 자체 `.svelte-kit/tsconfig.json` 파일을 생성합니다.

### vite.config.js

SvelteKit 프로젝트는 사실상 [`@sveltejs/kit/vite`](modules#sveltejs-kit-vite) 플러그인을 사용하는 [Vite](https://vitejs.dev) 프로젝트입니다. 다른 [Vite 설정](https://vitejs.dev/config/)과 함께 사용할 수 있습니다.

## Other files

### .svelte-kit

프로젝트를 개발 및 빌드할 때, SvelteKit 은 `.svelte-kit` 디렉토리에 파일을 생성합니다. 이 디렉토리는 [`outDir`](configuration#outdir) 로 설정할 수 있습니다. 이 디렉토리의 내용은 무시하고 언제든지 삭제할 수 있습니다 (다음 `dev` 또는 `build` 시 다시 생성됩니다).