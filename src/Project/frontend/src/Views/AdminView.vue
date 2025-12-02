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
        <!-- 헤더 부분 -->
        <v-card class="header-card mb-6" elevation="2" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between">
              <div class="mb-4 mb-sm-0">
                <h1 class="text-h4 font-weight-bold text-grey-darken-3">관리자 페이지</h1>
                <p class="text-subtitle-2 text-grey mt-1">사용자 관리 및 설정</p>
              </div>
              <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchUsers" :loading="loading" size="large">
                새로고침
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 검색/필터 부분 -->
        <v-card class="filter-card mb-6" elevation="2" rounded="lg">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="search" label="사용자 검색" prepend-inner-icon="mdi-magnify" variant="outlined"
                  density="comfortable" clearable @update:model-value="handlerSearch" hide-details>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="roleFilter" :items="roleOptions" label="권한 필터" variant="outlined"
                  density="comfortable" clearable @update:model-value="handlerFilter" hide-details>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="statusFilter" :items="statusOptions" label="로그인 제어 필터" variant="outlined"
                  density="comfortable" clearable @update:model-value="handlerFilter" hide-details>
                </v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 사용자 테이블 (데스크탑) -->
        <v-card class="table-card d-none d-md-block" elevation="2" rounded="lg">
          <v-data-table :headers="headers" :items="users" :loading="loading" :items-per-page="limit" hide-default-footer
            class="elevation-0">
            <!-- 아이디(username) -->
            <template v-slot:[`item.username`]="{ item }">
              <div class="d-flex align-center justify-center py-2">
                <div>
                  <div class="font-weight-medium ">{{ item.name }}</div>
                  <div class="text-caption text-grey">{{ item.username }}</div>
                </div>
              </div>
            </template>

            <!-- 권한(role) -->
            <template v-slot:[`item.role`]="{ item }">
              <!-- <v-chip
                :color="item.role === 'admin' ? 'error' : item.role === 'user' ? 'primary' : item.role === 'operator' ? 'green' : 'grey'"
                size="small" variant="flat">
                {{ getRoleLabel(item.role) }}
              </v-chip> -->
              <span class="font-weight-medium">{{ getRoleLabel(item.role) }}</span>
            </template>

            <!-- 상태(status) -->
            <template v-slot:[`item.isActive`]="{ item }">
              <v-chip :color="item.isActive ? 'success' : 'error'" size="small" variant="flat">
                {{ item.isActive ? '사용가능' : '사용불가' }}
              </v-chip>
            </template>

            <!-- 마지막로그인(lastLoginAt) -->
            <template v-slot:[`item.lastLoginAt`]="{ item }">
              <span class="text-body-2 text-grey-darken-1">{{ formatDate(item.lastLoginAt) }}</span>
            </template>

            <!-- 액션(actions) -->
            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex justify-center">
                <v-tooltip text="수정" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-pencil" size="large" variant="text" color="primary" @click="openEditDialog(item)"
                      v-bind="props"></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="비밀번호 변경" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-key" size="large" variant="text" color="warning" @click="openPasswordDialog(item)"
                      v-bind="props"></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="삭제" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-delete" size="large" variant="text" color="error" @click="openDeleteDialog(item)"
                      v-bind="props"></v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table>

          <!-- 페이지네이션 -->
          <v-divider></v-divider>
          <v-card-actions class="justify-center pa-4">
            <v-pagination v-model="page" :length="totalPages" :total-visible="5" @update:model-value="fetchUsers"
              rounded="circle" density="comfortable"></v-pagination>
          </v-card-actions>
        </v-card>

        <!-- 사용자 카드 (모바일) -->
        <div class="d-md-none">
          <v-card v-for="user in users" :key="user.id" class="user-mobile-card mb-4" elevation="2" rounded="lg">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-center mb-4">
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold">{{ user.name }}</div>
                  <div class="text-body-2 text-grey">{{ user.username }}</div>
                </div>
              </div>

              <v-divider class="mb-4"></v-divider>

              <div class="user-info-grid">
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-grey-darken-1">권한</span>
                  <v-chip :color="getRoleColor(user.role)" size="small" variant="flat">
                    {{ getRoleLabel(user.role) }}
                  </v-chip>
                </div>

                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-grey-darken-1">로그인 제어</span>
                  <v-chip :color="user.isActive ? 'success' : 'error'" size="small" variant="flat">
                    {{ user.isActive ? '사용가능' : '사용불가' }}
                  </v-chip>
                </div>

                <div class="d-flex justify-space-between align-center mb-4">
                  <span class="text-body-2 text-grey-darken-1">마지막 로그인</span>
                  <span class="text-body-2">{{ formatDate(user.lastLoginAt) }}</span>
                </div>
              </div>

              <v-divider class="mb-4"></v-divider>

              <v-row dense>
                <v-col cols="4">
                  <v-btn color="primary" variant="tonal" size="small" @click="openEditDialog(user)" block>
                    수정
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-btn color="warning" variant="tonal" size="small" @click="openPasswordDialog(user)" block>
                    비밀번호
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-btn color="error" variant="tonal" size="small" @click="openDeleteDialog(user)" block>
                    삭제
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 모바일 페이지네이션 -->
          <div class="d-flex justify-center mt-4">
            <v-pagination v-model="page" :length="totalPages" @update:model-value="fetchUsers" rounded="circle"
              density="comfortable"></v-pagination>
          </div>
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
          <v-switch v-model="editForm.isActive" size="small" color="primary" :false-value="false" :true-value="true"
            hide-details inset>
            <template v-slot:label>
              <div class="d-flex align-center">
                <span class="mr-2">로그인 제어: </span>
                <v-chip :color="editForm.isActive ? 'success' : 'error'" size="small" variant="flat">
                  {{ editForm.isActive ? 'ON' : 'OFF' }}
                </v-chip>
              </div>
            </template>
          </v-switch>
          <span class="text-grey-darken-1 text-caption">로그인 제어 비활성화 시 로그인이 되지 않습니다.</span>
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

