import React from 'react';
import { RefreshCw, LogOut, LogIn, PenLine, Crown, ShieldCheck } from 'lucide-react';
import { Student, ViewType } from '../types';

interface NavbarProps {
  view: ViewType;
  setView: (v: ViewType) => void;
  user: Student | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  hasGasUrl: boolean;
  onRefresh: () => void;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  view,
  setView,
  user,
  onLogout,
  onOpenLogin,
  hasGasUrl,
  onRefresh,
  loading
}) => {
  const isAdmin = user?.role === 'admin' || user?.name.includes('선생님') || user?.name.includes('관리자');

  return (
    <header className="h-20 w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 bg-white/80 backdrop-blur-md border-b border-[#F7CAC9]/30 sticky top-0 z-30 transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <button
          id="nav-logo-btn"
          onClick={() => setView('home')}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F7CAC9, #92A8D1)' }}
          >
            <span className="text-white font-black text-lg sm:text-xl">5-3</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              <span style={{ color: '#92A8D1' }}>5학년 3반</span>{' '}
              <span style={{ color: '#F7CAC9' }}>Blog</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">꿈과 우정이 자라는 우리들의 공간</p>
          </div>
        </button>
      </div>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-gray-500">
        <button
          id="tab-home-btn"
          onClick={() => setView('home')}
          className={`pb-1.5 transition-colors cursor-pointer ${
            view === 'home'
              ? 'text-[#F7CAC9] border-b-2 border-[#F7CAC9] font-bold'
              : 'border-b-2 border-transparent hover:text-[#92A8D1]'
          }`}
        >
          전체보기
        </button>

        {/* Dedicated Write Tab */}
        <button
          id="tab-write-btn"
          onClick={() => {
            if (!user) {
              onOpenLogin();
            } else {
              setView('write');
            }
          }}
          className={`pb-1.5 transition-colors cursor-pointer flex items-center gap-1 ${
            view === 'write'
              ? 'text-[#E89E9D] border-b-2 border-[#F7CAC9] font-bold'
              : 'border-b-2 border-transparent hover:text-[#E89E9D]'
          }`}
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>글쓰기</span>
        </button>

        <button
          id="tab-myposts-btn"
          onClick={() => setView('myPosts')}
          className={`pb-1.5 transition-colors cursor-pointer ${
            view === 'myPosts'
              ? 'text-[#F7CAC9] border-b-2 border-[#F7CAC9] font-bold'
              : 'border-b-2 border-transparent hover:text-[#92A8D1]'
          }`}
        >
          {isAdmin ? '관리자 기록' : '나의 기록'}
        </button>

        <button
          id="tab-students-btn"
          onClick={() => setView('students')}
          className={`pb-1.5 transition-colors cursor-pointer ${
            view === 'students'
              ? 'text-[#92A8D1] border-b-2 border-[#92A8D1] font-bold'
              : 'border-b-2 border-transparent hover:text-[#92A8D1]'
          }`}
        >
          학급 친구들
        </button>

        <button
          id="tab-control-btn"
          onClick={() => setView('control')}
          className={`pb-1.5 transition-colors cursor-pointer flex items-center gap-1 ${
            view === 'control'
              ? 'text-[#92A8D1] border-b-2 border-[#92A8D1] font-bold'
              : 'border-b-2 border-transparent hover:text-[#92A8D1]'
          }`}
        >
          {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-500" />}
          <span>관리 설정</span>
        </button>
      </nav>

      {/* Right User & Sync Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Write Post Highlight Button */}
        <button
          id="nav-quick-write-btn"
          onClick={() => {
            if (!user) {
              onOpenLogin();
            } else {
              setView('write');
            }
          }}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: isAdmin ? '#92A8D1' : '#F7CAC9' }}
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>{isAdmin ? '관리자 글쓰기' : '새 글 쓰기'}</span>
        </button>

        <button
          id="refresh-sync-btn"
          onClick={onRefresh}
          title={hasGasUrl ? '구글 시트와 실시간 동기화' : '새로고침'}
          disabled={loading}
          className="p-2 rounded-full text-gray-400 hover:text-[#92A8D1] hover:bg-[#92A8D1]/10 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#92A8D1]' : ''}`} />
        </button>

        {user ? (
          <div className={`flex items-center gap-2 py-1.5 px-3 sm:px-4 rounded-full border transition-all ${
            isAdmin
              ? 'bg-amber-50/80 border-amber-200/70'
              : 'bg-gray-100/70 hover:bg-gray-100/90 border-gray-200/50'
          }`}>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs ${
              isAdmin ? 'bg-amber-500' : 'bg-[#92A8D1]'
            }`}>
              {isAdmin ? '👑' : user.name.slice(0, 1)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-bold text-gray-800 max-w-[90px] sm:max-w-none truncate flex items-center gap-1">
                {user.name}
              </span>
              {isAdmin && (
                <span className="text-[10px] font-semibold text-amber-700 leading-none">학급 관리자</span>
              )}
            </div>
            <button
              onClick={onLogout}
              title="로그아웃"
              className="text-gray-400 hover:text-red-500 p-0.5 ml-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 bg-[#F7CAC9]/20 hover:bg-[#F7CAC9]/30 text-[#E89E9D] py-1.5 px-3.5 rounded-full border border-[#F7CAC9]/50 text-xs font-bold transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인</span>
          </button>
        )}
      </div>
    </header>
  );
};
