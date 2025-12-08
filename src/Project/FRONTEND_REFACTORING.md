# Frontend 리팩토링 계획

## 프로젝트 개요
Woobo Web Frontend 구조 개선 및 코드 품질 향상

---

## 현재 파일 트리 구조

```
frontend/src/
├── Views/                    # 페이지 컴포넌트 (14개)
│   ├── AboutView.vue
│   ├── AdminView.vue
│   ├── ControlView.vue
│   ├── HomeView.vue
│   ├── KakaoCallback.vue
│   ├── LoginView.vue
│   ├── MapView.vue
│   ├── MapView2.vue
│   ├── SettingView.vue
│   ├── SignupView.vue
│   ├── TestView.vue
│   ├── WeatherSIView.vue
│   └── WeatherSRView.vue
│
├── api/                      # API 레이어 (3개)
│   ├── admin.api.js
│   ├── auth.api.js          ✅ 신규
│   └── weathersi.api.js     ✅ 신규
│
├── assets/                   # 정적 리소스
│   └── display_test.png
│
├── components/              ✅ component → components 변경 완료
│   ├── KakaoMap.js
│   └── KakaoMap.vue
│
├── composables/             ✅ 신규 생성
│   ├── useAuth.js           ✅ 로그인/인증 로직
│   ├── useDeviceControl.js  ✅ 디바이스 제어 로직
│   ├── useNotification.js   ✅ 알림 로직
│   ├── usePermission.js     ✅ 권한 관리 로직
│   └── useTimer.js          ✅ 타이머 로직
│
├── config/                  ✅ 신규 생성
│   ├── axios.config.js      ✅ axios → config 이동 완료
│   └── constants.js         ✅ 상수 정의
│
├── layouts/                  # 레이아웃 컴포넌트
│   ├── Footer.vue
│   ├── Header.vue
│   └── Main.vue
│
├── router/                   # 라우팅
│   └── index.js
│
├── styles/                   # 스타일
│
├── utils/                   ✅ 신규 생성
│   ├── format.js            ✅ 포맷팅 유틸
│   ├── helpers.js           ✅ 헬퍼 함수
│   └── validators.js        ✅ 유효성 검사
│
├── App.vue
└── main.js
```

---

## 리팩토링 체크리스트

### ✅ 1단계: 기본 구조 개선 (완료)

- [x] composables 폴더 생성
  - [x] useAuth.js - 인증 관련 로직 분리
  - [x] useNotification.js - 알림 로직 분리
  - [x] usePermission.js - 권한 관리 로직 분리
  - [x] useDeviceControl.js - 디바이스 제어 로직 분리
  - [x] useTimer.js - 타이머 로직 분리

- [x] api 폴더 구조화
  - [x] auth.api.js - 인증 API 분리
  - [x] weathersi.api.js - 날씨 관련 API 분리
  - [x] admin.api.js (기존)

- [x] utils 폴더 생성
  - [x] format.js - 날짜, 좌표, 숫자 포맷팅
  - [x] helpers.js - 공통 헬퍼 함수
  - [x] validators.js - 유효성 검사 함수

- [x] config 폴더 생성
  - [x] axios.config.js 이동 (axios → config)
  - [x] constants.js 생성

- [x] 디렉토리명 통일
  - [x] component → components

---

### 🔄 2단계: View 파일 리팩토링 (진행중)

#### 2.1 디렉토리명 표준화
- [ ] Views → views (소문자 통일)

#### 2.2 View 파일별 composables 적용

**LoginView.vue**
- [ ] useAuth 적용 확인 및 최적화
- [ ] 중복 로직 제거
- [ ] 에러 처리 개선

**WeatherSIView.vue & WeatherSRView.vue**
- [ ] 공통 로직 composable로 추출 (useWeather.js)
- [ ] API 호출 로직 정리
- [ ] 상태 관리 개선

**ControlView.vue**
- [ ] useDeviceControl 적용 확인
- [ ] 제어 로직 최적화

**AdminView.vue**
- [ ] usePermission 적용
- [ ] 관리자 전용 로직 분리

**MapView.vue & MapView2.vue**
- [ ] 중복 코드 확인 및 통합 검토
- [ ] 지도 관련 로직 composable로 분리 (useMap.js)

**기타 View 파일**
- [ ] AboutView.vue - 필요시 리팩토링
- [ ] HomeView.vue - 필요시 리팩토링
- [ ] SettingView.vue - 설정 로직 분리
- [ ] SignupView.vue - 회원가입 로직 분리
- [ ] TestView.vue - 용도 확인 및 정리
- [ ] KakaoCallback.vue - 카카오 로그인 콜백 최적화

---

### 📋 3단계: 추가 개선사항

#### 3.1 API 레이어 완성
- [ ] map.api.js - 지도 관련 API 분리
- [ ] device.api.js - 디바이스 관련 API 분리
- [ ] user.api.js - 사용자 관련 API 분리
- [ ] API 응답 타입 정의
- [ ] 에러 핸들링 표준화

#### 3.2 Composables 추가
- [ ] useWeather.js - 날씨 데이터 관리
- [ ] useMap.js - 지도 기능
- [ ] useForm.js - 폼 상태 관리
- [ ] useModal.js - 모달 상태 관리
- [ ] useWebSocket.js - 웹소켓 연결 (필요시)