// 데이터 처리
const users = ref([]);
const loading = ref(false);
const updating = ref(false);
const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);
const search = ref('');
const roleFilter = ref(null);
const statusFilter = ref(null);

// 다이얼로그
const editDialog = ref(false);
const passwordDialog = ref(false);
const deleteDialog = ref(false);
const selectedUser = ref(null);

// 폼
const editForm = ref({ role: '', isActive: true });
const passwordForm = ref({ newPassword: '' });

// 스낵바
const snackbar = ref({ show: false, message: '', color: 'success' });

// 사용자 테이블 헤더 부분
const headers = [
  { title: '사용자', key: 'username', sortable: false, align: 'center', },
  { title: '권한', key: 'role', sortable: false, align: 'center', },
  { title: '로그인 제어', key: 'isActive', sortable: false, align: 'center', },
  { title: '마지막 로그인', key: 'lastLoginAt', sortable: false, align: 'center', },
  { title: '수정/변경/삭제', key: 'actions', sortable: false, align: 'center' },
];

// 필터 옵션 확인
const roleOptions = [
  { title: '전체', value: null },
  { title: '사용자', value: 'user' },
  { title: '관리자', value: 'admin' },
  { title: '일반', value: 'operator' },
  { title: '게스트', value: 'guest' },
];

const statusOptions = [
  { title: '전체', value: null },
  { title: '사용가능', value: true },
  { title: '사용불가', value: false },
];

// 사용자 목록 조회하기
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

// 검색 핸들러
const handlerSearch = () => {
  page.value = 1;
  fetchUsers();
};

// 필터 핸들러
const handlerFilter = () => {
  page.value = 1;
  fetchUsers();
};

// 수정 다이얼로그 열기
const openEditDialog = (user) => {
  selectedUser.value = user;
  editForm.value = {
    role: user.role,
    isActive: user.isActive,
  };
  editDialog.value = true;
}

// 사용자 정보 업데이트하기
const handleUpdate = async () => {
  updating.value = true;
  try {
    // 권한 변경
    await adminApi.updateUserRole(selectedUser.value.id, editForm.value.role);
    // 상태 변경하기
    await adminApi.updateUserStatus(selectedUser.value.id, editForm.value.isActive);

    // 현재 로그인된 사용자가 본인의 권한이 변경된 경우
    const currentUserId = currentUser.value.id;
    if (selectedUser.value.id === currentUserId) {
      // sessionStorage 업데이트
      const updateUser = {
        ...currentUser.value,
        role: editForm.value.role,
        isActive: editForm.value.isAction
      };

      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('userRole', editForm.value.role);

      // 현재 페이지의 currentUser도 업데이트
      currentUser.value = updateUser;

      // 권한 변경됨 알림
      showSnackbar('권한이 변경되었습니다. 장비 테스트 기능이 활성화 됩니다.', 'info');

      // 즉시 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showSnackbar('사용자 정보가 업데이트 되었습니다.', 'success');
    }

    editDialog.value = false;
    fetchUsers();
  } catch (error) {
    showSnackbar('업데이트에 실패하였습니다.', 'error');
  } finally {
    updating.value = false;
  }
}

// 비밀번호 변경 다이얼로그 열기
const openPasswordDialog = (user) => {
  selectedUser.value = user;
  passwordForm.value.newPassword = '';
  passwordDialog.value = true;
}

// 비밀번호 업데이트
const handlePasswordUpdate = async () => {
  if (!passwordForm.value.newPassword) {
    showSnackbar('비밀번호를 입력하세요.', 'error');
    return;
  }

  updating.value = true;
  try {
    await adminApi.updateUserPassword(
      selectedUser.value.id,
      passwordForm.value.newPassword
    );
    showSnackbar('비밀번호가 변경되었습니다.', 'success');
    passwordDialog.value = false;
  } catch (error) {
    showSnackbar('비밀번호 변경에 실패하였습니다.', 'error');
  } finally {
    updating.value = false;
  }
};

// 삭제 다이얼로그 열기
const openDeleteDialog = (user) => {
  selectedUser.value = user;
  deleteDialog.value = true;
};

// 사용자 삭제
const handleDelete = async () => {
  updating.value = true;
  try {
    await adminApi.deleteUser(selectedUser.value.id);
    showSnackbar('사용자가 삭제되었습니다.', 'success');
    deleteDialog.value = false;
    fetchUsers();
  } catch (error) {
    showSnackbar(error.response?.data?.message || '삭제에 실패하였습니다.', 'error');
  } finally {
    updating.value = false;
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

// 권한 색 매핑하기
const getRoleColor = (role) => {
  const colorMap = {
    'admin': 'error',
    'user': 'primary',
    'operator': 'green',
    'guest': 'grey',
  };
  return colorMap[role] || 'grey';
};

// 권한 라벨 매핑하기
const getRoleLabel = (role) => {
  const labelMap = {
    'admin': '관리자',
    'user': '사용자',
    'operator': '일반',
    'guest': '게스트',
  };
  return labelMap[role] || role;
};

// 초기 로드 시도
onMounted(() => {
  if (isAdmin.value) {
    fetchUsers();
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

.header-card {
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: black;

  // h1,
  // p {
  //   color: white !important;
  // }
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