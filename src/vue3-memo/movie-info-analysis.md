# Movie-info Vue.js 프로젝트 분석 및 Vue.js 핵심 문법 가이드

## 📋 프로젝트 개요

**movie-info**는 Vue.js 3을 기반으로 한 영화 정보 표시 웹 애플리케이션입니다. 영화 리스트 조회, 검색, 상세 정보 모달, 좋아요 기능 등을 제공합니다.

## 🛠 기술 스택 및 의존성

### 주요 기술 스택
- **Vue.js**: 3.2.13 (Composition API 및 Options API 혼용)
- **Node.js**: Vue CLI 5.0.0 기반
- **개발 환경**: Babel, ESLint 설정

### 의존성 분석
```json
{
  "dependencies": {
    "core-js": "^3.8.3",     // JavaScript 폴리필
    "vue": "^3.2.13"         // Vue.js 프레임워크
  },
  "devDependencies": {
    "@babel/core": "^7.12.16",
    "@vue/cli-service": "~5.0.0",
    "eslint": "^7.32.0",
    "eslint-plugin-vue": "^8.0.3"
  }
}
```

## 📁 프로젝트 구조

```
movie-info/
├── public/
│   ├── assets/           # 정적 이미지 파일들
│   │   ├── image1.png    # 노량 포스터
│   │   ├── image2.png    # 범죄도시3 포스터
│   │   ├── image3.png    # 아바타 물의 길 포스터
│   │   └── image4.png    # 탑건 포스터
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/       # Vue 컴포넌트들
│   │   ├── Event.vue     # 이벤트 배너 컴포넌트
│   │   ├── Modal.vue     # 모달 컴포넌트
│   │   ├── Movies.vue    # 영화 리스트 컴포넌트
│   │   ├── Navbar.vue    # 내비게이션 바
│   │   └── SearchBar.vue # 검색 컴포넌트
│   ├── assets/
│   │   ├── logo.png
│   │   └── movies.js     # 영화 데이터
│   ├── App.vue          # 메인 애플리케이션 컴포넌트
│   └── main.js          # 애플리케이션 진입점
├── babel.config.js
├── jsconfig.json
├── package.json
├── vue.config.js
└── README.md
```

---

# 🎯 Vue.js 핵심 문법 가이드

## 1. 📝 템플릿 문법 (Template Syntax)

### 1.1 텍스트 인터폴레이션 (Text Interpolation)
```vue
<template>
  <!-- 기본 문법 -->
  <h1>{{ message }}</h1>
  
  <!-- 표현식 사용 -->
  <p>{{ number + 1 }}</p>
  <p>{{ ok ? 'YES' : 'NO' }}</p>
  <p>{{ message.split('').reverse().join('') }}</p>
  
  <!-- HTML 출력 (v-html) -->
  <div v-html="rawHtml"></div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue!',
      number: 10,
      ok: true,
      rawHtml: '<span style="color: red">빨간 텍스트</span>'
    }
  }
}
</script>
```

### 1.2 속성 바인딩 (Attribute Binding)
```vue
<template>
  <!-- v-bind 또는 : 사용 -->
  <div v-bind:id="dynamicId">기본 바인딩</div>
  <div :id="dynamicId">축약형</div>
  
  <!-- 클래스 바인딩 -->
  <div :class="{ active: isActive, 'text-danger': hasError }">클래스 객체</div>
  <div :class="[activeClass, errorClass]">클래스 배열</div>
  <div :class="classObject">계산된 클래스</div>
  
  <!-- 스타일 바인딩 -->
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }">스타일 객체</div>
  <div :style="[baseStyles, overridingStyles]">스타일 배열</div>
  
  <!-- 여러 속성 한번에 바인딩 -->
  <div v-bind="objectOfAttrs">여러 속성</div>
</template>

<script>
export default {
  data() {
    return {
      dynamicId: 'my-id',
      isActive: true,
      hasError: false,
      activeClass: 'active',
      errorClass: 'text-danger',
      activeColor: 'red',
      fontSize: 14,
      objectOfAttrs: {
        id: 'container',
        class: 'wrapper'
      }
    }
  },
  computed: {
    classObject() {
      return {
        active: this.isActive && !this.hasError,
        'text-danger': this.hasError
      }
    }
  }
}
</script>
```

