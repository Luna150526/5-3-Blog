import React, { useState } from 'react';
import { Megaphone, Image as ImageIcon, Sparkles, X, ChevronRight, Calendar } from 'lucide-react';
import { NoticeItem, GalleryItem } from '../types';

interface SidebarRightProps {
  notices?: NoticeItem[];
  gallery?: GalleryItem[];
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  notices = [],
  gallery = []
}) => {
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [showAllGallery, setShowAllGallery] = useState(false);

  const displayedGallery = showAllGallery ? gallery : gallery.slice(0, 4);

  return (
    <aside className="w-full xl:w-72 flex flex-col gap-6 shrink-0">
      {/* Notice Card in Serenity Tone */}
      <div className="bg-[#92A8D1] p-6 rounded-[32px] text-white shadow-md shadow-[#92A8D1]/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold opacity-95 tracking-wide">학급 공지사항 📢</h3>
          </div>
          <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
            {notices.length}개
          </span>
        </div>

        {notices.length === 0 ? (
          <div className="py-4 text-center text-xs opacity-80">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="space-y-3.5">
            {notices.map((n) => (
              <div key={n.id} className="border-l-2 border-white/40 pl-3.5 group">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider">
                    {n.tag || 'Notice'}
                  </p>
                  {n.date && (
                    <span className="text-[9px] opacity-60 font-mono">{n.date}</span>
                  )}
                </div>
                <p className="text-xs font-bold leading-snug mt-0.5 break-keep">{n.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classroom Gallery & Activities */}
      <div className="bg-white p-6 rounded-[32px] shadow-xs border border-gray-100 relative overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>우리반 갤러리 🎨</span>
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">활동 {gallery.length}개</span>
        </div>

        {gallery.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            등록된 갤러리 활동이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {displayedGallery.map((item) => {
              const bgStyle = item.color ? { backgroundColor: `${item.color}35`, borderColor: `${item.color}60` } : {};
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedGalleryItem(item)}
                  style={bgStyle}
                  className="aspect-square rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs border border-gray-100 transition-all hover:scale-[1.04] active:scale-95 cursor-pointer group relative overflow-hidden"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <>
                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                        {item.emoji || '🎨'}
                      </span>
                      <span className="text-[11px] font-bold text-gray-700 truncate w-full px-1">
                        {item.title}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {gallery.length > 4 && (
          <div className="mt-auto pt-1">
            <button
              onClick={() => setShowAllGallery(!showAllGallery)}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[11px] font-bold text-gray-500 border border-gray-100 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>{showAllGallery ? '접기' : `학급 갤러리 전체보기 (${gallery.length}개)`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Gallery Item Modal Popup */}
      {selectedGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setSelectedGalleryItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              {selectedGalleryItem.imageUrl ? (
                <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-gray-50">
                  <img
                    src={selectedGalleryItem.imageUrl}
                    alt={selectedGalleryItem.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 shadow-sm"
                  style={{ backgroundColor: `${selectedGalleryItem.color || '#F7CAC9'}40` }}
                >
                  {selectedGalleryItem.emoji || '🎨'}
                </div>
              )}

              <h4 className="text-lg font-bold text-gray-800 mb-1">
                {selectedGalleryItem.title}
              </h4>
              {selectedGalleryItem.date && (
                <p className="text-xs text-gray-400 mb-3 flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{selectedGalleryItem.date}</span>
                </p>
              )}
              <p className="text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed mb-4">
                {selectedGalleryItem.description || '5학년 3반 친구들의 즐거운 학급 활동 기록입니다!'}
              </p>

              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="w-full py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm cursor-pointer"
                style={{ backgroundColor: '#92A8D1' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
