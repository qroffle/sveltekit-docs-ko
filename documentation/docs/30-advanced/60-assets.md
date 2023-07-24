---
title: 에셋 핸들링
---

## Caching and inlining

[Vite 는 자동으로 임포트된 에셋에 대해 성능 개선 프로세스를 처리합니다.](https://vitejs.dev/guide/assets.html)
파일 명에는 해시가 추가되며, `assetsInlineLimit` 가 에셋을 인라인으로 처리하는 것 보다 더 작은 크기로 캐싱할 수 있게 됩니다.

```html
<script>
	import logo from '$lib/assets/logo.png';
</script>

<img alt="프로젝트 로고" src={logo} />
```

별도의 임포트 절차 없이 마크업에서 바로 에셋을 참조하고 싶다면, [svelte-preprocess-import-assets](https://github.com/bluwy/svelte-preprocess-import-assets) 와 같은 전처리기를 사용할 수 있습니다.

CSS의 `url()` 함수를 사용하여 에셋을 포함시키고 싶다면, [`vitePreprocess`](https://kit.svelte.dev/docs/integrations#preprocessors-vitepreprocess) 에 대해 알아보는 것이 도움이 될 수 있습니다.

## Transforming

이미지를 압축된 이미지, 특히 `.webp` 나 `.avif` 같은 포맷으로 변형하거나, 여러 크기를 가진 반응형 이미지 출력을 작성하거나, 개인정보 보호 등을 이유로 EXIF 데이터를 삭제하기를 원할 수 있습니다.
기본적으로 이미지들은 정적으로 포함되므로, [vite-imagetools](https://github.com/JonasKruckenberg/imagetools 같은 Vite 플러그인을 고려할 수 있습니다.
또는 `Accept` HTTP 허더와 쿼리스트링 파라미터를 따라 적절한 이미지로 변형해주는 CDN을 고려해 볼 수도 있습니다.
