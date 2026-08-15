import React from 'react';
import { Megaphone, BookOpen, Award, Image, Sparkles } from 'lucide-react';

interface SidebarRightProps {
  onViewGallery?: () => void;
  onOpenNotice?: () => void;
}

const GALLERY_PREVIEWS = [
  { id: 1, label: '행성 모형전', emoji: '🪐', color: 'from-[#F7CAC9]/40 to-[#F7CAC9]/80' },
  { id: 2, label: '독서 토론', emoji: '📚', color: 'from-[#92A8D1]/40 to-[#92A8D1]/80' },
  { id: 3, label: '엔트리 코딩', emoji: '🤖', color: 'from-[#FDF3DE] to-[#FCE1B5]' },
  { id: 4, label: '체육 축구', emoji: '⚽', color: 'from-[#A8E6CF]/40 to-[#A8E6CF]/80' }
];

export const SidebarRight: React.FC<SidebarRightProps> = ({ onViewGallery }) => {
  return (
    <aside className="w-full xl:w-72 flex flex-col gap-6 shrink-0">
      {/* Notice Card in Serenity Tone */}
      <div className="bg-[#92A8D1] p-6 rounded-[32px] text-white shadow-md shadow-[#92A8D1]/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold opacity-90 tracking-wide">학급 공지사항 📢</h3>
          </div>
          <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
            Week 24
          </span>
        </div>

        <div className="space-y-3.5">
          <div className="border-l-2 border-white/40 pl-3.5">
            <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider">Next Week</p>
            <p className="text-xs font-bold leading-snug">현장체험학습 도시락 &amp; 준비물 챙기기</p>
          </div>

          <div className="border-l-2 border-white/40 pl-3.5">
            <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider">Homework</p>
            <p className="text-xs font-bold leading-snug">수학 익힘책 42-45쪽 스스로 풀어오기</p>
          </div>

          <div className="border-l-2 border-white/40 pl-3.5">
            <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider">Manner</p>
            <p className="text-xs font-bold leading-snug">서로를 응원하는 고운 말과 칭찬 댓글 달기</p>
          </div>
        </div>
      </div>

      {/* Classroom Gallery & Activities */}
      <div className="bg-white p-6 rounded-[32px] shadow-xs border border-gray-100 relative overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            우리반 갤러리 🎨
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">활동 모음</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {GALLERY_PREVIEWS.map((item) => (
            <div
              key={item.id}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${item.color} p-3 flex flex-col items-center justify-center text-center shadow-2xs border border-white/40 transition-transform hover:scale-[1.03] cursor-pointer`}
            >
              <span className="text-2xl mb-1">{item.emoji}</span>
              <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => alert('우리반 현장체험학습 및 작품 갤러리가 곧 업데이트됩니다!')}
            className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[11px] font-bold text-gray-500 border border-gray-100 transition-colors cursor-pointer"
          >
            학급 앨범 사진 더보기
          </button>
        </div>
      </div>
    </aside>
  );
};
