---
title: "AdSense 심사 전에 사이트 탐색 문제를 고친 기록"
description: "AdSense 검토 요청을 받은 뒤 zozindev.com의 리디렉션 루프, sitemap, 내부 링크를 정리한 기록이다."
date: "2026-06-15"
category: "Checklist"
priority: 0.7
---

AdSense 검토 요청을 받은 뒤 가장 먼저 본 건 광고 코드가 아니었다. 사이트가 제대로 탐색되는지부터 확인했다. Google 도움말에서도 사이트 탐색 문제를 비승인 원인 중 하나로 설명하고 있고, 리디렉션이나 깨진 링크 같은 문제가 있으면 검토에서 불리할 수 있다.

처음 확인했을 때 `zozindev.com`의 루트는 열렸지만 `/blog/`와 `/projects/`가 308 리디렉션 루프에 빠져 있었다. 사용자가 메뉴를 눌렀을 때 블로그나 프로젝트 목록을 볼 수 없다면 사이트가 완성된 상태로 보이기 어렵다.

## 문제 원인

Astro를 도입하면서 기존 `.html` URL을 유지하려고 `build.format: "file"` 설정을 썼다. 그래서 목록 페이지가 `blog.html`, `projects.html`로 생성됐다. 여기에 Cloudflare Pages의 `_redirects`로 `/blog/`를 `/blog.html`에 연결하려고 했다.

문제는 Cloudflare 쪽 URL 정규화와 이 rewrite가 부딪히면서 루프가 생겼다는 점이다. `/blog/`가 `/blog.html`로 가고, 다시 `/blog`로 정규화되면서 계속 같은 위치를 돌았다.

## 고친 방식

해결은 복잡하게 하지 않았다. `_redirects` rewrite를 제거하고, Astro 기본 directory output으로 되돌렸다.

이제 빌드 결과는 이런 식으로 나온다.

```text
dist/blog/index.html
dist/projects/index.html
dist/privacy/index.html
dist/blog/2026-06-15-adsense-navigation-fix/index.html
```

그리고 내부 링크도 모두 clean URL로 맞췄다.

```text
/blog/
/projects/
/privacy/
/blog/2026-06-15-adsense-navigation-fix/
```

canonical과 sitemap도 같은 URL을 가리키게 했다. 같은 페이지가 여러 주소로 보이거나, sitemap이 실제 접근 불가능한 주소를 가리키면 검토 과정에서 좋을 게 없다.

## 확인한 것

수정 후에는 로컬 빌드를 먼저 확인했다.

```text
npm run build
```

그 다음 생성된 `dist` 기준으로 내부 링크가 실제 파일로 이어지는지 검사했다. sitemap 안에 `.html` 주소가 남아 있지 않은지도 확인했다.

배포 후에는 라이브 URL도 다시 확인했다.

```text
https://zozindev.com/blog/
https://zozindev.com/projects/
https://zozindev.com/privacy/
https://zozindev.com/sitemap.xml
```

이 URL들이 모두 200으로 열려야 한다. 루트 페이지만 열리고 내부 페이지가 막히면 AdSense 입장에서는 사이트가 덜 완성된 상태로 보일 수 있다.

## 같이 본 부분

탐색 문제만 고치고 끝내면 부족하다. 글 본문도 너무 짧으면 콘텐츠 부족으로 보일 수 있다. 그래서 기존 짧은 글을 보강하고, 프로젝트 상세 페이지도 외부 링크만 있는 페이지처럼 보이지 않게 설명을 늘렸다.

개인정보처리방침도 광고와 쿠키, 외부 서비스, 데이터 보관, 문의 경로를 더 명확히 적었다. AdSense 심사에서 Privacy 페이지 자체가 승인 보장 요소는 아니지만, 광고와 쿠키를 쓰는 사이트라면 기본 안내는 제대로 갖추는 게 맞다.

## 기준

앞으로 새 페이지를 만들 때는 세 가지를 같이 본다.

- 내부 링크가 실제로 열린다.
- canonical과 sitemap이 같은 최종 URL을 가리킨다.
- 페이지 안에 읽을 만한 본문이 있다.

이 세 가지가 맞으면 최소한 “탐색이 안 되는 사이트”처럼 보일 가능성은 줄어든다.
