// 자동 새로고침 타이머 관리
// @param { number } refreshTime - 새로고침 시간(초)
// @param { Function } callback - 타이머 만료 시 실행할 콜백 함수

import { ref, onUnmounted } from 'vue';

export const useTimer = (refreshTime, callback) => {
  const processTime = ref(refreshTime)
  let timerInterval = null

  // 타이머 시작부분
  const startTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
    };

    processTime.value = refreshTime;
    timerInterval = setInterval(() => {
      processTime.value--
      if (processTime.value <= 0) {
        processTime.value = refreshTime;
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    }, 1000);
  }

  // 타이머 중지
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    };
  };

  // 타이머 리셋
  const resetTimer = () => {
    processTime.value = refreshTime;
  };

  // 컴포넌트 언마운트 시 자동 정리하기
  onUnmounted(() => {
    stopTimer();
  });

  return {
    processTime,
    startTimer,
    stopTimer,
    resetTimer,
  }
}