## 2. 🎪 이벤트 처리 (Event Handling)

### 2.1 기본 이벤트 처리
```vue
<template>
  <!-- 메서드 호출 -->
  <button @click="greet">인사하기</button>
  <button v-on:click="greet">v-on 문법</button>
  
  <!-- 인라인 핸들러 -->
  <button @click="count++">{{ count }}</button>
  
  <!-- 메서드에 매개변수 전달 -->
  <button @click="say('hello')">Hello</button>
  <button @click="say('bye')">Bye</button>
  
  <!-- 이벤트 객체 접근 -->
  <button @click="warn('Form cannot be submitted yet.', $event)">Submit</button>
  
  <!-- 다양한 이벤트 -->
  <input @keyup.enter="submit" @blur="onBlur" placeholder="Enter를 누르세요">
  <form @submit.prevent="onSubmit">
    <input type="submit" value="제출">
  </form>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      name: 'Vue.js'
    }
  },
  methods: {
    greet(event) {
      alert('Hello ' + this.name + '!')
      if (event) {
        alert(event.target.tagName)
      }
    },
    say(message) {
      alert(message)
    },
    warn(message, event) {
      if (event) {
        event.preventDefault()
      }
      alert(message)
    },
    submit() {
      console.log('제출됨!')
    },
    onBlur() {
      console.log('포커스 잃음')
    },
    onSubmit() {
      console.log('폼 제출')
    }
  }
}
</script>
```

### 2.2 이벤트 수식어 (Event Modifiers)
```vue
<template>
  <!-- 이벤트 수식어 -->
  <form @submit.prevent="onSubmit">기본 동작 방지</form>
  <div @click.stop="doThis">이벤트 전파 중단</div>
  <div @click.capture="doThis">캡처 모드</div>
  <div @click.self="doThat">자기 자신일 때만</div>
  <div @click.once="doThis">한 번만 실행</div>
  <div @scroll.passive="onScroll">패시브 리스너</div>
  
  <!-- 키 수식어 -->
  <input @keyup.enter="submit">
  <input @keyup.page-down="onPageDown">
  <input @keyup.tab="tabAction">
  <input @keyup.delete="deleteAction">
  <input @keyup.esc="escAction">
  <input @keyup.space="spaceAction">
  <input @keyup.up="upAction">
  <input @keyup.down="downAction">
  <input @keyup.left="leftAction">
  <input @keyup.right="rightAction">
  
  <!-- 시스템 수식어 -->
  <input @keyup.ctrl="ctrlAction">
  <input @keyup.alt="altAction">
  <input @keyup.shift="shiftAction">
  <input @keyup.meta="metaAction">
  
  <!-- 마우스 버튼 수식어 -->
  <button @click.left="leftClick">왼쪽 클릭</button>
  <button @click.right="rightClick">오른쪽 클릭</button>
  <button @click.middle="middleClick">가운데 클릭</button>
</template>
```

## 3. 📊 조건부 렌더링 (Conditional Rendering)

### 3.1 v-if, v-else-if, v-else
```vue
<template>
  <!-- 기본 조건부 렌더링 -->
  <h1 v-if="awesome">Vue는 멋져요!</h1>
  <h1 v-else>오, 안돼요 😢</h1>
  
  <!-- 여러 조건 -->
  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else-if="type === 'C'">C</div>
  <div v-else>A/B/C 아님</div>
  
  <!-- template 그룹핑 -->
  <template v-if="ok">
    <h1>제목</h1>
    <p>단락 1</p>
    <p>단락 2</p>
  </template>
  
  <!-- v-show (CSS display 제어) -->
  <h1 v-show="ok">Hello!</h1>
</template>

<script>
export default {
  data() {
    return {
      awesome: true,
      ok: true,
      type: 'A'
    }
  }
}
</script>
```

