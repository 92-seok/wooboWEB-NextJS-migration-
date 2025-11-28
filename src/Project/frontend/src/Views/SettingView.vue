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
                  { title: '50개', value: 50 },
                  { title: '100개', value: 100 },
                  { title: '500개', value: 200 },
                ]" label="조회 개수" variant="outlined" density="comfortable" hide-details>
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
              <div class="d-flex align-center py-2">
                <v-chip :color="getTypeColor(item.type)" size="small" variant="flat">
                  {{ getTypeLabel(item.type) }}
                </v-chip>
              </div>
            </template>

            <!-- 제어 시간 -->
            <template v-slot:[`item.dtmCreate`]="{ item }">
              <span class="text-body-2 text-grey-darken-1">{{ formatDate(item.dtmCreate) }}</span>
            </template>

            <!-- 제어 아이디 -->
            <template v-slot:[`item.Auth`]="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar size="32" color="info" class="mr-2">
                  <span class="text-white font-weight-bold text-caption">
                    {{ (item.Auth || 'U').charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <span class="font-weight-medium">{{ item.Auth || '알 수 없음' }}</span>
              </div>
            </template>

            <!-- 장비명 -->
            <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
              <span class="text-body-2">{{ item.NM_DIST_OBSV || '-' }}</span>
            </template>

            <template v-slot:[`item.status`]="{ item }">
              <div class="d-flex align-center py-2">
                <v-chip :color="getStatusColor(item.BStatus || item.GStatus)" size="small" variant="flat">
                  {{ item.BStatus || item.GStatus || '-' }}
                </v-chip>
              </div>
            </template>

          </v-data-table>
        </v-card>

        <!-- 제어 이력 카드 (모바일) -->
        <div class="d-md-none">
          <v-card v-for="(history, index) in filteredHistory" :key="index" class="user-mobile-card mb-4" elevation="2"
            rounded="lg">
            <v-card-text class="pa-4">
              <div class="d-flex align-start mb-4">
                <v-avatar :color="getTypeColor(history.type)" size="56" class="mr-4">
                  <span class="text-h6 text-white font-weight-bold">
                    {{ getTypeLabel(history.type).charAt(0) }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold">{{ getTypeLabel(history.type) }}</div>
                  <div class="text-body-2 text-grey">{{ history.Auth || '알 수 없음' }}</div>
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
                  <span class="text-body-2">{{ history.BStatus || history.GStatus || '-' }}</span>
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
        </div>
      </div>
    </v-container>

    <!-- 수정 다이얼로그 -->
    <v-dialog v-model="editDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 bg-grey-lighten-4">
          사용자 정보 수정
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <v-select v-model="editForm.role" :items="[
            { title: '사용자', value: 'user' },
            { title: '관리자', value: 'admin' },
            { title: '일반', value: 'operator' },
            { title: '게스트', value: 'guest' },
          ]" label="권한" variant="outlined" class="mb-4" hide-details>
          </v-select>
          <v-select v-model="editForm.isActive" :items="[{ title: '활성', value: true }, { title: '비활성', value: false }]"
            label="상태" variant="outlined" hide-details>
          </v-select>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false" :disabled="updating">
            취소
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="handleUpdate" :loading="updating">
            저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 비밀번호 변경 다이얼로그 -->
    <v-dialog v-model="passwordDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 bg-grey-lighten-4">
          비밀번호 변경
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <v-text-field v-model="passwordForm.newPassword" label="새 비밀번호" type="password" variant="outlined"
            :rules="[v => !!v || '비밀번호를 입력하세요']" placeholder="새 비밀번호를 입력하세요" hide-details>
          </v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="passwordDialog = false" :disabled="updating">
            취소
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="handlePasswordUpdate" :loading="updating">
            변경
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 bg-error-lighten-4">
          사용자 삭제
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
            <p class="text-body-1">정말로 이 사용자를 삭제하시겠습니까?</p>
            <p class="text-caption text-grey mt-2">이 작업은 되돌릴 수 없습니다.</p>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false" :disabled="updating">
            취소
          </v-btn>
          <v-btn color="error" variant="elevated" @click="handleDelete" :loading="updating">
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 스낵바 표출 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/admin.api';

const router = useRouter();

// 사용자 정보 sessionStorage에서 가져오기
const currentUser = ref(JSON.parse(sessionStorage.getItem('user') || '{}'));
const isAdmin = computed(() => currentUser.value.role === 'admin');

// 제어 이력 데이터
const controlHistory = ref([]);
const historyLoading = ref(false);
const historyTypeFilter = ref(null);
const historySearch = ref('');
const historyLimit = ref(50);

// 스낵바
const snackbar = ref({ show: false, message: '', color: 'success' });

// 제어 이력 테이블 헤어 부분
const historyHeaders = [
  { title: '장비 유형', key: 'type', sortable: false },
  { title: '제어 시간', key: 'dtmCreate', sortable: false },
  { title: '제어 아이디', key: 'Auth', sortable: false },
  { title: '장비명', key: 'NM_DIST_OBSV', sortable: false },
  { title: '상태', key: 'status', sortable: false },
];

const historyOptions = [
  { title: '전체', value: null },
  { title: '방송', value: 'broadcast' },
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

// 제어 이력 조회하기
const fetchControlHistory = async () => {
  historyLoading.value = true;

  try {
    const params = {
      limit: historyLimit.value,
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
    'broadcast': '방송',
    'display': '전광판',
    'gate': '차단기',
  };
  return colorMap[type] || type;
};

// 장비 유형 라벨
const getTypeLabel = (type) => {
  const labelMap = {
    'broadcast': '방송',
    'display': '전광판',
    'gate': '차단기',
  };
  return labelMap[type] || type;
};

// 제어 상태 색상
const getStatusColor = (status) => {
  if (!status) return 'grep';
  if (status === 'end' || status === 'success') return 'success';
  if (status === 'ing' || status === 'processing') return 'warning';
  if (status === 'start') return 'info';
  return 'grey';
};

// 사용자/장비 제어 이력 목록 조회하기
const fetchUsers = async () => {
  loading.value = true;

  try {
    const params = {
      page: page.value,
      limit: limit.value,
      search: search.value || undefined,
      role: roleFilter.value || undefined,
      isActive: statusFilter.value,
    };

    const response = await adminApi.getUsers(params);
    users.value = response.data.data;
    totalPages.value = response.data.meta.totalPages;
  } catch (error) {
    console.error('사용자 목록을 불러오는데 실패했습니다.', error);
    showSnackbar('사용자 목록을 불러오는데 실패했습니다.', 'error');
  } finally {
    loading.value = false;
  }
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
    fetchUsers();
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
