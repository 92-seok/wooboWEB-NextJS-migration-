// composables/usePermission.js

import { computed, ref, watch } from 'vue'

const forceUpdate = ref(0)

export const usePermission = () => {
  // 반응형 상태 추가

  // sessionStorage 변경 감지를 위한 헬퍼
  const getStorageValue = (key) => {
    forceUpdate.value // 반응성 트리거
    return sessionStorage.getItem(key)
  }

  // 로그인 상태 확인
  const isLoggedIn = computed(() => {
    const token = getStorageValue('accessToken')
    console.log('isLoggedIn computed:', !!token)
    return !!token
  })

  // 현재 사용자 role
  const userRole = computed(() => {
    if (!isLoggedIn.value) {
      console.log('userRole: guest (로그인 안 함)')
      return 'guest'
    }
    const role = getStorageValue('userRole') || 'guest'
    console.log('userRole:', role)
    return role
  })

  // 관리자 여부
  const isAdmin = computed(() => {
    const result = isLoggedIn.value && userRole.value === 'admin'
    console.log('👤 isAdmin:', result)
    return result
  })

  // 일반 사용자 여부
  const isUser = computed(() => {
    return isLoggedIn.value && userRole.value === 'user'
  })

  // 게스트 여부
  const isGuest = computed(() => {
    return !isLoggedIn.value || userRole.value === 'guest'
  })

  // 권한 체크 함수
  const hasPermission = (requiredRole) => {
    if (!isLoggedIn.value) {
      console.log('hasPermission: 로그인 안 함')
      return false
    }

    const roleHierarchy = {
      'guest': 0,
      'user': 1,
      'admin': 2
    }

    const currentLevel = roleHierarchy[userRole.value] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    return currentLevel >= requiredLevel
  }

  // 장비 테스트 권한 (관리자만 + 로그인 필수)
  const canAccessDeviceTest = computed(() => {
    const result = isLoggedIn.value && isAdmin.value
    console.log('canAccessDeviceTest:', result, {
      isLoggedIn: isLoggedIn.value,
      isAdmin: isAdmin.value,
      userRole: userRole.value
    })
    return result
  })

  // 편집 권한 (user 이상 + 로그인 필수)
  const canEdit = computed(() => {
    return isLoggedIn.value && hasPermission('user')
  })

  // 조회 권한 (로그인한 모든 사용자)
  const canView = computed(() => {
    return isLoggedIn.value
  })

  // 사용자 관리 권한 (관리자만)
  const canManageUsers = computed(() => {
    return isLoggedIn.value && isAdmin.value
  })

  // 수동 업데이트 함수 (필요 시 호출)
  const refreshPermissions = () => {
    forceUpdate.value++
    console.log('권한 새로고침')
  }

  return {
    isLoggedIn,
    userRole,
    isAdmin,
    isUser,
    isGuest,
    hasPermission,
    canAccessDeviceTest,
    canEdit,
    canView,
    canManageUsers,
    refreshPermissions
  }
}