### 3.2 v-if vs v-show 차이점
```vue
<template>
  <!-- v-if: 조건이 false면 DOM에서 완전히 제거 -->
  <div v-if="showDiv">v-if로 제어되는 div</div>
  
  <!-- v-show: 조건이 false면 display: none으로 숨김 -->
  <div v-show="showDiv">v-show로 제어되는 div</div>
</template>

<script>
export default {
  data() {
    return {
      showDiv: true
    }
  },
  // v-if: 토글 비용이 높음, 초기 렌더링 비용 낮음
  // v-show: 토글 비용이 낮음, 초기 렌더링 비용 높음
  // 자주 토글되면 v-show, 런타임 중 조건이 바뀌지 않으면 v-if 권장
}
</script>
```

## 4. 📋 리스트 렌더링 (List Rendering)

### 4.1 v-for 기본 사용법
```vue
<template>
  <!-- 배열 순회 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.message }}
    </li>
  </ul>
  
  <!-- 인덱스 포함 -->
  <ul>
    <li v-for="(item, index) in items" :key="index">
      {{ index }} - {{ item.message }}
    </li>
  </ul>
  
  <!-- 객체 순회 -->
  <ul>
    <li v-for="value in object" :key="value">
      {{ value }}
    </li>
  </ul>
  
  <!-- 객체의 키와 값 -->
  <ul>
    <li v-for="(value, name) in object" :key="name">
      {{ name }}: {{ value }}
    </li>
  </ul>
  
  <!-- 객체의 키, 값, 인덱스 -->
  <ul>
    <li v-for="(value, name, index) in object" :key="index">
      {{ index }}. {{ name }}: {{ value }}
    </li>
  </ul>
  
  <!-- 숫자 순회 -->
  <span v-for="n in 10" :key="n">{{ n }}</span>
  
  <!-- template 사용 -->
  <template v-for="item in items" :key="item.id">
    <li>{{ item.msg }}</li>
    <li class="divider" role="presentation"></li>
  </template>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, message: 'Foo' },
        { id: 2, message: 'Bar' }
      ],
      object: {
        title: 'How to do lists in Vue',
        author: 'Jane Doe',
        publishedAt: '2016-04-10'
      }
    }
  }
}
</script>
```

### 4.2 배열 변경 감지
```vue
<template>
  <div>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.text }}</li>
    </ul>
    <button @click="addItem">항목 추가</button>
    <button @click="removeItem">항목 제거</button>
    <button @click="updateItem">항목 수정</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, text: '첫 번째' },
        { id: 2, text: '두 번째' }
      ]
    }
  },
  methods: {
    addItem() {
      // 반응적 메서드들
      this.items.push({ id: Date.now(), text: '새 항목' })
      // this.items.pop()
      // this.items.shift()
      // this.items.unshift({ id: Date.now(), text: '맨 앞 항목' })
      // this.items.splice(1, 1)
      // this.items.sort()
      // this.items.reverse()
    },
    removeItem() {
      this.items.pop()
    },
    updateItem() {
      // 배열 항목 직접 수정 (Vue 3에서는 반응적)
      if (this.items.length > 0) {
        this.items[0].text = '수정된 텍스트'
      }
    }
  }
}
</script>
```

## 5. 📡 양방향 데이터 바인딩 (Two-way Data Binding)

### 5.1 v-model 기본 사용법
```vue
<template>
  <div>
    <!-- 텍스트 입력 -->
    <input v-model="message" placeholder="메시지를 입력하세요">
    <p>메시지: {{ message }}</p>
    
    <!-- 여러 줄 텍스트 -->
    <textarea v-model="text" placeholder="여러 줄 입력"></textarea>
    <p style="white-space: pre-line;">{{ text }}</p>
    
    <!-- 체크박스 (단일) -->
    <input type="checkbox" id="checkbox" v-model="checked">
    <label for="checkbox">{{ checked }}</label>
    
    <!-- 체크박스 (다중) -->
    <div>
      <input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
      <label for="jack">Jack</label>
      <input type="checkbox" id="john" value="John" v-model="checkedNames">
      <label for="john">John</label>
      <input type="checkbox" id="mike" value="Mike" v-model="checkedNames">
      <label for="mike">Mike</label>
      <span>체크된 이름들: {{ checkedNames }}</span>
    </div>
    
    <!-- 라디오 버튼 -->
    <div>
      <input type="radio" id="one" value="One" v-model="picked">
      <label for="one">One</label>
      <input type="radio" id="two" value="Two" v-model="picked">
      <label for="two">Two</label>
      <span>선택됨: {{ picked }}</span>
    </div>
    
    <!-- 셀렉트 (단일) -->
    <select v-model="selected">
      <option disabled value="">선택하세요</option>
      <option>A</option>
      <option>B</option>
      <option>C</option>
    </select>
    <span>선택됨: {{ selected }}</span>
    
    <!-- 셀렉트 (다중) -->
    <select v-model="multiSelected" multiple style="width: 50px;">
      <option>A</option>
      <option>B</option>
      <option>C</option>
    </select>
    <span>선택됨: {{ multiSelected }}</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '',
      text: '',
      checked: false,
      checkedNames: [],
      picked: '',
      selected: '',
      multiSelected: []
    }
  }
}
</script>
```

