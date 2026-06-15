---
title: "Cloudflare Pages로 Astro 블로그 배포하면서 확인한 것"
description: "Astro 기반 zozindev.com을 Cloudflare Pages에 배포하면서 build output, URL 구조, 배포 반영 문제를 확인한 기록이다."
date: "2026-06-15"
category: "Build Log"
priority: 0.7
---

zozindev.com을 Astro와 Markdown 기반으로 바꾼 뒤 Cloudflare Pages 배포 설정도 같이 바꿔야 했다. 예전에는 정적 HTML 파일을 루트에 그대로 두는 방식이었지만, Astro를 쓰면 빌드 결과물인 `dist`를 배포해야 한다.

Cloudflare Pages에서 핵심 설정은 단순하다.

```text
Build command: npm run build
Build output directory: dist
```

문제는 설정을 바꿨다고 바로 기존 배포본이 바뀌는 건 아니라는 점이다. 이전 배포가 그대로 보이면 CSS가 안 먹는 것처럼 보이거나, 구버전 HTML이 계속 내려오는 것처럼 보일 수 있다. 이럴 때는 최신 커밋으로 새 deployment가 실제 생성됐는지 봐야 한다.

## 처음 헷갈렸던 부분

처음에는 `style.css`가 안 먹는 줄 알았다. 하지만 실제로 확인해보니 CSS 문제가 아니라 Cloudflare Pages가 예전 배포본을 계속 보여주고 있었다. 로컬 `dist/index.html`에는 `/style.css`가 정상으로 들어 있었고, `dist/style.css`도 존재했다.

이런 상황에서는 브라우저에서 보이는 화면만 보고 판단하면 안 된다. 먼저 라이브 HTML이 최신 커밋의 내용인지 확인해야 한다. 페이지 문구나 최근 글 목록이 최신 소스와 다르면 빌드 결과가 아직 배포되지 않은 것이다.

## 배포 후 확인한 것

배포가 제대로 된 뒤에는 루트 페이지, CSS, `ads.txt`, `robots.txt`, `sitemap.xml`을 모두 직접 확인했다.

```text
https://zozindev.com/
https://zozindev.com/style.css
https://zozindev.com/ads.txt
https://zozindev.com/sitemap.xml
```

특히 AdSense를 신청한 상태라 `ads.txt`와 광고 계정 meta, AdSense script가 빠지면 안 된다. 로컬 빌드만 통과해도 실제 배포 URL에서 빠져 있으면 의미가 없다.

## URL 구조 문제

Cloudflare Pages는 `.html` 파일을 확장자 없는 URL로 정규화할 수 있다. 이때 내부 링크와 sitemap이 `.html`을 가리키고 있거나, `_redirects`에서 잘못 rewrite하면 리디렉션 루프가 생길 수 있다.

실제로 `/blog/`와 `/projects/`가 308 redirect loop에 빠진 적이 있었다. 이건 사용자 입장에서도 문제고, AdSense 검토에서도 사이트 탐색 문제로 볼 수 있다. 그래서 최종적으로는 Astro 기본 directory output을 쓰고, 내부 링크와 canonical, sitemap을 clean URL 기준으로 통일했다.

## 지금 기준

현재 기준은 이렇다.

- `/blog/`는 블로그 목록
- `/projects/`는 프로젝트 목록
- `/privacy/`는 개인정보처리방침
- `/blog/post-slug/`는 개별 글
- `/projects/project-name/`은 프로젝트 상세

이렇게 맞춰두면 sitemap과 canonical이 실제 접근 가능한 URL을 가리킨다. 검색 엔진과 AdSense 검토가 따라 들어갔을 때도 리디렉션 루프가 없다.

## 배운 점

정적 사이트 배포는 단순해 보이지만, URL 구조와 빌드 산출물 위치가 조금만 엇갈려도 바로 티가 난다. 특히 AdSense 심사 전에는 로컬 빌드가 아니라 실제 라이브 URL을 기준으로 확인해야 한다.

앞으로 새 페이지를 만들 때도 같은 기준으로 볼 생각이다. 페이지가 열리는지, CSS가 적용되는지, canonical이 실제 URL과 맞는지, sitemap에 들어갔는지까지 확인하고 배포해야 한다.
