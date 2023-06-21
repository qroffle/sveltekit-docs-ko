---
title: SvelteKit 에서 HMR 을 사용할 수 있나요?
---

SvelteKit 은 [svelte-hmr](https://github.com/sveltejs/svelte-hmr) 으로 작동하는 HMR 이 기본적으로 활성화 되어 있습니다.
[Rich's presentation at the 2020 Svelte Summit (영문)](https://svelte.dev/blog/whats-the-deal-with-sveltekit) 을 보셨다면, 더 강력해 보이는 HMR 을 보셨을 겁니다.
이 데모는 `svelte-hmr` 의 `preserveLocalState` 플래그가 켜져 있었습니다. 이 플래그는 예상치 못한 동작과 예외 상황을 초래할 수 있으므로 기본적으로 꺼져 있습니다.
하지만 걱정하지 마세요, 여전히 SvelteKit 의 HMR 을 사용할 수 있습니다!
로컬 상태를 보존하려면 [svelte-hmr](https://github.com/sveltejs/svelte-hmr) 에서 문서화된 `@hmr:keep` 또는 `@hmr:keep-all` 지시문을 사용할 수 있습니다.
