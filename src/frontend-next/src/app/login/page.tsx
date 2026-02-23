"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ArrowLeft, User, ChevronDown } from "lucide-react";
import { authApi } from "@/lib/api";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setError("");
  };

  // 로그인 Submit 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.signIn({
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast.success(`환영합니다, ${response.user.name}님!`, {
        duration: 3000,
        position: "bottom-center",
      });

      router.push("/");
    } catch (err: any) {
      console.error("로그인 오류:", err);
      setError(err.message || "로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    const KAKAO_REST_API_KEY = "a21fca6df45467b72c4cff24ec14cb6b";
    const REDIRECT_URI = `${window.location.origin}/kakao-callback`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pt-8 pb-36 min-[480px]:pb-40">
      <Card className="w-full max-w-md shadow-lg border-blue-100 dark:border-slate-700 dark:bg-slate-800">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-600 rounded-full text-white">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            우보온라인 운영지원 시스템
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            우보 온라인 운영지원시스템에 접속합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 카카오 로그인 버튼 (최상단) */}
          <Button
            type="button"
            className="w-full h-11 text-base bg-yellow-300 hover:bg-yellow-400 border-yellow-400 text-slate-900 font-bold"
            onClick={handleKakaoLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
              />
            </svg>
            카카오로 시작하기
          </Button>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">또는</span>
            </div>
          </div>

          {/* 아이디로 로그인 토글 버튼 */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 text-base gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            onClick={() => {
              setShowLoginForm(!showLoginForm);
              setError("");
            }}
          >
            <User className="h-4 w-4" />
            아이디로 로그인
            <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-300 ${showLoginForm ? "rotate-180" : ""}`} />
          </Button>

          {/* 아이디/비밀번호 폼 (확장 영역) */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${showLoginForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">아이디</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      placeholder="아이디를 입력하세요"
                      type="text"
                      className="pl-10 h-11"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">비밀번호</Label>
                    <Link href="#" className="text-xs text-blue-600 hover:underline">
                      비밀번호 찾기
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      placeholder="비밀번호를 입력하세요"
                      type="password"
                      className="pl-10 h-11"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 h-11 text-base font-bold"
                  disabled={loading}
                >
                  {loading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700">
          <div className="text-sm text-center text-slate-500 dark:text-slate-400">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-blue-700 dark:text-blue-400 font-bold hover:underline"
            >
              회원가입 요청
            </Link>
          </div>
          <Button variant="ghost" className="w-full h-11 gap-2 text-slate-500" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              메인으로 이동
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
