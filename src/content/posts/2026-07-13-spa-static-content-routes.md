---
title: "SPA 콘텐츠 라우트를 정적 HTML로 보강한 기록"
description: "WTHeat와 정산 칠판에서 React SPA 라우트가 빈 HTML 셸로 보이는 문제를 줄이기 위해 정적 콘텐츠 페이지를 추가한 구현 기록이다."
date: "2026-07-13"
category: "implementation"
priority: 0.8
includeAdsenseScript: false
---

WTHeat와 정산 칠판은 둘 다 React 기반 SPA다. 사용자가 브라우저에서 열면 앱은 잘 동작하지만, 서버가 처음 내려주는 HTML만 보면 본문이 거의 없다. `/guide`, `/about`, `/blog/...` 같은 라우트도 결국 `index.html`을 받은 뒤 JavaScript가 실행되어야 화면이 채워지는 구조였다.

이 구조는 앱 사용에는 문제가 없지만, 검색 엔진이나 광고 심사처럼 초기 HTML을 먼저 보는 환경에서는 약점이 된다. 특히 가이드, 소개, 블로그처럼 읽을거리 역할을 하는 라우트는 처음 받은 HTML 안에 본문이 들어 있는 편이 더 명확하다. 그래서 앱 자체를 바꾸기보다 콘텐츠 라우트만 정적 HTML로 따로 제공하는 방식으로 보강했다.

## 선택한 방식

전체 프레임워크를 바꾸지 않았다. Astro나 SSR로 옮기면 구조는 더 깔끔해질 수 있지만, 이번 목적은 빠르게 검증 가능한 정적 페이지를 추가하는 것이었다. 그래서 앱 루트는 SPA로 유지하고, 읽을거리 라우트만 `public` 아래에 실제 HTML 파일로 만들었다.

WTHeat는 이미 `src/data/blogPosts.ts`에 블로그 데이터가 있었다. 이 데이터를 다시 손으로 복사하지 않기 위해 `scripts/generate-static-pages.mjs`를 추가했다. 빌드 전에 이 스크립트가 실행되고, `public/guide/index.html`, `public/about/index.html`, `public/blog/index.html`, `public/blog/<slug>/index.html` 파일을 생성한다. `package.json`의 build 명령도 `node scripts/generate-static-pages.mjs && tsc -b && vite build` 순서로 바꿨다.

정산 칠판은 별도 블로그 데이터 구조가 없어서 명시적인 HTML 파일을 추가했다. `apps/web/public/guide/index.html`, `privacy/index.html`, `about/index.html`, `examples/index.html`, `examples/travel/index.html`, `examples/company-dinner/index.html`, `examples/reservation/index.html`을 만들었다. 기존 `guide.html`, `privacy.html`은 `noindex, follow`와 meta refresh를 가진 호환용 페이지로 낮췄다.

## 라우팅과 sitemap

정적 파일은 디렉터리 기반으로 맞췄다. 예를 들어 `/guide/`는 `guide/index.html`, `/blog/how-to-choose-lunch-faster/`는 `blog/how-to-choose-lunch-faster/index.html`이 응답한다. 이렇게 하면 SPA fallback이 있어도 정적 파일이 우선 제공될 수 있다.

WTHeat의 `public/sitemap.xml`은 생성 스크립트가 함께 다시 쓴다. sitemap에는 `/guide/`, `/about/`, `/privacy/`, `/contact/`, `/blog/`, 개별 블로그 글 URL을 trailing slash 형태로 넣었다. 정산 칠판도 `apps/web/public/sitemap.xml`에서 `.html` URL 대신 `/guide/`, `/privacy/`, `/examples/.../` 같은 실제 정적 라우트로 바꿨다.

## 광고 코드는 넣지 않았다

이번 정적 페이지의 목적은 초기 HTML에 본문을 제공하는 것이다. 광고 로더를 다시 넣는 것이 아니다. 그래서 정적 페이지에는 `google-adsense-account` 메타만 유지하고 `pagead2` 또는 `adsbygoogle` 로더는 넣지 않았다. 앱 화면과 안내 페이지가 충분히 안정적으로 색인되고, AdSense 승인 이후에도 광고는 본문형 페이지에만 제한적으로 붙이는 편이 낫다.

## 개선된 점

가장 큰 변화는 `/guide/`, `/about/`, `/blog/...`, `/examples/...` 요청이 더 이상 빈 SPA 셸에만 의존하지 않는다는 점이다. HTML 응답 안에 제목, 설명, 본문, canonical, OG 메타가 바로 들어간다. JavaScript 실행 전에도 페이지의 주제와 내용이 드러난다.

WTHeat는 기존 블로그 데이터를 재사용하므로 React 페이지와 정적 HTML의 내용이 따로 관리되지 않는다. 블로그 글 데이터가 늘어나면 생성 스크립트가 정적 페이지와 sitemap을 같이 갱신한다. 정산 칠판은 사용법과 예시를 별도 정적 문서로 분리해, 앱 화면은 계산에 집중하고 콘텐츠 페이지는 입력 기준을 설명하도록 역할을 나눴다.

검증 기준은 단순하다. 빌드 후 `dist/guide/index.html`이나 `dist/blog/<slug>/index.html`을 열었을 때 본문 텍스트가 HTML에 직접 있어야 한다. 또한 `pagead2`와 `adsbygoogle` 문자열은 없어야 한다. 이 기준을 통과하면 검색 엔진과 심사 봇이 JavaScript 렌더링에 실패하더라도 최소한 콘텐츠 페이지의 핵심 본문은 읽을 수 있다.
