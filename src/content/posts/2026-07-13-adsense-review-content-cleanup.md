---
title: "AdSense 재심사를 위해 5개 레포 광고 코드를 정리한 기록"
description: "zozindev.com과 네 개 서브 프로젝트에서 낮은 가치 콘텐츠로 보일 수 있는 광고 코드 배치를 줄이고, 콘텐츠 페이지 중심으로 정리한 구현 기록이다."
date: "2026-07-13"
updated: "2026-07-22"
category: "implementation"
priority: 0.8
includeAdsenseScript: false
indexable: false
---

AdSense 재심사 전에 가장 먼저 본 문제는 광고 코드가 너무 넓게 붙어 있다는 점이었다. 루트 도메인인 `zozindev.com`은 블로그와 프로젝트 설명이 있지만, 서브도메인에는 앱 화면이나 짧은 안내 페이지가 많았다. 이런 화면에 `pagead2` 로더가 붙어 있으면 “광고가 낮은 가치 콘텐츠에 노출되는 구조”로 보일 수 있다.

그래서 이번 정리는 콘텐츠를 무리하게 부풀리는 방식이 아니라, 광고 코드가 붙는 위치를 줄이는 방식으로 진행했다. 기준은 간단했다. 초기 HTML 기준으로 충분한 본문이 있는 페이지에만 광고 로더를 남기고, 앱 화면, 짧은 개인정보 페이지, 짧은 가이드, SPA 셸에는 광고 로더를 제거했다.

## zozindev.com

루트 Astro 사이트에는 이미 `BaseLayout.astro`에 `includeAdsenseScript` 옵션이 있었다. 이 옵션을 글 상세 페이지까지 전달하도록 `PostLayout.astro`와 `src/pages/blog/[slug].astro`를 수정했다. 자동 단어 수 기준은 쓰지 않고, 실제 화면과 계산 또는 코드 검증이 들어간 가이드 5편만 frontmatter에서 광고 로더를 명시적으로 켰다.

홈, About, 블로그 목록, 프로젝트 목록과 상세 페이지에는 광고 로더를 싣지 않는다. 글 길이만 길다고 켜지지 않으며, 현재 허용한 5편 외의 제작 기록에도 로더가 없다.

## WTHeat

WTHeat는 React SPA라 초기 HTML이 짧다. 이전에는 `index.html`에 AdSense 로더가 남아 있었고, sitemap에는 `/guide`, `/blog`, `/about`, 개별 글 URL이 들어 있었다. 앱 자체는 유용해도 심사 봇이 처음 보는 HTML은 짧은 셸에 가깝다.

그래서 `index.html`의 `pagead2` 로더와 블로그·가이드·소개 페이지의 `AdSlot` 렌더링을 제거했다. 앱 루트 초기 HTML에는 메뉴 102개의 카테고리별 개수와 후보를 줄이는 순서를 넣고, 비슷했던 블로그 11편은 5편으로 합쳤다.

## zozincanvas와 TEXT_TO_IMG

`zc.zozindev.com`과 `tti.zozindev.com`은 정적 도구 사이트다. 둘 다 앱 루트, 가이드, 개인정보 페이지에 AdSense 계정 메타와 광고 로더가 함께 들어 있었다. 하지만 루트 앱 화면은 도구 UI 중심이고, 개인정보 페이지는 지원 성격이 강하다.

두 사이트 모두 `index.html`, `guide.html`, `privacy.html`에서 `pagead2` 로더를 제거했다. 계정 확인용 `google-adsense-account` 메타는 유지했다. zozincanvas에는 실제 샘플 편집 캡처와 FileReader·Canvas 처리 방식을, TEXT_TO_IMG에는 300×300·2배율 WebP 제작 캡처와 `toBlob` 저장 방식을 추가했다. 두 개인정보 페이지는 `noindex, follow`로 바꾸고 sitemap에서는 뺐다.

## DutchPay

`dutchpay.zozindev.com`은 가장 위험도가 높았다. 루트 앱 HTML은 단어 수가 거의 없고, 기존 가이드와 개인정보 페이지도 짧았다. 먼저 `apps/web/index.html`, `guide.html`, `privacy.html`에서 광고 로더를 제거했다. 그 다음 `guide.html`과 `privacy.html` 본문을 늘리고, sitemap에 `lastmod`를 넣었다.

이후 추가 보강으로 `/guide/`, `/privacy/`, `/about/`, `/examples/` 정적 HTML 페이지를 만들었다. 처음 따로 만들었던 여행, 회식, 예약금 예시는 계산 단계가 짧고 겹쳐서 `/examples/` 한 페이지로 합쳤고 기존 주소는 301로 넘겼다. 앱 화면은 계산 UI로 유지하고, 설명과 예시는 정적 문서에서 제공하도록 나눴다.

## 검증한 기준

각 레포에서 빌드가 있는 경우 실제 빌드를 돌렸다. `zozindev.com`은 `npm.cmd run build`, WTHeat는 `npm.cmd run build`와 `npm.cmd run validate-foods`, DutchPay는 `npm.cmd run build:web`을 확인했다. 정적 사이트는 HTML에서 `pagead2|adsbygoogle` 문자열이 남아 있는지 확인했다.

2026년 7월 22일 로컬 빌드 기준으로 루트 사이트의 광고 로더는 가이드 5편에만 들어간다. `wtheat`, `zc`, `tti`, `dutchpay` 빌드 결과에는 계정 메타만 있고 광고 로더는 없다. 배포 뒤에는 각 도메인의 HTML 응답과 sitemap을 다시 확인해야 한다.

이 작업의 목적은 AdSense 승인을 보장하는 것이 아니다. 낮은 가치 콘텐츠로 판단될 수 있는 가장 직접적인 신호를 줄이는 것이다. 광고 코드는 본문형 콘텐츠 중심으로 제한하고, 도구형 화면은 먼저 사용자 기능과 설명을 분리하는 구조로 바꿨다.
