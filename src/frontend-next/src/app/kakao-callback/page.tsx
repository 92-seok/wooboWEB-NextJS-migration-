"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

const KakaoCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKakaoCallback = async () => {
      // URL에서 인증 코드 추출
      const code = searchParams.get("code");

      if (!code) {
        setError("카카오 인증 코드가 없습니다.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        // 백엔드로 카카오 로그인 요청
        const response = await authApi.kakaoLogin({
          code,
          domain: window.location.origin,
        });

        // 토큰과 사용자 정보 저장
        sessionStorage.setItem("accessToken", response.accessToken);
        sessionStorage.setItem("refreshToken", response.refreshToken);
        sessionStorage.setItem("user", JSON.stringify(response.user));

        // 로그인 성공 메시지
        toast.success(`카카오 로그인 성공! 환영합니다, ${response.user.name}님!`, {
          duration: 3000,
          position: "top-center",
        });

        // 메인 페이지로 이동
        router.push("/");
      } catch (err: any) {
        console.error("카카오 로그인 오류:", err);
        setError(err.message || "카카오 로그인에 실패했습니다.");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleKakaoCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-600 text-xl font-bold mb-4">❌ {error}</div>
            <p className="text-slate-600">로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="text-blue-600 text-xl font-bold mb-4">🔄 카카오 로그인 처리 중...</div>
            <p className="text-slate-600">잠시만 기다려주세요.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default KakaoCallbackPage;
