---
title: "SPA 콘텐츠 라우트를 정적 HTML로 보강한 기록"
description: "WTHeat와 정산 칠판에서 React SPA 라우트가 빈 HTML 셸로 보이는 문제를 줄이기 위해 정적 콘텐츠 페이지를 추가한 구현 기록이다."
date: "2026-07-13"
updated: "2026-07-22"
category: "case-study"
priority: 0.8
includeAdsenseScript: false
---

WTHeat와 정산 칠판은 둘 다 React 기반 SPA다. 사용자가 브라우저에서 열면 앱은 잘 동작하지만, 서버가 처음 내려주는 HTML만 보면 본문이 거의 없다. `/guide`, `/about`, `/blog/...` 같은 라우트도 결국 `index.html`을 받은 뒤 JavaScript가 실행되어야 화면이 채워지는 구조였다.

이 구조는 앱 사용에는 문제가 없지만, JavaScript가 늦게 뜨거나 꺼진 환경에서는 가이드 주소를 열어도 내용을 볼 수 없다. 링크 미리보기와 텍스트 브라우저도 제목 몇 줄만 받는다. 그래서 앱 자체를 바꾸기보다 콘텐츠 라우트만 정적 HTML로 따로 제공하는 방식으로 보강했다.

## 선택한 방식

전체 프레임워크를 바꾸지 않았다. Astro나 SSR로 옮기면 구조는 더 깔끔해질 수 있지만, 이번 목적은 빠르게 검증 가능한 정적 페이지를 추가하는 것이었다. 그래서 앱 루트는 SPA로 유지하고, 읽을거리 라우트만 `public` 아래에 실제 HTML 파일로 만들었다.

WTHeat는 이미 `src/data/blogPosts.ts`에 블로그 데이터가 있었다. 이 데이터를 다시 손으로 복사하지 않기 위해 `scripts/generate-static-pages.mjs`를 추가했다. 빌드 전에 이 스크립트가 실행되고, `public/guide/index.html`, `public/about/index.html`, `public/blog/index.html`, `public/blog/<slug>/index.html` 파일을 생성한다. `package.json`의 build 명령도 `node scripts/generate-static-pages.mjs && tsc -b && vite build` 순서로 바꿨다.

정산 칠판은 별도 블로그 데이터 구조가 없어서 명시적인 HTML 파일을 추가했다. 현재 색인 대상은 앱 루트와 `/guide/`, `/examples/`, `/about/` 네 곳이다. 개인정보 페이지는 접근 가능하지만 `noindex, follow`로 두고 sitemap에서 뺐다. 처음에는 여행, 회식, 예약금 예시를 각각 분리했지만 페이지마다 계산 과정이 짧고 내용도 겹쳤다. 그래서 세 예시를 `/examples/` 한 페이지에 합치고, 기존 주소는 301로 넘겼다. `guide.html`, `privacy.html`은 호환용 페이지로 남겼다.

## 라우팅과 sitemap

정적 파일은 디렉터리 기반으로 맞췄다. 예를 들어 `/guide/`는 `guide/index.html`, `/blog/how-to-choose-lunch-faster/`는 `blog/how-to-choose-lunch-faster/index.html`이 응답한다. 이렇게 하면 SPA fallback이 있어도 정적 파일이 우선 제공될 수 있다.

WTHeat의 `public/sitemap.xml`은 생성 스크립트가 함께 다시 쓴다. 2026년 7월 22일 빌드 기준으로 앱 루트, 가이드, 소개, 블로그 목록, 개별 글 5개까지 모두 9개 URL이 들어간다. 문의와 개인정보 페이지는 열어 둘 필요는 있지만 검색 유입용 본문은 아니라서 `noindex, follow`로 두고 sitemap에서 뺐다. 정산 칠판 sitemap도 `.html` 호환 주소, 개인정보, 통합 전 예시 주소를 빼고 실제 콘텐츠 라우트 4개만 남겼다.

## 정적 문서는 앱 번들과 분리했다

정적 페이지의 목적은 초기 HTML에 본문을 제공하는 것이다. 가이드 한 편을 읽기 위해 React 앱 번들과 상태 관리 코드를 먼저 실행할 이유가 없다. 그래서 정적 문서는 HTML과 작은 인라인 스타일만으로 열리고, 메뉴 선택이나 정산 계산이 필요한 루트에서만 앱 번들을 실행한다.

## 개선된 점

가장 큰 변화는 `/guide/`, `/about/`, `/blog/...`, `/examples/...` 요청이 더 이상 빈 SPA 셸에만 의존하지 않는다는 점이다. HTML 응답 안에 제목, 설명, 본문, canonical, OG 메타가 바로 들어간다. JavaScript 실행 전에도 페이지의 주제와 내용이 드러난다.

WTHeat는 기존 블로그 데이터를 재사용하므로 React 페이지와 정적 HTML의 내용이 따로 관리되지 않는다. 대신 글 수부터 줄였다. 서로 비슷했던 11개 글을 후보 축소, 팀 점심, 태그, 브라우저 난수, 상황별 선택이라는 5개 주제로 합쳤다. 각 글에는 메뉴 102개의 실제 분류와 `crypto.getRandomValues`, `localStorage`처럼 공개 코드에서 확인한 동작을 넣었다.

정산 칠판은 사용법과 계산 사례를 별도 정적 문서로 분리했다. `/examples/`에는 4인 여행 268,000원, 6인 회식 222,000원, 숙소 예약금과 잔금 300,000원을 직접 나눈 표를 넣었다. 받을 돈 합계와 보낼 돈 합계가 맞는지까지 적어서 단순한 기능 소개와 구분했다.

## 2026년 7월 22일에 다시 손본 부분

첫 보강에서는 정적 URL을 만드는 데 집중하다 보니 얇은 페이지 수도 같이 늘었다. 이번에는 반대로 합칠 수 있는 URL을 줄이고 남은 문서를 깊게 만드는 쪽으로 정리했다.

| 확인 항목 | 정리 전 | 정리 후 |
| --- | ---: | ---: |
| WTHeat sitemap URL | 17개 | 9개 |
| WTHeat 블로그 글 | 11개 | 5개 |
| 정산 칠판 sitemap URL | 8개 | 4개 |
| 정산 칠판 개별 예시 URL | 3개 | 통합 1개 |

앱 루트의 빈 HTML도 그대로 두지 않았다. WTHeat 루트에는 102개 메뉴의 카테고리별 개수와 후보를 줄이는 순서를 넣었고, 정산 칠판 루트에는 실제 캡처의 4명·8건·326,000원 사례를 넣었다. React가 실행되면 원래 앱으로 교체되지만, JavaScript가 실행되기 전 HTML만 읽어도 서비스가 무엇을 계산하는지 알 수 있다.

검증 기준은 단순하다. 빌드 후 `dist/guide/index.html`이나 `dist/blog/<slug>/index.html`을 열었을 때 본문 텍스트가 HTML에 직접 있어야 한다. canonical은 현재 경로와 맞아야 하고, 기존 주소는 한 번의 301로 대표 주소에 도착해야 한다. 이 기준을 통과하면 JavaScript가 실행되지 않아도 콘텐츠 페이지의 핵심 본문을 읽을 수 있다.
