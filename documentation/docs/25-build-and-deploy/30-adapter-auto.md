---
title: 무설정 배포
---

`npm create svelte@latest` 를 사용해 새 SvelteKit 프로젝트를 생성하면 기본적으로 [`adapter-auto`](https://github.com/sveltejs/kit/tree/master/packages/adapter-auto) 가 설치됩니다.
이 어댑터는 배포할 때 지원되는 환경에 맞는 어댑터를 자동으로 설치하고 사용합니다:

- [`@sveltejs/adapter-cloudflare`](adapter-cloudflare) - [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [`@sveltejs/adapter-netlify`](adapter-netlify) - [Netlify](https://netlify.com/)
- [`@sveltejs/adapter-vercel`](adapter-vercel) - [Vercel](https://vercel.com/)
- [`svelte-adapter-azure-swa`](https://github.com/geoffrich/svelte-adapter-azure-swa) - [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [`svelte-kit-sst`](https://github.com/serverless-stack/sst/tree/master/packages/svelte-kit-sst) - [AWS (SST 사용)](https://docs.sst.dev/start/svelte)

타겟 환경에 맞는 올바른 어댑터를 `devDependencies` 에 설치하는 것이 권장됩니다. 이렇게 하면 어댑터가 락파일에 추가되고 CI 에서 약간의 설치 시간을 단축할 수 있습니다.

## Environment-specific configuration

[`adapter-vercel`](adapter-vercel) 또는 [`adapter-netlify`](adapter-netlify) 등에서 사용되는 `{ edge: true }`와 같은 특정 플랫폼 종속 설정을 추가하려면
그에 맞는 어댑터를 설치해야 합니다 — `adapter-auto` 는 어떤 옵션도 받지 않습니다.

## Adding community adapters

[adapters.js](https://github.com/sveltejs/kit/blob/master/packages/adapter-auto/adapters.js) 파일을 수정하고 PR 을 열어 추가적인 어댑터를 무설정 지원에 추가할 수 있습니다.