### 5.2 v-model 수식어
```vue
<template>
  <div>
    <!-- lazy: change 이벤트 후에 동기화 -->
    <input v-model.lazy="msg">
    
    <!-- number: 자동으로 숫자로 변환 -->
    <input v-model.number="age" type="number">
    
    <!-- trim: 자동으로 앞뒤 공백 제거 -->
    <input v-model.trim="text">
    
    <!-- 여러 수식어 조합 -->
    <input v-model.lazy.trim="lazyTrimText">
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: '',
      age: 0,
      text: '',
      lazyTrimText: ''
    }
  }
}
</script>
```

## 6. 🧩 컴포넌트 (Components)

### 6.1 컴포넌트 기본 구조
```vue
<!-- ParentComponent.vue -->
<template>
  <div>
    <h1>부모 컴포넌트</h1>
    <ChildComponent 
      :title="title"
      :count="count"
      @increment="handleIncrement"
      @update-title="handleUpdateTitle"
    />
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  name: 'ParentComponent',
  components: {
    ChildComponent
  },
  data() {
    return {
      title: '제목',
      count: 0
    }
  },
  methods: {
    handleIncrement(value) {
      this.count += value
    },
    handleUpdateTitle(newTitle) {
      this.title = newTitle
    }
  }
}
</script>
```

```vue
<!-- ChildComponent.vue -->
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>카운트: {{ count }}</p>
    <button @click="increment">증가</button>
    <button @click="updateTitle">제목 변경</button>
  </div>
</template>

<script>
export default {
  name: 'ChildComponent',
  props: {
    title: {
      type: String,
      required: true,
      default: '기본 제목'
    },
    count: {
      type: Number,
      default: 0,
      validator: function (value) {
        return value >= 0
      }
    }
  },
  emits: ['increment', 'update-title'],
  methods: {
    increment() {
      this.$emit('increment', 1)
    },
    updateTitle() {
      this.$emit('update-title', '새로운 제목')
    }
  }
}
</script>
```

### 6.2 슬롯 (Slots)
```vue
<!-- BaseLayout.vue -->
<template>
  <div class="container">
    <header>
      <slot name="header">기본 헤더</slot>
    </header>
    <main>
      <slot>기본 내용</slot>
    </main>
    <footer>
      <slot name="footer">기본 푸터</slot>
    </footer>
  </div>
</template>
```

```vue
<!-- 슬롯 사용하는 부모 컴포넌트 -->
<template>
  <BaseLayout>
    <template v-slot:header>
      <h1>여기에 페이지 제목이 위치합니다</h1>
    </template>
    
    <template v-slot:default>
      <p>메인 콘텐츠의 단락입니다.</p>
      <p>또 다른 단락입니다.</p>
    </template>
    
    <template v-slot:footer>
      <p>여기에 연락처 정보가 있습니다.</p>
    </template>
  </BaseLayout>
</template>
```