#### 3.3 공통 컴포넌트 추가
- [ ] components/common/Button.vue
- [ ] components/common/Input.vue
- [ ] components/common/Modal.vue
- [ ] components/common/Loading.vue
- [ ] components/common/ErrorBoundary.vue
- [ ] components/weather/ - 날씨 관련 컴포넌트
- [ ] components/device/ - 디바이스 관련 컴포넌트

#### 3.4 상태 관리
- [ ] Pinia store 도입 검토
  - [ ] stores/auth.js - 인증 상태
  - [ ] stores/device.js - 디바이스 상태
  - [ ] stores/weather.js - 날씨 데이터
  - [ ] stores/ui.js - UI 상태

#### 3.5 Utils 확장
- [ ] api/interceptor.js - axios 인터셉터
- [ ] utils/storage.js - localStorage/sessionStorage 래퍼
- [ ] utils/date.js - 날짜 관련 유틸
- [ ] utils/logger.js - 로깅 유틸

#### 3.6 타입 정의 (선택)
- [ ] types/api.d.ts - API 응답 타입
- [ ] types/models.d.ts - 도메인 모델 타입
- [ ] JSDoc 주석 추가

---

### 🧪 4단계: 코드 품질 개선

#### 4.1 코드 정리
- [ ] console.log 제거 또는 logger로 대체
- [ ] 사용하지 않는 import 제거
- [ ] 주석 정리 및 문서화
- [ ] 매직 넘버/문자열 상수화

#### 4.2 성능 최적화
- [ ] 불필요한 re-rendering 방지
- [ ] computed 속성 활용
- [ ] lazy loading 적용
- [ ] 이미지 최적화

#### 4.3 접근성 개선
- [ ] semantic HTML 적용
- [ ] ARIA 속성 추가
- [ ] 키보드 네비게이션 지원

---

### 🔧 5단계: 개발 환경 개선

- [ ] ESLint 설정 강화
- [ ] Prettier 설정
- [ ] Git hooks (husky) 설정
- [ ] 컴포넌트 스토리북 (선택)
- [ ] 단위 테스트 추가 (선택)

---

## 목표 파일 트리 구조

```
frontend/src/
├── views/                    # ← Views에서 변경
│   ├── auth/
│   │   ├── LoginView.vue
│   │   ├── SignupView.vue
│   │   └── KakaoCallback.vue
│   ├── weather/
│   │   ├── WeatherSIView.vue
│   │   └── WeatherSRView.vue
│   ├── map/
│   │   ├── MapView.vue
│   │   └── MapView2.vue
│   ├── admin/
│   │   └── AdminView.vue
│   ├── HomeView.vue
│   ├── AboutView.vue
│   ├── ControlView.vue
│   ├── SettingView.vue
│   └── TestView.vue
│
├── components/
│   ├── common/               # 공통 컴포넌트
│   ├── weather/              # 날씨 관련 컴포넌트
│   ├── device/               # 디바이스 관련 컴포넌트
│   ├── map/                  # 지도 관련 컴포넌트
│   └── KakaoMap.vue
│
├── composables/
│   ├── auth/
│   │   ├── useAuth.js
│   │   └── usePermission.js
│   ├── device/
│   │   └── useDeviceControl.js
│   ├── weather/
│   │   └── useWeather.js
│   ├── ui/
│   │   ├── useModal.js
│   │   ├── useNotification.js
│   │   └── useForm.js
│   ├── useTimer.js
│   └── useMap.js
│
├── api/
│   ├── auth.api.js
│   ├── weathersi.api.js
│   ├── admin.api.js
│   ├── device.api.js
│   ├── map.api.js
│   └── user.api.js
│
├── stores/                   # Pinia stores (선택)
│   ├── auth.js
│   ├── device.js
│   ├── weather.js
│   └── ui.js
│
├── utils/
│   ├── format.js
│   ├── helpers.js
│   ├── validators.js
│   ├── storage.js
│   ├── logger.js
│   └── date.js
│
├── config/
│   ├── axios.config.js
│   ├── constants.js
│   └── env.js
│
├── types/                    # TypeScript/JSDoc (선택)
│   ├── api.d.ts
│   └── models.d.ts
│
├── layouts/
├── router/
├── styles/
├── assets/
├── App.vue
└── main.js
```

---

## 우선순위

### 🔴 High Priority (현재 진행)
1. View 파일들에 composables 적용
2. Views → views 디렉토리명 변경
3. API 파일 분리 완성
4. 공통 컴포넌트 추가

### 🟡 Medium Priority
1. Pinia store 도입
2. Utils 확장
3. 코드 품질 개선

### 🟢 Low Priority
1. TypeScript 마이그레이션
2. 테스트 코드 작성
3. Storybook 구성

---

## 다음 작업 항목

### 즉시 시작 가능한 작업
1. **LoginView.vue 리팩토링**
   - useAuth composable 적용 상태 확인
   - 중복 로직 제거

2. **WeatherSIView.vue & WeatherSRView.vue**
   - useWeather.js composable 생성
   - 공통 로직 추출

3. **ControlView.vue**
   - useDeviceControl 적용 확인
   - 디바이스 제어 로직 최적화

4. **공통 컴포넌트 생성**
   - Button, Input, Modal, Loading 컴포넌트

---

## 참고사항

- Vue 3 Composition API 사용
- Vue Router 활용
- Axios 기반 HTTP 클라이언트
- Vuetify UI 프레임워크
- dayjs 날짜 라이브러리

---

**최종 업데이트**: 2025-12-08
**작성자**: Frontend Team
