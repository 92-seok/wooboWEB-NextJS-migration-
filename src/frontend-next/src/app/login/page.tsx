"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 로그인 Submit 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 임시로 1초 뒤 메인으로 이동
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 1000)
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pb-32">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-600 rounded-full text-white">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">로그인</CardTitle>
          <CardDescription>
            우보 온라인 운영지원시스템에 접속합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 계정</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  placeholder="example@woobo.com"
                  type="email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link href="#" className="text-xs text-blue-600 hover:underline">비밀번호 찾기</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 h-11 text-base"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "시스템 접속"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50/50">
          <div className="text-sm text-center text-slate-500">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" className="text-blue-700 font-bold hover:underline">
              회원가입 요청
            </Link>
          </div>
          <Button variant="ghost" className="w-full gap-2 text-slate-500" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              메인으로 돌아가기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;