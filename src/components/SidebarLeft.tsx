import React from 'react';
import { Sparkles, Calendar, BookOpen, Users, LogIn, LogOut, CheckCircle2, Flame, Crown, Settings, PenLine, Link2 } from 'lucide-react';
import { Student, Post, Database, ViewType } from '../types';

interface SidebarLeftProps {
  user: Student | null;
  db: Database;
  hasGasUrl?: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSelectTag: (tag: string) => void;
  onNavigate?: (view: ViewType) => void;
}

const POPULAR_TAGS = ['#학급공지', '#배움기록', '#급식최고', '#체육시간', '#현장체험', '#독서토론', '#미니게임', '#친구응원'];

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  user,
  db,
  hasGasUrl,
  onOpenLogin,
  onLogout,
  onSelectTag,
  onNavigate
}) => {
  const isAdmin = user?.role === 'admin' || user?.name.includes('선생님') || user?.name.includes('관리자');
  const userPostsCount = user ? db.Posts.filter((p) => p.author === user.name).length : 0;
  const todayPostsCount = db.Posts.length;
  const totalStudents = db.Students.length;

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
      {/* Profile Card */}
      <div className={`p-6 rounded-[32px] shadow-xs border relative overflow-hidden group ${
        isAdmin ? 'bg-gradient-to-b from-amber-50/50 to-white border-amber-200/60' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-500" />}
            <span>{isAdmin ? '관리자 프로필' : user ? '내 프로필' : '학생 프로필'}</span>
          </h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isAdmin ? 'text-amber-800 bg-amber-100' : 'text-[#8C9AA8] bg-[#F7CAC9]/20'
          }`}>
            {isAdmin ? '담임교사' : '5학년 3반'}
          </span>
        </div>

        {user ? (
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-[24px] mb-3 flex items-center justify-center text-white text-2xl font-black shadow-sm ${
              isAdmin
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 ring-4 ring-amber-100'
                : 'bg-gradient-to-br from-[#F7CAC9] to-[#E4B4B2]'
            }`}>
              {isAdmin ? '👑' : user.name.slice(0, 1)}
            </div>
            <p className="font-bold text-lg text-gray-800 flex items-center gap-1.5 justify-center">
              <span>{user.name}</span>
            </p>
            <p className="text-xs text-gray-400 mb-2">
              {isAdmin ? '학급 총괄 관리 • ' : '출석 12일째 • '}작성글 {userPostsCount}개
            </p>
            <p className="text-[11px] text-gray-600 bg-gray-50/90 px-3 py-1 rounded-xl mb-4 max-w-full truncate border border-gray-100">
              {user.bio || (isAdmin ? '5학년 3반 담임교사 / 블로그 총괄 관리자' : '배려와 우정의 5-3 프렌즈')}
            </p>

            {isAdmin && onNavigate && (
              <div className="w-full grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => onNavigate('write')}
                  className="py-2 rounded-xl text-xs font-bold text-white bg-[#92A8D1] hover:bg-[#8199C5] transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>글쓰기</span>
                </button>
                <button
                  onClick={() => onNavigate('control')}
                  className="py-2 rounded-xl text-xs font-bold text-gray-700 bg-amber-100 hover:bg-amber-200 transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-700" />
                  <span>관리 설정</span>
                </button>
              </div>
            )}

            <button
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs hover:shadow-sm"
              style={{ backgroundColor: isAdmin ? '#8C9AA8' : '#92A8D1' }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-16 h-16 rounded-[20px] mb-3 flex items-center justify-center text-gray-400 text-xl bg-gray-100 border border-dashed border-gray-200">
              👤
            </div>
            <p className="font-bold text-base text-gray-700">방문자 (게스트)</p>
            <p className="text-xs text-gray-400 mb-4">로그인하고 글과 댓글을 남겨보세요</p>
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
              style={{ backgroundColor: '#F7CAC9' }}
            >
              로그인하기
            </button>
          </div>
        )}
      </div>

      {/* Google Sheets Integration Quick Status & Link Box */}
      {onNavigate && (
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-5 rounded-[32px] shadow-xs border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">구글 시트 연동</h4>
                <p className="text-[10px] text-emerald-700 font-medium">실시간 DB 동기화</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              hasGasUrl ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-800'
            }`}>
              {hasGasUrl ? '연동됨' : '미연동'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('control')}
            className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>관리 설정에서 구글 시트 설정 열기</span>
          </button>
        </div>
      )}

      {/* Real-time Statistics Card */}
      <div className="bg-white p-6 rounded-[32px] shadow-xs border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          실시간 활동 통계
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-[#F7CAC9]/15 border border-[#F7CAC9]/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">오늘의 게시글</p>
              <p className="text-xl font-black text-[#E89E9D]">{todayPostsCount}개</p>
            </div>
            <span className="text-xl">📝</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#92A8D1]/15 border border-[#92A8D1]/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">등록된 우리반 친구</p>
              <p className="text-xl font-black text-[#6B84B5]">{totalStudents}명</p>
            </div>
            <span className="text-xl">👥</span>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                인기 주제 태그
              </p>
              <Flame className="w-3.5 h-3.5 text-[#E89E9D]" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag.replace('#', ''))}
                  className="px-2.5 py-1 bg-gray-50 hover:bg-[#F7CAC9]/25 hover:text-[#E89E9D] rounded-lg text-[11px] font-medium text-gray-600 transition-colors border border-gray-100 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
