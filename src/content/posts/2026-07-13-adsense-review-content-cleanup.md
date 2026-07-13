---
title: "AdSense 재심사를 위해 5개 레포 광고 코드를 정리한 기록"
description: "zozindev.com과 네 개 서브 프로젝트에서 낮은 가치 콘텐츠로 보일 수 있는 광고 코드 배치를 줄이고, 콘텐츠 페이지 중심으로 정리한 구현 기록이다."
date: "2026-07-13"
category: "implementation"
priority: 0.8
---

AdSense 재심사 전에 가장 먼저 본 문제는 광고 코드가 너무 넓게 붙어 있다는 점이었다. 루트 도메인인 `zozindev.com`은 블로그와 프로젝트 설명이 있지만, 서브도메인에는 앱 화면이나 짧은 안내 페이지가 많았다. 이런 화면에 `pagead2` 로더가 붙어 있으면 “광고가 낮은 가치 콘텐츠에 노출되는 구조”로 보일 수 있다.

그래서 이번 정리는 콘텐츠를 무리하게 부풀리는 방식이 아니라, 광고 코드가 붙는 위치를 줄이는 방식으로 진행했다. 기준은 간단했다. 초기 HTML 기준으로 충분한 본문이 있는 페이지에만 광고 로더를 남기고, 앱 화면, 짧은 개인정보 페이지, 짧은 가이드, SPA 셸에는 광고 로더를 제거했다.

## zozindev.com

루트 Astro 사이트에는 이미 `BaseLayout.astro`에 `includeAdsenseScript` 옵션이 있었다. 이 옵션을 글 상세 페이지까지 전달하도록 `PostLayout.astro`와 `src/pages/blog/[slug].astro`를 수정했다. 글 본문 단어 수가 600단어 이상일 때만 AdSense 스크립트를 포함하도록 했다.

홈과 About 페이지도 광고 로더를 끄도록 명시했다. 홈은 허브 역할이고 About은 소개 페이지라서 광고가 붙어야 할 만큼 긴 본문 페이지로 보지 않았다. 반대로 `/blog/`, `/projects/`, 프로젝트 상세, 600단어 이상 긴 글에는 광고 로더를 유지했다.

## WTHeat

WTHeat는 React SPA라 초기 HTML이 짧다. 이전에는 `index.html`에 AdSense 로더가 남아 있었고, sitemap에는 `/guide`, `/blog`, `/about`, 개별 글 URL이 들어 있었다. 앱 자체는 유용해도 심사 봇이 처음 보는 HTML은 짧은 셸에 가깝다.

그래서 `index.html`의 `pagead2` 로더를 제거했다. 내부 `AdSlot` 컴포넌트도 광고 설정이 꺼진 상태에서는 아무것도 렌더링하지 않게 되어 있었다. 기존 콘텐츠 확장 변경은 유지하되, 광고 로더는 승인 전까지 싣지 않는 방향으로 정리했다.

## zozincanvas와 TEXT_TO_IMG

`zc.zozindev.com`과 `tti.zozindev.com`은 정적 도구 사이트다. 둘 다 앱 루트, 가이드, 개인정보 페이지에 AdSense 계정 메타와 광고 로더가 함께 들어 있었다. 하지만 루트 앱 화면은 도구 UI 중심이고, 개인정보 페이지는 지원 성격이 강하다.

두 사이트 모두 `index.html`, `guide.html`, `privacy.html`에서 `pagead2` 로더를 제거했다. 계정 확인용 `google-adsense-account` 메타는 유지했다. 추가로 가이드 페이지에는 실제 사용 기준을 더 넣었다. zozincanvas는 캡처 공유 전 확인 순서, 블러 강도, 강조 도구 사용 기준, 파일 형식 선택 기준을 보강했다. TEXT_TO_IMG는 블로그 썸네일, 공지 이미지, 투명 배경과 JPG 차이, 개인정보를 이미지로 만들지 않는 기준을 추가했다.

## DutchPay

`dutchpay.zozindev.com`은 가장 위험도가 높았다. 루트 앱 HTML은 단어 수가 거의 없고, 기존 가이드와 개인정보 페이지도 짧았다. 먼저 `apps/web/index.html`, `guide.html`, `privacy.html`에서 광고 로더를 제거했다. 그 다음 `guide.html`과 `privacy.html` 본문을 늘리고, sitemap에 `lastmod`를 넣었다.

이후 추가 보강으로 `/guide/`, `/privacy/`, `/about/`, `/examples/`, `/examples/travel/`, `/examples/company-dinner/`, `/examples/reservation/` 같은 정적 HTML 페이지도 만들었다. 앱 화면은 계산 UI로 유지하고, 설명과 예시는 정적 문서에서 제공하도록 나눴다.

## 검증한 기준

각 레포에서 빌드가 있는 경우 실제 빌드를 돌렸다. `zozindev.com`은 `npm.cmd run build`, WTHeat는 `npm.cmd run build`와 `npm.cmd run validate-foods`, DutchPay는 `npm.cmd run build:web`을 확인했다. 정적 사이트는 HTML에서 `pagead2|adsbygoogle` 문자열이 남아 있는지 확인했다.

라이브에서도 다시 확인했다. `zozindev.com/blog/`와 `/projects/`에는 광고 로더가 남고, 루트 홈과 privacy에는 없다. `wtheat`, `zc`, `tti`, `dutchpay` 루트에는 계정 메타만 있고 광고 로더는 없다. 즉, 승인 전에는 광고 코드가 얇은 앱 셸이나 지원 페이지에 붙지 않도록 줄인 상태다.

이 작업의 목적은 AdSense 승인을 보장하는 것이 아니다. 낮은 가치 콘텐츠로 판단될 수 있는 가장 직접적인 신호를 줄이는 것이다. 광고 코드는 본문형 콘텐츠 중심으로 제한하고, 도구형 화면은 먼저 사용자 기능과 설명을 분리하는 구조로 바꿨다.
