---
title: Node 서버
---

독립 작동하는 Node 서버를 생성하려면, [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) 를 사용하세요.

## Usage

`npm i -D @svelteks/adapter-node` 로 어댑터를 설치하고, `svelte.config.js` 에 어댑터를 추가하세요:

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
	kit: {
		adapter: adapter()
	}
};
```

## Deploying

`npm run build` 를 사용하여 먼저 앱을 빌드하세요. 이는 어댑터 옵션에서 지정한 출력 디렉토리에 프로덕션 서버를 생성합니다. 기본값은 `build` 입니다.

출력 디렉토리, 프로젝트의 `package.json`, `node_modules` 의 프로덕션 종속성이 앱을 실행하는 데 필요합니다.
프로덕션 종속성은 `package.json` 과 `package-lock.json` 을 복사한 다음 `npm ci --omit dev` 를 실행하여 생성할 수 있습니다 (앱에 종속성이 없는 경우 이 단계를 건너뛸 수 있습니다).
그런 다음 다음 명령으로 앱을 시작할 수 있습니다:

```bash
node build
```

개발 종속성은 [Rollup](https://rollupjs.org) 을 사용하여 앱에 번들로 포함됩니다.
주어진 패키지가 번들로 포함되거나 외부화되는지는 해당 패키지가 `package.json` 의 `devDependencies` 또는 `dependencies` 에 위치하는지에 따라 달라집니다.

## Environment variables

개발 및 미리보기 환경에서는, SvelteKit 은 `.env` 파일 (또는 `.env.local`, 또는 `.env.[mode]`, [Vite 에 의해 결정됨](https://vitejs.dev/guide/env-and-mode.html#env-files)) 에서 환경 변수를 읽습니다.

프로덕션에서는 `.env` 파일이 _자동으로_ 로드되지 _않습니다_. 이를 위해, 프로젝트에 `dotenv` 를 설치하세요.

```bash
npm install dotenv
```

이후 `node build` 를 실행할 때 `dotenv` 를 로드하도록 `node` 에게 알려야 합니다. 이를 위해 `node` 에 `-r` 옵션을 사용하세요:

```diff
-node build
+node -r dotenv/config build
```

### `PORT` 및 `HOST`

기본적으로, 서버는 `0.0.0.0` 의 3000 포트에서 연결을 수락합니다. 이는 `PORT` 와 `HOST` 환경 변수로 사용자 정의할 수 있습니다:

```
HOST=127.0.0.1 PORT=4000 node build
```

### `ORIGIN`, `PROTOCOL_HEADER` 및 `HOST_HEADER`

HTTP 프로토콜은 SvelteKit 에게 현재 요청되고 있는 URL 을 신뢰할 수 있는 방법을 제공하지 않습니다. 앱이 서비스되는 URL 을 SvelteKit 에게 알리는 가장 간단한 방법은 `ORIGIN` 환경 변수를 설정하는 것입니다:

```
ORIGIN=https://my.site node build

# 또는, 로컬 미리보기 및 테스트 환경에서
ORIGIN=http://localhost:3000 node build
```

이를 통해 `/stuff` 경로명에 대한 요청은 `https://my.site/stuff` 로 올바르게 해석됩니다.
또는, 요청 프로토콜과 호스트에 대해 SvelteKit 에게 알리는 헤더를 지정할 수 있습니다. 이를 통해 SvelteKit 이 원본 URL 을 구성할 수 있습니다:

```
PROTOCOL_HEADER=x-forwarded-proto HOST_HEADER=x-forwarded-host node build
```

> [`x-forwarded-proto`](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/X-Forwarded-Proto) 와 [`x-forwarded-host`](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/X-Forwarded-Host) 는 사실상 표준 헤더로, 역방향 프록시 (로드 밸런서 및 CDN) 를 사용하는 경우 원래 프로토콜과 호스트를 전달합니다. 신뢰할 수 있는 역방향 프록시 뒤에 서버가 있을 때만 이러한 변수를 설정해야 합니다. 그렇지 않으면 클라이언트가 이러한 헤더를 스푸핑할 수 있습니다. 

`adapter-node` 가 배포된 환경의 URL 을 올바르게 결정할 수 없는 경우, [폼 액션](form-actions)을 사용할 때 다음 오류가 발생할 수 있습니다:

> 교차 사이트 POST 폼 제출은 금지되어 있습니다.

### `ADDRESS_HEADER` 및 `XFF_DEPTH`

