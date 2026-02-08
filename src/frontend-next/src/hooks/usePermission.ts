import { useState, useEffect } from "react";

interface PermissionResult {
  canShowTestButton: boolean;
  canExecuteTest: boolean;
}

/**
 * 사용자 권한을 확인하는 hook
 * 세션 스토리지에서 사용자 정보를 가져와 권한을 판단합니다.
 */
export const usePermission = (): PermissionResult => {
  const [canShowTestButton, setCanShowTestButton] = useState(false);
  const [canExecuteTest, setCanExecuteTest] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === "undefined") {
      return;
    }

    try {
      const userStr = sessionStorage.getItem("user");

      // 유효한 사용자 정보가 없으면 권한 없음
      if (!userStr || userStr === "undefined" || userStr === "null") {
        setCanShowTestButton(false);
        setCanExecuteTest(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userRole = user?.role;

      // 역할에 따른 권한 설정
      // admin: 모든 권한
      // user: 테스트 버튼 표시 및 실행 가능
      // operator: 테스트 버튼 표시만 가능 (실행 불가)
      // guest: 권한 없음
      if (userRole === "admin" || userRole === "user") {
        setCanShowTestButton(true);
        setCanExecuteTest(true);
      } else if (userRole === "operator") {
        setCanShowTestButton(true);
        setCanExecuteTest(false);
      } else {
        setCanShowTestButton(false);
        setCanExecuteTest(false);
      }
    } catch (error) {
      console.error("권한 확인 중 오류:", error);
      setCanShowTestButton(false);
      setCanExecuteTest(false);
    }
  }, []);

  return {
    canShowTestButton,
    canExecuteTest,
  };
};