### 6.3 동적 컴포넌트
```vue
<template>
  <div>
    <button 
      v-for="tab in tabs" 
      :key="tab"
      @click="currentTab = tab"
      :class="{ active: currentTab === tab }"
    >
      {{ tab }}
    </button>
    
    <!-- 동적 컴포넌트 -->
    <component :is="currentTabComponent" class="tab"></component>
    
    <!-- keep-alive로 상태 유지 -->
    <keep-alive>
      <component :is="currentTabComponent"></component>
    </keep-alive>
  </div>
</template>

<script>
import TabHome from './TabHome.vue'
import TabPosts from './TabPosts.vue'
import TabArchive from './TabArchive.vue'

export default {
  components: {
    TabHome,
    TabPosts,
    TabArchive
  },
  data() {
    return {
      currentTab: 'Home',
      tabs: ['Home', 'Posts', 'Archive']
    }
  },
  computed: {
    currentTabComponent() {
      return 'Tab' + this.currentTab
    }
  }
}
</script>
```

## 7. 🔄 라이프사이클 훅 (Lifecycle Hooks)

### 7.1 Options API 라이프사이클
```vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="updateMessage">메시지 업데이트</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '초기 메시지'
    }
  },
  
  // 인스턴스 생성 후
  beforeCreate() {
    console.log('beforeCreate: 인스턴스 생성 전')
    console.log('data:', this.message) // undefined
  },
  
  // 데이터 초기화 후
  created() {
    console.log('created: 인스턴스 생성 완료')
    console.log('data:', this.message) // '초기 메시지'
    // API 호출하기 좋은 시점
  },
  
  // DOM 마운트 전
  beforeMount() {
    console.log('beforeMount: DOM 마운트 전')
  },
  
  // DOM 마운트 후
  mounted() {
    console.log('mounted: DOM 마운트 완료')
    // DOM 접근 가능
    // 타이머, 이벤트 리스너 설정하기 좋은 시점
  },
  
  // 데이터 변경 시 (DOM 업데이트 전)
  beforeUpdate() {
    console.log('beforeUpdate: 업데이트 전')
  },
  
  // 데이터 변경 시 (DOM 업데이트 후)
  updated() {
    console.log('updated: 업데이트 완료')
  },
  
  // 컴포넌트 제거 전
  beforeUnmount() {
    console.log('beforeUnmount: 컴포넌트 제거 전')
    // 정리 작업 수행
  },
  
  // 컴포넌트 제거 후
  unmounted() {
    console.log('unmounted: 컴포넌트 제거 완료')
    // 타이머, 이벤트 리스너 정리
  },
  
  methods: {
    updateMessage() {
      this.message = '업데이트된 메시지'
    }
  }
}
</script>
```

## 8. ⚡ 계산된 속성과 감시자 (Computed & Watchers)

### 8.1 계산된 속성 (Computed Properties)
```vue
<template>
  <div>
    <p>원본 메시지: "{{ message }}"</p>
    <p>뒤집힌 메시지: "{{ reversedMessage }}"</p>
    <p>전체 이름: {{ fullName }}</p>
    
    <input v-model="firstName" placeholder="이름">
    <input v-model="lastName" placeholder="성">
    
    <p>현재 시간: {{ now }}</p>
    <button @click="updateTime">시간 업데이트</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello',
      firstName: 'Foo',
      lastName: 'Bar',
      currentTime: new Date()
    }
  },
  computed: {
    // 기본 computed
    reversedMessage() {
      return this.message.split('').reverse().join('')
    },
    
    // getter와 setter가 있는 computed
    fullName: {
      get() {
        return this.firstName + ' ' + this.lastName
      },
      set(newValue) {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    },
    
    // 메서드와 달리 캐싱됨
    now() {
      return this.currentTime.toLocaleTimeString()
    }
  },
  methods: {
    // 메서드는 호출할 때마다 실행됨
    getNow() {
      return new Date().toLocaleTimeString()
    },
    updateTime() {
      this.currentTime = new Date()
    }
  }
}
</script>
```

