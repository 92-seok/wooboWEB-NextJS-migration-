import apiClient from '../axios/axios.config'

// ADMIN API 모음
export const adminApi = {
  // * 전체 사용자 목록조회 *
  getUsers(params = {}) {
    return apiClient.get('/admin/users', { params })
  },
  
  // * 특정 사용자 조회하기 *
  getUserById(id) {
    return apiClient.get(`/admin/users/${id}`);
  },

  // * 사용자 정보 권한 변경 *
  updateUserRole(id, role) {
    return apiClient.patch(`/admin/users/${id}/role`, { role });
  },

  // * 사용자 비밀번호 변경 *
  updateUserPassword(id, newPassword) {
    return apiClient.patch(`/admin/users/${id}/password`, { newPassword });
  },

  // * 사용자 비활성화 *
  updateUserStatus(id, isActive) {
    return apiClient.patch(`/admin/users/${id}/status`, { isActive });
  },

  // * 사용자 삭제 *
  deleteUser(id) {
    return apiClient.delete(`/admin/users/${id}`);
  },
};