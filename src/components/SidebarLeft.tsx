import React from 'react';
import { Sparkles, Calendar, BookOpen, Users, LogIn, LogOut, CheckCircle2, Flame } from 'lucide-react';
import { Student, Post, Database } from '../types';

interface SidebarLeftProps {
  user: Student | null;
  db: Database;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSelectTag: (tag: string) => void;
}

const POPULAR_TAGS = ['#배움기록', '#급식최고', '#체육시간', '#현장체험', '#독서토론', '#미니게임', '#친구응원'];

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  user,
  db,
  onOpenLogin,
  onLogout,
  onSelectTag
}) => {
  const userPostsCount = user ? db.Posts.filter((p) => p.author === user.name).length : 0;
  const todayPostsCount = db.Posts.length;
  const totalStudents = db.Students.length;

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-[32px] shadow-xs border border-gray-100 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {user ? '내 프로필' : '학생 프로필'}
          </h3>
          <span className="text-[10px] font-semibold text-[#8C9AA8] bg-[#F7CAC9]/20 px-2 py-0.5 rounded-full">
            5학년 3반
          </span>
        </div>

        {user ? (
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-[24px] mb-3 flex items-center justify-center text-white text-2xl font-black shadow-sm bg-gradient-to-br from-[#F7CAC9] to-[#E4B4B2]">
              {user.name.slice(0, 1)}
            </div>
            <p className="font-bold text-lg text-gray-800">{user.name} 학생</p>
            <p className="text-xs text-gray-400 mb-2">출석 12일째 • 작성글 {userPostsCount}개</p>
            <p className="text-[11px] text-gray-500 bg-gray-50 px-3 py-1 rounded-xl mb-4 max-w-full truncate border border-gray-100">
              {user.bio || '배려와 우정의 5-3 프렌즈'}
            </p>

            <button
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs hover:shadow-sm"
              style={{ backgroundColor: '#92A8D1' }}
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
              학생 로그인하기
            </button>
          </div>
        )}
      </div>

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
