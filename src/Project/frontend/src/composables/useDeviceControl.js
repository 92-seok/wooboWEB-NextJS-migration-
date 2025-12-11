import { ref } from 'vue';
import { sendBroadcast, sendGateControl, sendDisplayControl } from '@/api/weather.api';
import { useNotification } from '@/composables/useNotification';

export const useDeviceControl = (showSnackbar) => {
  const loading = ref(false);

  // * 공통 에러 핸들러 *
  const handleResponse = (response, successMessage) => {
    const ok = response.status >= 200 && response.status < 300;
    const serverOk = response.data?.success !== false && response.data?.result !== 'fail';

    if (ok && serverOk) {
      showSnackbar(successMessage, 'success');
      return true;
    } else {
      const msg = response.data?.message || response.statusText || "전송 중 오류가 발생 했습니다.";
      showSnackbar(`전송실패: ${msg}`, 'error');
      return false;
    }
  }

  // * 공통 애러 처리 *
  const handleError = (err) => {
    const msg = err?.response?.data?.message || err.message || '전송 중 오류가 발생했습니다.';
    showSnackbar(msg, 'error');
  };

  // * 방송 제어 부분 *
  const controlBroadcast = async (item, message) => {
    if (loading.value) {
      showSnackbar('테스트 중 입니다.', 'error');
      return false;
    }

    if (!item || !message) {
      showSnackbar('문구를 작성해 주세요.', 'error');
      return false;
    }

    try {
      loading.value = true;
      const response = await sendBroadcast(item, message);
      return handleResponse(response, '메세지가 성공적으로 전송 되었습니다.');
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // * 차단기 제어 부분 *
  const controlGate = async (item, gateAction) => {
    if (loading.value) {
      showSnackbar('처리 중 입니다.', 'error');
      return false;
    }

    if (!item) {
      showSnackbar('장비 정보가 없습니다.', 'error');
      return false;
    }

    try {
      loading.value = true;
      const response = await sendGateControl(item, gateAction);
      return handleResponse(response, '장비 제어가 정상적으로 등록 되었습니다.');
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // * 전광판 제어 부분 *
  const controlDisplay = async (item) => {
    if (loading.value) {
      showSnackbar('처리 중 입니다.', 'error');
      return false;
    }

    if (!item) {
      showSnackbar('장비 정보가 없습니다.', 'error');
      return false;
    }

    try {
      loading.value = true;
      const response = await sendDisplayControl(item);
      return handleResponse(response, '장비 제어가 정상적으로 등록 되었습니다.');
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    controlBroadcast,
    controlGate,
    controlDisplay,
  }

}

