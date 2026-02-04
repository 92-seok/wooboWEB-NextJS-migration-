import { reactive } from 'vue'

export const useNotification = () => {
  // 스낵바 상태
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // 스낵바 표시 함수
  const showSnackbar = (message, color = 'success') => {
    snackbar.message = message;
    snackbar.color = color;
    snackbar.show = true;
  }
  // * 스낵바 닫기 *
  const closeSnackbar = () => {
    snackbar.show = false
  }

  return {
    snackbar,
    showSnackbar,
    closeSnackbar
  }
}