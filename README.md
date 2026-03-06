# 우보 온라인 — 운영지원시스템 (Next.js)

> Vue 3 기반 운영지원 시스템을 Next.js App Router 구조로 마이그레이션한 개인 프로젝트입니다.

[![배포](https://img.shields.io/badge/배포-Vercel-black?logo=vercel)](https://woobo-web.vercel.app/)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

<br />

## 프로젝트 개요

재난 장비 운영 현장에서 사용하던 Vue 3 기반 관리자 시스템을 **Next.js App Router** 구조로 직접 마이그레이션했습니다.

단순한 프레임워크 교체가 아니라, 기존 시스템의 구조적 한계를 분석하고 **서버/클라이언트 컴포넌트 분리**, **파일 기반 라우팅** 등 Next.js의 핵심 개념을 직접 적용하며 React 생태계를 체득하는 것을 목표로 진행했습니다.

<br />

## 화면 미리보기

> 아래 이미지를 실제 스크린샷으로 교체해주세요.
> GitHub에 `/public/screenshots/` 폴더 만들고 이미지 업로드 후 경로 수정하면 됩니다.

| 스크린샷 | `./frontend-next/public/screenshots/login.png` | `./frontend-next/public/screenshots/dashboard.png` |

| 점검 이력 | 장비 상태 |
|-----------|----------|
| ![점검이력](./frontend-next/public/screenshots/history.png) | ![장비상태](./frontend-next/public/screenshots/status.png) |

<br />

## 🔧 기술 스택

| 구분 | 기술 |
|------|------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 18, JavaScript ES6+ |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **HTTP** | fetch / Axios |
| **인증** | JWT |
| **배포** | Vercel |

<br />

## 프로젝트 구조

```
woobo-web/
├── frontend-next/
│   ├── public/
│   │   └── screenshots/       # README용 스크린샷
│   ├── src/
│   │   ├── app/               # Next.js App Router 페이지
│   │   ├── components/        # 공통 UI 컴포넌트
│   │   ├── data/              # 정적 데이터 / 상수
│   │   ├── hooks/             # 커스텀 React Hooks
│   │   └── lib/               # API 연동 / 유틸 함수
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
└── vercel.json
```

<br />

## 주요 기능

- **JWT 인증** — 로그인 및 토큰 기반 인증 처리
- **장비 상태 대시보드** — 실시간 장비 상태 조회 및 시각화
- **점검 이력 관리** — 장비 점검 이력 CRUD
- **반응형 UI** — 관리자 환경에 최적화된 레이아웃

<br />

## 마이그레이션 주요 작업

기존 Vue 3 시스템과의 주요 변경점입니다.

| 항목 | Vue 3 (이전) | Next.js (이후) |
|------|-------------|----------------|
| 라우팅 | Vue Router | App Router (파일 기반) |
| 상태관리 | Composition API (ref, reactive) | React Hooks (useState, useEffect) |
| 컴포넌트 | SFC (.vue) | React 함수형 컴포넌트 (.jsx) |
| 스타일 | Scoped CSS | CSS Modules |
| 배포 | 자체 서버 | Vercel |

<br />

## 로컬 실행 방법

```bash
# 저장소 클론
git clone https://github.com/92-seok/wooboWEB-NextJS-migration-.git
cd frontend-next

# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 API URL 등 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

<br />

## 관련 링크

- 배포 주소: [https://woobo-web.vercel.app](https://woobo-web.vercel.app)
- Vue 3 원본 시스템: [http://woobo.online](http://woobo.online)
- 포트폴리오: [GitHub](https://github.com/92-seok)
