---
title: "HTML 수동 블로그를 Astro Markdown 구조로 바꾼 기록"
description: "zozindev.com 블로그를 HTML 파일 직접 관리 방식에서 Astro와 Markdown 기반 정적 생성 구조로 바꾼 작업 기록이다."
date: "2026-06-12"
updated: "2026-07-22"
category: "case-study"
priority: 0.7
---

zozindev.com 블로그는 처음에 글 하나마다 HTML 파일을 직접 만드는 방식이었다. 시작할 때는 이게 제일 빨랐다. `index.html`, `blog/index.html`, `blog/*.html`, `sitemap.xml`을 직접 만지면 별도 빌드 도구 없이 바로 배포할 수 있었기 때문이다.

근데 글이 몇 개만 쌓여도 이 방식은 바로 불편해진다. 글 하나 추가하려면 본문 HTML만 쓰는 게 아니라 목록, 최근 글, sitemap, canonical, OG meta까지 계속 신경 써야 한다. 같은 `<head>`를 복사하다가 제목이나 공유 설명을 빼먹는 일도 생겼다.

그래서 오늘은 HTML을 직접 관리하는 구조에서 Markdown 원본을 관리하고 Astro가 정적 HTML을 생성하는 구조로 바꿨다.

## 바꾼 구조

이제 글 원본은 `src/content/posts` 아래 Markdown 파일로 둔다.

```text
src/content/posts/
  2026-06-11-starting-static-blog.md
  2026-06-10-wtheat-random-menu-project.md
  2026-06-12-astro-markdown-blog-migration.md
```

글 파일에는 제목, 설명, 날짜, 카테고리 같은 metadata를 frontmatter로 적고, 본문은 Markdown으로 쓴다.

```md
---
title: "글 제목"
description: "글 설명"
date: "2026-06-12"
category: "Build Log"
priority: 0.7
---

본문을 Markdown으로 작성한다.
```

이제 새 글을 추가할 때는 HTML 파일을 복사해서 수정하지 않아도 된다. Markdown 파일 하나만 추가하면 블로그 목록과 개별 글 페이지가 빌드할 때 같이 만들어진다.

## 공통 레이아웃 정리

반복되던 `<head>` 설정은 `BaseLayout.astro`로 뺐다. title, description, canonical, OG meta와 공통 외부 스크립트가 한 곳에서 관리된다.

개별 글 화면은 `PostLayout.astro`가 담당한다. 글마다 공통으로 필요한 뒤로가기 링크, 제목, 날짜, 카테고리, 본문 영역을 여기서 처리한다.

이렇게 해두면 나중에 canonical 규칙이나 공통 meta를 바꿀 때 모든 글 HTML을 뒤질 필요가 없다. 한 파일만 고치면 된다.

## URL은 유지했다

기존 글 URL은 이미 sitemap에 들어갔고, 검색 엔진이나 공유 링크에 잡힐 수 있다. 처음에는 `.html` URL을 유지했지만, Cloudflare Pages의 URL 정규화와 충돌하지 않도록 최종적으로는 clean URL로 맞췄다.

```text
/blog/2026-06-11-starting-static-blog/
/projects/wtheat/
/privacy/
```

사이트 내부 링크와 sitemap도 이 최종 URL을 기준으로 맞춘다. 같은 글이 `.html`, 확장자 없는 주소, trailing slash 주소로 나뉘면 공유 링크와 방문 기록도 제각각이 된다.

## sitemap 자동 생성

예전에는 새 글을 쓸 때마다 `sitemap.xml`을 직접 수정해야 했다. 이제는 `src/pages/sitemap.xml.ts`에서 글 목록과 프로젝트 목록을 읽어 sitemap을 생성한다.

글의 `date`와 `priority`를 Markdown frontmatter에 넣어두면 sitemap에도 자동으로 반영된다. 수동 누락 가능성이 줄어드는 게 가장 큰 장점이다.

## Cloudflare Pages 배포 설정

이제 배포는 정적 파일을 루트에 그대로 올리는 방식이 아니라, Astro build 결과물인 `dist`를 배포하는 방식이다.

Cloudflare Pages 설정은 이렇게 맞추면 된다.

```text
Build command: npm run build
Build output directory: dist
```

Cloudflare Pages 자체는 계속 사용한다. 바뀐 건 배포 플랫폼이 아니라 소스 관리 방식이다. 글은 Markdown으로 관리하고, 배포 전에 Astro가 HTML로 만들어준다.

## 앞으로 글 쓰는 방식

이제 새 글을 쓰는 흐름은 단순하다.

1. `src/content/posts/yyyy-mm-dd-topic.md` 파일을 만든다.
2. frontmatter에 제목, 설명, 날짜, 카테고리를 적는다.
3. 본문을 Markdown으로 쓴다.
4. `npm run build`로 확인한다.
5. commit 후 push하면 Cloudflare Pages가 배포한다.

직접 수정하지 말아야 할 것도 명확해졌다. `dist`, `.astro`, `node_modules`는 생성물이므로 건드리지 않는다. 실제로 관리할 파일은 `src`, `public`, `package.json`, `astro.config.mjs` 쪽이다.

## 오늘 작업의 의미

이번 변경은 디자인을 크게 바꾼 작업은 아니다. 운영 방식을 바꾼 작업이다. HTML 파일을 계속 복붙해서 늘리는 방식에서, 글 원본과 생성 결과를 분리했다.

초기에는 수동 HTML이 빠르다. 하지만 블로그를 계속 쓸 생각이면 반복 작업을 줄여야 한다. 오늘 바꾼 구조는 그 기준선이다. 이제부터는 글을 하나 쓰는 비용이 훨씬 낮아졌다.
