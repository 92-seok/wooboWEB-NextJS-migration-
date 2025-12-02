<template>
  <div class="admin-page">
    <!-- 권한 없음 화면 띄우기 -->
    <div v-if="!isAdmin" class="unauthorized-container">
      <v-card class="unauthorized-card" elevation="8" rounded="lg">
        <v-card-text class="text-center py-12">
          <div class="mb-6">
            <v-icon size="80" color="error">mdi-shield-lock</v-icon>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h2>
          <p class="text-gray-600 mb-6">이 페이지는 <strong>관리자</strong>만 접근할 수 있습니다.</p>
          <v-btn color="primary" @click="goToHome" size="large">홈으로 돌아가기</v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- 관리자 화면 페이지 -->
    <v-container v-else fluid class="admin-container">
      <div class="content-wrapper">
        <!-- 장비 제어 헤더 부분 -->
        <v-card class="header-card mb-6" elevation="2" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between">
              <div class="mb-4 mb-sm-0">
                <h1 class="text-h4 font-weight-bold text-grey-darken-3">제어 이력</h1>
                <p class="text-subtitle-2 text-grey mt-1">장비 제어 이력 조회</p>
              </div>
              <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchControlHistory" :loading="historyLoading"
                size="large">
                새로고침
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 제어 이력 검색/필터 부분 -->
        <v-card class="filter-card mb-6" elevation="2" rounded="lg">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="4">
                <v-select v-model="historyTypeFilter" :items="historyTypeOptions" label="장비 유형" variant="outlined"
                  density="comfortable" clearable @update:model-value="fetchControlHistory" hide-details>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="historySearch" label="사용자 검색" prepend-icon="mdi-magnify" variant="outlined"
                  density="comfortable" clearable hide-details>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="historyLimit" :items="[
                  { title: '10개', value: 10 },
                  { title: '20개', value: 20 },
                  { title: '30개', value: 30 },
                  { title: '50개', value: 50 },
                ]" label="조회 개수" variant="outlined" density="comfortable" hide-details
                  @update:model-value="handleLimitChange">
                </v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 제어 이력 테이블 테이블 (데스크탑) -->
        <v-card class="table-card d-none d-md-block" elevation="2" rounded="lg">
          <v-data-table :headers="historyHeaders" :items="filteredHistory" :loading="historyLoading"
            :items-per-page="historyLimit" hide-default-footer class="elevation-0">

            <!-- 장비 유형 -->
            <template v-slot:[`item.type`]="{ item }">
              <div class="d-flex align-center justify-center py-2">
                <v-img v-if="getTypeImage(item.type)" :src="getTypeImage(item.type)" height="35" contain></v-img>
                <!-- <v-icon :color="getTypeColor(item.type)" size="large" variant="flat" class="mr-1">
                  {{ getTypeIcon(item.type) }}
                </v-icon> -->
              </div>
              <span class="font-weight-medium ml-2">{{ getTypeLabel(item.type) }}</span>
            </template>

            <!-- 장비명 -->
            <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
              <span class="text-body-2 font-weight-medium">{{ item.NM_DIST_OBSV || '-' }}</span>
            </template>

            <!-- 제어 시간 -->
            <template v-slot:[`item.dtmCreate`]="{ item }">
              <span class="text-body-2 text-grey-darken-1">{{ formatDate(item.dtmCreate) }}</span>
            </template>

            <!-- 제어 아이디 -->
            <!-- <template v-slot:[`item.Auth`]="{ item }">
              <div class="d-flex align-center justify-center py-2">
                <span class="font-weight-medium">{{ item.Auth || '알 수 없음' }}</span>
              </div>
            </template> -->

            <!-- 제어 사용자 -->
            <template v-slot:[`item.userName`]="{ item }">
              <div class="d-flex align-center justify-center py-2">
                <span class="font-weight-medium">{{ item.userName || '알 수 없음' }}</span>
              </div>
            </template>


            <template v-slot:[`item.status`]="{ item }">
              <div class="d-flex align-center justify-center py-2">
                <v-chip :color="getStatusColor(item.BStatus || item.GStatus)" size="small" variant="flat">
                  {{ item.BStatus || item.GStatus || '-' }}
                </v-chip>
              </div>
            </template>

          </v-data-table>

          <!-- 페이지 네이션 -->
          <v-divider></v-divider>
          <v-card-actions class="justify-center py-4">
            <!-- 이전 그룹으로 -->
            <v-btn v-if="paginationRange.hasPrev" icon="mdi-chevron-double-left" variant="text" size="small"
              @click="goToPage(paginationRange.prevGroup)"></v-btn>

            <!-- 이전페이지 -->
            <v-btn :disabled="historyPage === 1" icon="mdi-chevron-left" variant="text" size="small"
              @click="goToPage(historyPage - 1)"></v-btn>

            <!-- 페이지 번호 -->
            <v-btn v-for="page in paginationRange.pages" :key="page" :variant="historyPage === page ? 'flat' : 'text'"
              :color="historyPage === page ? 'primary' : ''" size="small" @click="goToPage(page)" class="mx-1">{{ page
              }}</v-btn>

            <!-- 이전페이지 -->
            <v-btn :disabled="historyPage === historyTotalPages" icon="mdi-chevron-right" variant="text" size="small"
              @click="goToPage(historyPage + 1)"></v-btn>

            <!-- 이전 그룹으로 -->
            <v-btn v-if="paginationRange.hasNext" icon="mdi-chevron-double-right" variant="text" size="small"
              @click="goToPage(paginationRange.nextGroup)"></v-btn>
          </v-card-actions>
        </v-card>

        <!-- 제어 이력 카드 (모바일) -->
        <div class="d-md-none">
          <v-card v-for="(history, index) in paginatedHistory" :key="index" class="user-mobile-card mb-4" elevation="2"
            rounded="lg">
            <v-card-text class="pa-4">
              <div class="d-flex align-start mb-4">
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold">{{ getTypeLabel(history.type) }}</div>
                  <div class="text-body-2 text-grey">{{ history.Auth || '알 수 없음' }}</div>\
                </div>
              </div>

              <v-divider class="mb-4"></v-divider>

              <div class="user-info-grid">
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-grey-darken-1">제어 시간</span>
                  <span class="text-body-2">{{ formatDate(history.dtmCreate) }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-grey-darken-1">장비명</span>
                  <span class="text-body-2">{{ history.NM_DIST_OBSV || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-grey-darken-1">상태</span>
                  <span class="text-body-2">{{ (history.BStatus || history.GStatus || '-') }}</span>
                </div>
              </div>

              <!-- 데이터 없음 표시 -->
              <v-card v-if="!historyLoading && filteredHistory.length === 0" class="text-center pa-8" elevation="1"
                rounded="lg">
                <v-icon size="64" color="grey-light-1">mdi-history</v-icon>
                <p class="text-body-1 text-grey mt-4">제어 이력이 없습니다.</p>
              </v-card>
            </v-card-text>
          </v-card>
          <div class="d-md-none d-flex justify-center mt-4">
            <!-- 이전 그룹으로 -->
            <v-btn v-if="mobilePageRange.hasPrev" icon="mdi-chevron-double-left" variant="text" size="small"
              @click="goToMobilePage(mobilePageRange.prevGroup)"></v-btn>

            <!-- 이전페이지 -->
            <v-btn :disabled="mobilePage === 1" icon="mdi-chevron-left" variant="text" size="small"
              @click="goToMobilePage(mobilePage - 1)"></v-btn>

            <!-- 페이지 번호 -->
            <v-btn v-for="page in mobilePageRange.pages" :key="page" :variant="mobilePage === page ? 'flat' : 'text'"
              :color="mobilePage === page ? 'primary' : ''" size="small" @click="goToMobilePage(page)" class="mx-1">{{
                page
              }}</v-btn>

            <!-- 이전페이지 -->
            <v-btn :disabled="mobilePage === mobileTotalPages" icon="mdi-chevron-right" variant="text" size="small"
              @click="goToMobilePage(mobilePage + 1)"></v-btn>

            <!-- 이전 그룹으로 -->
            <v-btn v-if="mobilePageRange.hasNext" icon="mdi-chevron-double-right" variant="text" size="small"
              @click="goToMobilePage(mobilePageRange.nextGroup)"></v-btn>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/admin.api';

// 장비 이미지
import broadImg from '@/assets/broad.png'
import displayImg from '@/assets/display.png'
import gateImg from '@/assets/gate.png'

const router = useRouter();

// 사용자 정보 sessionStorage에서 가져오기
const currentUser = ref(JSON.parse(sessionStorage.getItem('user') || '{}'));
const isAdmin = computed(() => currentUser.value.role === 'admin');

// 제어 이력 데이터
const controlHistory = ref([]);
const historyLoading = ref(false);
const historyTypeFilter = ref(null);
const historySearch = ref('');
const historyLimit = ref(10);

// 데스크탑 페이지 네이션 함수
const historyPage = ref(1);
const historyTotalPages = ref(1);

// 모바일 페이지 네이션 함수
const mobileItemsPerPage = ref(5);
const mobilePage = ref(1);

// 스낵바
const snackbar = ref({ show: false, message: '', color: 'success' });

// 제어 이력 테이블 헤어 부분
const historyHeaders = [
  { title: '장비 유형', key: 'type', sortable: false, align: 'center' },
  { title: '장비명', key: 'NM_DIST_OBSV', sortable: false, align: 'center' },
  // { title: '제어 아이디', key: 'Auth', sortable: false, align: 'center' },
  { title: '장비 사용자', key: 'userName', sortable: false, align: 'center' },
  { title: '제어 시간', key: 'dtmCreate', sortable: false, align: 'center' },
  { title: '상태', key: 'status', sortable: false, align: 'center' },
];

const historyTypeOptions = [
  { title: '전체', value: null },
  { title: '예경보', value: 'broadcast' },
  { title: '전광판', value: 'display' },
  { title: '차단기', value: 'gate' },
]

// 제어 이력 필터링
const filteredHistory = computed(() => {
  if (!historySearch.value) {
    return controlHistory.value;
  }
  return controlHistory.value.filter(item =>
    item.Auth?.toLowerCase().includes(historySearch.value.toLowerCase())
  );
});

// 모바일용 페이지네이션 데이터
const paginatedHistory = computed(() => {
  const start = (mobilePage.value - 1) * mobileItemsPerPage.value;
  const end = start + mobileItemsPerPage.value;
  return filteredHistory.value.slice(start, end);
})

// 모바일 총 페이지 수
const mobileTotalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / mobileItemsPerPage.value);
})

