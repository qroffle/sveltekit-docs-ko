---
title: 프로젝트 생성하기
---

SvelteKit 앱 개발을 시작하는 제일 쉬운 방법은 `npm create` 를 사용하는 것 입니다.

```bash
npm create svelte@latest my-app
cd my-app
npm install
npm run dev
```

첫번째 명령어는 `my-app` 디렉토리에 새로운 프로젝트를 생성합니다. TypeScript 와 같은 기본적인 도구를 설정할 것인지 물어보게 됩니다.
[추가 도구를 설정하는 방법](faq#integrations)에 대해서는 FAQ 를 참고하세요.
그 다음 명령어는 의존성을 설치하고 [localhost:5173](http://localhost:5173) 에 서버를 시작합니다.

2가지 기본적인 개념이 있습니다.
- 각각의 페이지는 [Svelte](https://svelte.dev) 컴포넌트 입니다.
- `src/routes` 디렉토리에 파일을 추가하여 페이지를 생성할 수 있습니다. 이것은 서버에서 렌더링되어 사용자가 앱에 처음 접속할 때 최대한 빠르게 로딩되고, 그 다음 클라이언트 사이드 앱이 동작합니다.

파일들을 수정하여 어떻게 동작하는지 확인해보세요.

## Editor setup

[Visual Studio Code](https://code.visualstudio.com/download) 에 [Svelte 익스텐션](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) 을 설치하여 사용하는 것을 권장합니다.
[기타 에디터 지원](https://sveltesociety.dev/tools#editor-support) 에 대해서는 여기를 참고하세요.