### 8.2 감시자 (Watchers)
```vue
<template>
  <div>
    <input v-model="question" placeholder="yes/no 질문을 입력하세요">
    <p>{{ answer }}</p>
    
    <input v-model="searchText" placeholder="검색어 입력">
    <p>검색 결과: {{ searchResults }}</p>
    
    <button @click="deepObject.a++">깊은 객체 변경</button>
    <p>객체 값: {{ deepObject.a }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: '',
      answer: '질문은 물음표로 끝나야 합니다.',
      searchText: '',
      searchResults: [],
      deepObject: {
        a: 1,
        b: {
          c: 2
        }
      }
    }
  },
  watch: {
    // 기본 watcher
    question(newQuestion, oldQuestion) {
      if (newQuestion.includes('?')) {
        this.getAnswer()
      }
    },
    
    // 즉시 실행 watcher
    searchText: {
      handler(newVal) {
        this.debouncedSearch(newVal)
      },
      immediate: true
    },
    
    // 깊은 감시 (deep watching)
    deepObject: {
      handler(newVal, oldVal) {
        console.log('깊은 객체 변경됨')
      },
      deep: true
    },
    
    // 특정 속성만 감시
    'deepObject.a'(newVal, oldVal) {
      console.log(`a가 ${oldVal}에서 ${newVal}로 변경됨`)
    }
  },
  methods: {
    getAnswer() {
      this.answer = '생각 중...'
      setTimeout(() => {
        this.answer = Math.random() > 0.5 ? '예' : '아니오'
      }, 1000)
    },
    
    debouncedSearch(query) {
      // 디바운싱 로직
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        // 실제 검색 로직
        this.searchResults = [`${query} 결과 1`, `${query} 결과 2`]
      }, 300)
    }
  }
}
</script>
```

---

# 🎯 Movie-info 프로젝트의 핵심 기능 분석

## 1. 📱 주요 컴포넌트 구조

### App.vue (메인 컴포넌트)
**역할**: 애플리케이션의 중앙 상태 관리 및 컴포넌트 조합

**주요 기능**:
  - 영화 데이터 관리 (`data`와 `data_temp` 분리)
  - 모달 상태 관리 (`isModal`, `selectedMovie`)
  - 이벤트 텍스트 자동 순환 (3초 간격)
  - 검색 및 필터링 로직

**핵심 메서드**:
```javascript
// 좋아요 증가 (find 메서드 활용)
increseLike(id) {
  this.data.find(movie => {
    if(movie.id == id) {
      movie.like += 1;
    }
  })
},

// 영화 검색 (filter + includes 활용)
searchMovie(title) {
  this.data_temp = this.data.filter(movie => {
    return movie.title.includes(title);
  })
}
```

### Movies.vue (영화 리스트 컴포넌트)
**역할**: 영화 목록을 카드 형태로 표시

**주요 특징**:
  - `v-for`를 사용한 동적 렌더링
  - `$emit`을 통한 부모 컴포넌트와의 통신
  - 동적 이미지 경로 바인딩 (`:src`)

**Props 구성**:
```javascript
props: {
  data: Array,           // 영화 데이터 배열
  isModal: Boolean,      // 모달 상태
  selectedMovie: Number, // 선택된 영화 ID
  increseLike: Function  // 좋아요 함수
}
```

### SearchBar.vue (검색 컴포넌트)
**역할**: 영화 제목 검색 기능 제공

**핵심 기능**:
  - 실시간 검색어 감지 (`@change` 이벤트)
  - `watch` 속성을 통한 검색 결과 유효성 검사
  - 검색어 초기화 및 부모 컴포넌트로 이벤트 전달

**Watch 활용**:
```javascript
watch: {
  inputText(name) {
    const findName = this.data.filter(movie => {
      return movie.title.includes(name);
    })
    if(findName.length === 0) {
      alert("검색하신 영화가 없습니다.");
    }
  }
}
```

## 2. 📊 데이터 구조 (movies.js)

```javascript
const data = [
  {
    id: 0,                           // 고유 식별자
    title: "노량",                   // 영화 제목
    year: 2023,                     // 개봉년도
    category: "액션, 드라마",        // 장르
    textRed: "color: red;",         // 스타일 속성
    like: 0,                        // 좋아요 수
    imgUrl: '/assets/image1.png'    // 이미지 경로
  }
  // ... 추가 영화 데이터
]
```

## 3. 🎨 CSS 설계 원칙

### 글로벌 스타일 (App.vue)
```css
* {
  box-sizing: border-box;  /* 박스 모델 통일 */
  margin: 0;              /* 기본 마진 제거 */
}

body {
  max-width: 768px;       /* 반응형 최대 너비 */
  margin: 0 auto;         /* 중앙 정렬 */
  padding: 20px;          /* 내부 여백 */
}
```