// 데스크탑 페이지 네이션
const paginationRange = computed(() => {
  const total = historyTotalPages.value;
  const current = historyPage.value;

  // 5개씩 묶음으로 (1-5, 6-10, 11-15...)
  const groupSize = 5;
  const currentGroup = Math.ceil(current / groupSize);
  const startPage = (currentGroup - 1) * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, total);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return {
    pages,
    hasPrev: startPage > 1,
    hasNext: endPage < total,
    prevGroup: startPage - 1,
    nextGroup: endPage + 1,
  };
});

// 모바일 페이지 네이션
const mobilePageRange = computed(() => {
  const total = mobileTotalPages.value;
  const current = mobilePage.value;

  const groupSize = 5;
  const currentGroup = Math.ceil(current / groupSize);
  const startPage = (currentGroup - 1) * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, total);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return {
    pages,
    hasPrev: startPage > 1,
    hasNext: endPage < total,
    prevGroup: startPage - 1,
    nextGroup: endPage + 1,
  };
});

// 페이지 이동 함수
const goToPage = (page) => {
  historyPage.value = page;
  fetchControlHistory();
}

const goToMobilePage = (page) => {
  mobilePage.value = page;
  fetchControlHistory();

  window.scrollTo({
    top: 0,
    begavior: 'smooth'
  });
}