[RequestEvent](types#public-types-requestevent) 객체는 훅 및 엔드포인트에 전달되며 `event.getClientAddress()` 함수를 포함합니다.
기본적으로 이는 연결하는 `remoteAddress` 를 포함합니다.
서버가 하나 이상의 프록시 (로드 밸런서와 같은) 뒤에 있는 경우, 이 값은 클라이언트의 IP 주소가 아닌 가장 안쪽 프록시의 IP 주소를 포함하므로 `ADDRESS_HEADER` 를 지정해야 합니다:

```
ADDRESS_HEADER=True-Client-IP node build
```

> HTTP 헤더들은 쉽게 조작될 수 있습니다. `PROTOCOL_HEADER` 와 `HOST_HEADER` 와 마찬가지로, 이러한 헤더를 설정하기 전에 [무엇을 하고 있는지 (영문)](https://adam-p.ca/blog/2022/03/x-forwarded-for/) 알아야 합니다.

만약 `ADDRESS_HEADER` 가 `X-Forwarded-For` 라면, 헤더 값은 IP 주소의 쉼표로 구분된 목록을 포함합니다.
`XFF_DEPTH` 환경 변수는 서버 앞에 있는 신뢰할 수 있는 프록시의 수를 지정해야 합니다. 예를 들어, 세 개의 신뢰할 수 있는 프록시가 있는 경우, 프록시 3은 원래 연결 및 첫 두 프록시의 주소를 전달합니다:

```
<client address>, <proxy 1 address>, <proxy 2 address>
```

일부 가이드는 가장 왼쪽 주소를 읽으라고 말하지만, 이는 [스푸핑에 취약 (영문)](https://adam-p.ca/blog/2022/03/x-forwarded-for/)합니다:

```
<spoofed address>, <client address>, <proxy 1 address>, <proxy 2 address>
```

대신, 우리는 오른쪽에서 읽습니다. 신뢰할 수 있는 프록시의 수를 고려합니다. 이 경우, `XFF_DEPTH=3` 을 사용합니다.

> 만약 (헤더 조작과 관계 없이) 오른쪽에서 읽어야 할 필요가 있다면 — 예를 들어, IP 주소를 신뢰할 수 있는지 여부보다는 실제 IP 주소가 더 중요한 지리적 위치 서비스를 제공하는 경우, 앱 내에서 `x-forwarded-for` 헤더를 검사함으로써 왼쪽에서 읽을 수 있습니다.

### `BODY_SIZE_LIMIT`

스트리밍 중인 경우 포함하여 바이트 단위의 수신 요청 본문 크기의 최대값입니다. 기본값은 512kb 입니다.
0 으로 설정하여 이 옵션을 비활성화 할 수 있으며, 더 고급 기능이 필요한 경우 [`handle`](hooks#server-hooks-handle) 에서 사용자 정의 검사를 구현할 수 있습니다.

## Options

이 어댑터는 다양한 옵션으로 구성할 수 있습니다:

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
	kit: {
		adapter: adapter({
			// 기본 옵션
			out: 'build',
			precompress: false,
			envPrefix: '',
			polyfill: true
		})
	}
};
```

### out

빌드한 서버를 생성할 디렉토리입니다. 기본값은 `build` 입니다 — 즉, `node build` 는 이 디렉터리가 생성된 후 로컬에서 서버를 시작합니다.

### precompress

gzip 과 brotli 를 사용하여 자산과 사전 렌더링된 페이지를 사전 압축할 수 있습니다. 기본값은 `false` 입니다.

### envPrefix

환경 변수의 이름을 변경해야 한다면 (예: 제어하지 않는 환경 변수와 충돌을 피하기 위해), 접두사를 지정할 수 있습니다:

```js
envPrefix: 'MY_CUSTOM_';
```

```sh
MY_CUSTOM_HOST=127.0.0.1 \
MY_CUSTOM_PORT=4000 \
MY_CUSTOM_ORIGIN=https://my.site \
node build
```

### polyfill

누락된 모듈에 대한 폴리필을 로드할지 여부를 제어합니다. 기본값은 `true` 이며, Node 18.11 이상을 사용하는 경우에만 비활성화해야 합니다.

> Node 의 내장 `crypto` 전역을 Node 18 에서 사용하려면 `--experimental-global-webcrypto` 플래그를 사용해야 합니다. 이 플래그는 Node 20 에서는 필요하지 않습니다.

## Custom server

어탭터는 빌드 디렉토리에 `index.js` 와 `handler.js` 두 개의 파일을 생성합니다. `index.js` 를 실행하면 (예: `node build`), 구성된 포트에서 서버가 시작됩니다.

또는, `handler.js` 를 import 하여 [Express]((https://github.com/expressjs/expressjs.com), [Connect](https://github.com/senchalabs/connect) 또는 [Polka](https://github.com/lukeed/polka)
(심지어는 내장된 [`http.createServer`](https://nodejs.org/dist/latest/docs/api/http.html#httpcreateserveroptions-requestlistener)) 와 같은 HTTP 서버에 연결할 수 있습니다.

```js
// @errors: 2307 7006
/// file: my-server.js
import { handler } from './build/handler.js';
import express from 'express';

const app = express();

// SvelteKit 과 관계 없는 라우트를 추가할 수 있습니다.
app.get('/healthcheck', (req, res) => {
	res.end('ok');
});

// 이외의 모든 것들은 SvelteKit 에서 처리하도록 합니다. (사전 렌더링 페이지, 정적 에셋 처리 등 포함)
app.use(handler);

app.listen(3000, () => {
	console.log('3000 포트만큼 사랑해');
});
```

## Troubleshooting

### 서버가 종료되기 전에 정리하는 훅이 있나요?

SvelteKit 에는 서버가 종료되기 전에 실행되는 훅이 없습니다. 이는 실행 환경에 크게 의존하기 때문입니다. Node 의 경우, `process.on(..)` 을 사용하여 서버가 종료되기 전에 실행되는 콜백을 구현할 수 있습니다:

```js
// @errors: 2304 2580
function shutdownGracefully() {
	// 서버를 종료합니다.
	db.shutdown();
}

process.on('SIGINT', shutdownGracefully);
process.on('SIGTERM', shutdownGracefully);
```
