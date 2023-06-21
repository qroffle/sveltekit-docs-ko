---
title: package.json 파일을 읽을 수 있나요?
---

SvelteKit 은 [`svelte.config.js`](configuration) 가 ES 모듈로 작성되었다고 가정하기 때문에 JSON 파일을 직접적으로 요구할 수 없습니다.
애플리케이션의 버전 번호나 `package.json` 에 있는 다른 정보를 애플리케이션에 포함시키고 싶다면 다음과 같이 JSON 을 로드할 수 있습니다:

```js
/// file: svelte.config.js
// @filename: index.js
/// <reference types="@types/node" />
import { URL } from 'url';
// ---cut---
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);
```