// 장비 제어 이력 페이징 핸들러
const handleLimitChange = () => {
  historyPage.value = 1;
  fetchControlHistory();
}

// 제어 이력 조회하기
const fetchControlHistory = async () => {
  historyLoading.value = true;

  try {
    const params = {
      limit: historyLimit.value,
      page: historyPage.value,
    };

    let response;
    if (historyTypeFilter.value === 'broadcast') {
      response = await adminApi.getBroadcastHistory(params);
    } else if (historyTypeFilter.value === 'display') {
      response = await adminApi.getDisplayHistory(params);
    } else if (historyTypeFilter.value === 'gate') {
      response = await adminApi.getGateHistory(params);
    } else {
      response = await adminApi.getAllControlHistory(params);
    }

    // console.log('API 응답: ', response);
    // console.log('response.data: ', response.data);
    // console.log('response.data.data: ', response.data.data);

    controlHistory.value = response.data.data || [];
    historyTotalPages.value = response.data.meta?.totalPages || 1;
    // console.log('controleHistory 설정: ', controlHistory.value);
  } catch (error) {
    console.error('제어 이력 조회 실패: ', error);
    // console.error('에러 상세: ', error.response);
  } finally {
    historyLoading.value = false;
  }
};

// 장비 유형 색상
const getTypeColor = (type) => {
  const colorMap = {
    'broadcast': '#EC407A',
    'display': '#00E5FF',
    'gate': '#FDD835',
  };
  return colorMap[type] || type;
};

// 장비 유형 라벨
const getTypeLabel = (type) => {
  const labelMap = {
    'broadcast': '예경보',
    'display': '전광판',
    'gate': '차단기',
  };
  return labelMap[type] || type;
};

// 장비 유형 아이콘
const getTypeImage = (type) => {
  const imageMap = {
    broadcast: broadImg,
    display: displayImg,
    gate: gateImg,
  };
  return imageMap[type] || null;
}

// 제어 상태 색상
const getStatusColor = (status) => {
  if (!status) return 'grey';
  if (status === 'end' || status === 'success' || status === '제어 성공') return 'success';
  if (status === 'ing' || status === 'processing' || status === '제어 중') return 'warning';
  if (status === 'start' || status === '제어 시작') return 'info';
  return 'grey';
};

const getStatusLabel = (status) => {
  const labelMap = {
    'start': '제어 시작',
    'ing': '제어 중',
    'processing': '장비 진행 중',
    'end': '제어 성공',
  };
  return labelMap[status] || status;
};

// 스낵바 표시하기
const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color };
};

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('ko-KR');
}

// 홈으로 보내기
const goToHome = () => {
  router.push('/');
};

// 초기 로드 시도
onMounted(() => {
  if (isAdmin.value) {
    fetchControlHistory();
  }
});
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.unauthorized-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
}

.unauthorized-card {
  max-width: 480px;
  width: 100%;
}

.admin-container {
  padding-top: 24px;
  padding-bottom: 48px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-card {
  background: white;
}

.table-card {
  background: white;
}

.user-mobile-card {
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}

.user-info-grid {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

/* 반응형 조정 */
@media (max-width: 600px) {
  .admin-container {
    padding-top: 16px;
    padding-bottom: 32px;
  }

  .content-wrapper {
    padding: 0 8px;
  }
}
</style>
