"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, ShieldCheck, ArrowLeft } from "lucide-react";

const SignupPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("회원가입 요청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.");
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg shadow-xl border-blue-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">회원가입 요청</CardTitle>
          <CardDescription className="text-center">
            시스템 이용을 위해 계정 정보를 입력해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="userName" placeholder="홍길동" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userRole">직급/부서</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="userRole" placeholder="팀장 / 운영팀" className="pl-10" required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일 계정</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="example@woobo.com" className="pl-10" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="password" type="password" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="confirmPassword" type="password" className="pl-10" required />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 py-6 text-lg" disabled={loading}>
              {loading ? "요청 중..." : "가입 요청하기"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t py-4 bg-slate-50/50">
          <p className="text-sm text-slate-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-700 font-bold hover:underline">로그인으로 이동</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;