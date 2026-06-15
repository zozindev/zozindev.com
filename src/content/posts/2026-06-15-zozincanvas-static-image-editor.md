---
title: "zozincanvas 정적 이미지 편집기 제작 기록"
description: "zozincanvas를 브라우저 전용 정적 이미지 편집기로 만든 이유, 기능 범위, 배포 구조를 정리했다."
date: "2026-06-15"
category: "Project"
priority: 0.7
---

zozincanvas를 하나 더 완성했다. 주소는 [https://zc.zozindev.com/](https://zc.zozindev.com/)이고, 소스코드는 [https://github.com/zozindev/zozincanvas](https://github.com/zozindev/zozincanvas)에 올려뒀다.

이건 이미지 편집기다. 근데 거창한 포토샵 같은 걸 만들려는 건 아니고, 블로그나 문서에 올릴 이미지에서 필요한 부분만 빠르게 가리고 표시하는 용도다. 캡처 하나 올리기 전에 이름, 전화번호, 얼굴, 계정 정보 같은 거 지워야 할 때가 있다. 그럴 때 매번 무거운 앱 켜는 것도 귀찮고, 온라인 편집기에 민감한 이미지를 올리는 것도 찝찝하다.

그래서 방향을 단순하게 잡았다. 서버에 이미지를 올리지 않는다. 브라우저에서 파일을 읽고, Canvas 위에서 편집하고, 결과 이미지를 다운로드한다. 끝이다.

현재 들어간 기능은 이렇다. 이미지 업로드, 드래그 앤 드롭, 펜, 블러 브러시, 사각형, 둥근네모, 원, 선, 화살표, 스티커, 텍스트를 넣을 수 있다. 색상은 기본 color picker, 프리셋 스와치, 헥사코드 입력으로 고를 수 있고, 브라우저가 지원하면 EyeDropper API로 스포이드도 쓴다. 브라우저 스포이드가 안 되면 캔버스 픽셀 색상을 찍는 식으로 처리했다.

텍스트도 그냥 대충 넣은 게 아니라, 캔버스에서 박스를 드래그하면 그 위치에 입력창을 잠깐 띄우는 방식으로 만들었다. 기존 텍스트는 선택 도구에서 더블클릭하면 다시 고칠 수 있다. Bold, Italic, Underline, Strike, 글꼴, 수평 정렬, 수직 정렬도 넣었다. 텍스트 박스 크기에 맞춰 글자 크기를 줄이는 처리도 넣었다.

구조는 일부러 가볍게 했다. 빌드 도구 없다. 의존성도 없다.

```text
HTML
CSS
JavaScript
Canvas API
File API
PointerEvent
EyeDropper API
```

파일도 `index.html`, `guide.html`, `privacy.html`, `style.css`, `script.js` 정도로 끝난다. Cloudflare Pages에 정적 파일로 올리기 좋은 형태다. 앱 하나 만들자고 서버, DB, 로그인 같은 걸 붙이면 이 도구의 성격이 흐려진다고 봤다.

구현은 대충 세 덩어리로 나눴다.

```text
baseCanvas: 업로드 이미지 + 펜 + 블러
objects: 도형, 스티커, 텍스트
editorCanvas: baseCanvas와 objects를 합쳐서 보여주는 화면
```

펜이랑 블러는 브러시 도구라서 픽셀에 바로 반영한다. 반대로 도형, 스티커, 텍스트는 나중에 다시 선택해서 옮기거나 크기를 바꿀 수 있어야 하니까 객체로 들고 간다. 다운로드할 때는 현재 보이는 결과를 다시 합쳐서 `PNG`, `JPG`, `WEBP` 중 하나로 저장한다. `JPG`는 투명 배경이 검게 나오는 걸 막으려고 흰 배경을 합성해서 저장한다.

이 프로젝트에서 마음에 드는 점은 범위가 분명하다는 거다. 이미지 편집기라고 해서 모든 걸 하려는 게 아니다. 블로그 올리기 전 이미지 정리, 문서 캡처 가리기, 간단한 표시 넣기. 딱 이 정도를 빠르게 처리하는 도구다.

실제 앱은 아래에서 바로 쓸 수 있다.

- 서비스: [https://zc.zozindev.com/](https://zc.zozindev.com/)
- GitHub: [https://github.com/zozindev/zozincanvas](https://github.com/zozindev/zozincanvas)
- 프로젝트 설명: [/projects/zozincanvas/](/projects/zozincanvas/)

앞으로 추가한다면 단축키, 더 나은 모바일 조작감, 자주 쓰는 색상 저장 정도가 후보일 것 같다. 근데 일단 지금도 내가 블로그 이미지 만들 때 쓰는 용도로는 충분히 쓸만하다.