### 카드 레이아웃 (.item)
```css
.item {
  display: flex;                    /* Flexbox 레이아웃 */
  margin-bottom: 2rem;             /* 카드 간 간격 */
  border: 1px solid #ccc;          /* 테두리 */
  padding: 1rem;                   /* 내부 여백 */
  border-radius: 8px;              /* 둥근 모서리 */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* 그림자 */
}
```

## 4. ⚡ 라이프사이클 및 성능 최적화

### Mounted/Unmounted 활용
```javascript
mounted() {
  // 컴포넌트 마운트 시 setInterval 시작
  this.interval = setInterval(() => {
    if(this.eventTextNum == this.text.length - 1) {
      this.eventTextNum = 0;
    } else {
      this.eventTextNum += 1;
    }
  }, 3000)
},

unmounted() {
  // 컴포넌트 언마운트 시 메모리 누수 방지
  clearInterval(this.interval);
}
```

### 데이터 복사를 통한 원본 보호
```javascript
data() {
  return {
    data: data,           // 원본 데이터
    data_temp: [...data]  // 필터링용 사본 (spread operator 활용)
  }
}
```

## 🚨 주요 개선 포인트

### 1. 문법 오류
```vue
<!-- 잘못된 문법 (Movies.vue) -->
<button @:click="$emit('increseLike', movie.id)">좋아요</button>

<!-- 올바른 문법 -->
<button @click="$emit('increseLike', movie.id)">좋아요</button>
```

### 2. 메서드명 오타
```javascript
// 현재 (오타)
increseLike(id) { ... }

// 권장
increaseLike(id) { ... }
```

### 3. 접근성 개선 필요
- 이미지 alt 속성 개선
- 키보드 네비게이션 지원
- ARIA 속성 추가

## 📋 개발 워크플로우

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (핫 리로드)
npm run serve

# 프로덕션 빌드
npm run build

# 린팅
npm run lint
```

### 브라우저 지원
```json
"browserslist": [
  "> 1%",           // 1% 이상 사용되는 브라우저
  "last 2 versions", // 최신 2버전
  "not dead",        // 지원 중단되지 않은 브라우저
  "not ie 11"        // IE 11 제외
]
```

## 💡 학습 포인트

이 프로젝트는 Vue.js 초급자에게 다음과 같은 핵심 개념들을 학습할 수 있는 좋은 예제입니다:

1. **컴포넌트 기반 아키텍처**: 기능별로 분리된 재사용 가능한 컴포넌트
2. **상태 관리**: 부모-자식 컴포넌트 간 데이터 흐름
3. **이벤트 시스템**: $emit을 통한 컴포넌트 간 통신
4. **라이프사이클**: mounted/unmounted를 활용한 리소스 관리
5. **반응형 데이터**: Vue의 반응성 시스템 활용
6. **조건부/리스트 렌더링**: v-if, v-for 디렉티브 활용

전체적으로 Vue.js의 기본기를 잘 다루고 있으며, 실제 프로젝트에서 자주 사용되는 패턴들을 포함하고 있어 학습용으로 매우 적합한 코드베이스입니다.

---

## 📚 추가 학습 자료

### Vue.js 공식 문서
- [Vue.js 3 공식 가이드](https://vuejs.org/guide/)
- [Vue.js API 레퍼런스](https://vuejs.org/api/)

### 권장 학습 순서
1. **기본 문법**: 템플릿 문법, 디렉티브, 이벤트 처리
2. **컴포넌트**: Props, Events, Slots
3. **상태 관리**: Data, Computed, Watchers
4. **라이프사이클**: 컴포넌트 생명주기 이해
5. **고급 개념**: Composition API, Pinia, Vue Router

### 실습 추천 과제
1. 영화 정렬 기능 추가 (제목, 연도, 좋아요 순)
2. 페이지네이션 구현
3. 로컬 스토리지를 활용한 좋아요 정보 저장
4. 영화 추가/삭제 기능 구현
5. Vue Router를 활용한 상세 페이지 구현
