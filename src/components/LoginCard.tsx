import React, { useState } from 'react';
import { Lock, User, Sparkles, KeyRound, ShieldCheck, Crown } from 'lucide-react';
import { Student } from '../types';

interface LoginCardProps {
  students: Student[];
  onLogin: (name: string, pw: string) => boolean;
  onAdminLogin?: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ students, onLogin, onAdminLogin }) => {
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>('student');
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [adminPw, setAdminPw] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pw.trim()) {
      setErrorMsg('이름과 비밀번호를 모두 입력해주세요.');
      return;
    }
    const success = onLogin(name.trim(), pw.trim());
    if (!success) {
      setErrorMsg('등록되지 않은 이름이거나 비밀번호가 일치하지 않습니다.');
    } else {
      setErrorMsg('');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPw.trim()) {
      setErrorMsg('관리자 비밀번호를 입력해주세요.');
      return;
    }
    if (adminPw.trim() === '0526') {
      const success = onLogin('선생님 (관리자)', '0526');
      if (!success) {
        setErrorMsg('관리자 인증에 실패하였습니다.');
      } else {
        setErrorMsg('');
      }
    } else {
      setErrorMsg('관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div id="login-card-container" className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
      {/* Decorative Pastel Background Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F7CAC9]/30 to-[#92A8D1]/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#92A8D1]/20 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />

      <div className="relative z-10">
        {/* Mode Switch Tabs */}
        <div className="flex justify-center mb-5">
          <div className="bg-gray-100/80 p-1 rounded-2xl flex items-center gap-1 border border-gray-200/50">
            <button
              type="button"
              onClick={() => { setLoginMode('student'); setErrorMsg(''); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                loginMode === 'student'
                  ? 'bg-white text-gray-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E89E9D]" />
              <span>학생 로그인</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginMode('admin'); setErrorMsg(''); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                loginMode === 'admin'
                  ? 'bg-white text-[#6B84B5] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>선생님(관리자) 로그인</span>
            </button>
          </div>
        </div>

        {loginMode === 'student' ? (
          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-2xl bg-[#F7CAC9]/30 flex items-center justify-center text-[#E89E9D]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">학생 로그인 👋</h2>
            </div>
            <p className="text-center text-xs text-gray-400 mb-6">
              5학년 3반 친구들은 등록된 이름과 4자리 비밀번호로 로그인해주세요!
            </p>

            <form onSubmit={handleStudentSubmit} className="space-y-3.5 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">학생 이름</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="학생 이름을 입력하세요"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 focus:border-[#F7CAC9] focus:bg-white rounded-2xl outline-none text-sm transition-all text-gray-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">비밀번호 (4자리)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-pw-input"
                    type="password"
                    maxLength={4}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="4자리 비밀번호를 입력하세요"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 focus:border-[#92A8D1] focus:bg-white rounded-2xl outline-none text-sm transition-all text-gray-800"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: '#92A8D1' }}
              >
                <KeyRound className="w-4 h-4" />
                <span>학급 블로그 입장하기</span>
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Crown className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">선생님 관리자 로그인 👑</h2>
            </div>
            <p className="text-center text-xs text-gray-400 mb-6">
              관리자 계정으로 로그인하면 관리자 명의로 공지 및 새 글을 작성하고 학급을 관리할 수 있습니다.
            </p>

            <form onSubmit={handleAdminSubmit} className="space-y-3.5 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">선생님 관리자 비밀번호</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="admin-login-pw-input"
                    type="password"
                    value={adminPw}
                    onChange={(e) => setAdminPw(e.target.value)}
                    placeholder="관리자 비밀번호를 입력하세요"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 focus:border-[#F7CAC9] focus:bg-white rounded-2xl outline-none text-sm transition-all text-gray-800"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                id="admin-login-submit-btn"
                type="submit"
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: '#F7CAC9' }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>관리자 계정으로 로그인 &amp; 글쓰기</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
