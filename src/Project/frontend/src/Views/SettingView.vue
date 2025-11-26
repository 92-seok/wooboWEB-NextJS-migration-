<template>
  <div class="min-h-screen bg-gray-600">
    <!-- 권한 없음 화면 띄우기 -->
    <div v-if="!isAdmin" class="flex items-center justify-center min-h-screen px-4">
      <v-card class="max-w-md w-full" elevated="8">
        <v-card-text class="text-center py-12">
          <div class="mb-6">
            <v-icon size="80" color="error">mdi-shield-lock</v-icon>
          </div>
          <h2 class="text-2xl text-bold text-gray-800 mb-4">접근 권한이 없습니다</h2>
          <p class="text-gray-600 mb-6">이 페이지는 <strong>관리자</strong>만 접근할 수 있습니다.</p>
          <v-btn color="primary" @click="goToHome" size="large">홈으로 돌아가기</v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- 관리자 화면 페이지 -->
    <div v-else>
      <!-- 헤더 부분 -->
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex flex-col sm:flox-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                관리자 페이지
              </h1>
              <p class="text-sm text-gray-500 mt-1">사용자 관리 및 설정</p>
            </div>
            <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchUsers" :loading="loading">
              새로고침
            </v-btn>
          </div>
        </div>
      </header>
    </div>


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
const totalPage = ref(1);
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

// 테이블 헤더 부분
const header = [
  { title: '사용자', key: 'email', sortable: false },
  { title: '역할', key: 'role', sortable: false },
  { title: '상태', key: 'status', sortable: false },
  { title: '마지막 로그인', key: 'lastLoginAt', sortable: false },
  { title: '액션', key: 'actions', sortable: false, align: 'center' },
];

// 필터 옵션 확인
const roleOption = [
  { title: '전체', value: null },
  { title: '사용자', value: 'user' },
  { title: '관리자', value: 'admin' },
];

const statusOption = [
  { title: '전체', value: null },
  { title: '활성', value: true },
  { title: '비활성', value: false },
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
    totalPage.value = response.data.data.totalPage;
  } catch(error) {
    console.error('사용자 목록을 불러오는데 실패했습니다.', error);
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
const handlerUpdate = async () => {
  updating.value = true;
  try {
    // 역할변경
    await adminApi.updateUsersRole(selectedUser.value.id, editForm.value.role);
    // 상태 변경하기
    await adminApi.updateUsersStatus(selectedUser.value.id, editForm.value.isActive);

    showSnackbar('사용자 정보가 업데이트 되었습니다.', 'success');
    editDialog.value = false;
    fetchUsers();
  } catch (error) {
    showSnackbar('업데이트에 실패하였습니다.', error);
  } finally {
    updating.value = false;
  }
}

// 비밀번호 다이얼로그 열기
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
    showSnackbar('비밀번호가 변경이 실패하였습니다.', 'error');
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
const formetDate = (date) => {
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
  }
});


</script>

<style lang="scss" scoped></style>