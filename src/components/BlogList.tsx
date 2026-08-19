import React, { useState } from 'react';
import { 
  Trash2, 
  Send, 
  Tag, 
  Smile, 
  Sparkles,
  MessageCircle,
  Heart,
  PenLine,
  MapPin,
  Calendar,
  Vote,
  Link2,
  Code2
} from 'lucide-react';
import { Post, Comment, Student, Category, RichBlock } from '../types';

interface BlogListProps {
  posts: Post[];
  comments: Comment[];
  categories?: Category[];
  user: Student | null;
  filterUser?: string | null;
  filterTag?: string | null;
  onClearFilter?: () => void;
  onAddPost: (content: string, category: string, emoji: string, title?: string, blocks?: RichBlock[]) => void;
  onDeletePost: (postId: number | string) => void;
  onToggleLike: (postId: number | string) => void;
  onAddComment: (postId: number | string, text: string) => void;
  onDeleteComment: (commentId: number | string) => void;
  onOpenLogin: () => void;
  onOpenWrite?: () => void;
}

const DEFAULT_CATEGORY_ITEMS: Category[] = [
  { id: 1, name: '일상', emoji: '🌱', color: '#F7CAC9' },
  { id: 2, name: '배움기록', emoji: '📝', color: '#92A8D1' },
  { id: 3, name: '독서', emoji: '📚', color: '#FCE1B5' },
  { id: 4, name: '질문', emoji: '💡', color: '#A8E6CF' },
  { id: 5, name: '칭찬', emoji: '💖', color: '#DED2F9' }
];

export const BlogList: React.FC<BlogListProps> = ({
  posts,
  comments,
  categories = DEFAULT_CATEGORY_ITEMS,
  user,
  filterUser,
  filterTag,
  onClearFilter,
  onAddPost,
  onDeletePost,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onOpenLogin,
  onOpenWrite
}) => {
  const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORY_ITEMS;

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const filteredPosts = posts
    .filter((p) => {
      if (filterUser && p.author !== filterUser) return false;
      if (filterTag && !p.content.includes(filterTag) && p.category !== filterTag && (!p.title || !p.title.includes(filterTag))) return false;
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
      return true;
    })
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  const handleCommentSubmit = (postId: number | string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[String(postId)];
    if (!text || !text.trim()) return;
    onAddComment(postId, text.trim());
    setCommentInputs((prev) => ({ ...prev, [String(postId)]: '' }));
    setExpandedComments((prev) => ({ ...prev, [String(postId)]: true }));
  };

  const toggleComments = (postId: number | string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [String(postId)]: !prev[String(postId)]
    }));
  };

  // Helper to find category metadata
  const getCatMeta = (catName?: string) => {
    return activeCategories.find((c) => c.name === catName);
  };

  return (
    <div className="space-y-6">
      {/* Active Filter Indicator if any */}
      {(filterUser || filterTag) && (
        <div className="bg-white px-5 py-3 rounded-2xl border border-[#92A8D1]/40 flex items-center justify-between shadow-xs">
          <span className="text-xs font-semibold text-gray-700">
            🔎 {filterUser && <span>작성자: <strong>{filterUser}</strong> 학생 </span>}
            {filterTag && <span>태그: <strong>#{filterTag}</strong> </span>}
            모아보기
          </span>
          <button
            onClick={onClearFilter}
            className="text-xs text-[#E89E9D] font-bold hover:underline cursor-pointer"
          >
            필터 해제 ✕
          </button>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedCategoryFilter === 'all'
              ? 'bg-[#92A8D1] text-white shadow-xs'
              : 'bg-white text-gray-500 hover:bg-[#92A8D1]/10 border border-gray-100'
          }`}
        >
          🌟 전체 ({posts.length})
        </button>
        {activeCategories.map((cat) => {
          const count = posts.filter((p) => p.category === cat.name).length;
          const isSelected = selectedCategoryFilter === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
              style={{
                backgroundColor: isSelected ? (cat.color || '#F7CAC9') : undefined
              }}
            >
              <span>{cat.emoji || '🌱'}</span>
              <span>{cat.name}</span>
              <span className="opacity-80 text-[11px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Write Post Prompt Card */}
      <div className="bg-white p-5 rounded-[32px] shadow-sm border-2 border-dashed border-[#F7CAC9] shrink-0 transition-all hover:border-[#F7CAC9] group">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #F7CAC9, #92A8D1)' }}
            >
              ✏️
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <span>오늘은 어떤 일이 있었나요?</span>
                <span className="text-xs font-normal text-gray-400">
                  {user ? `(작성자: ${user.name} 학생)` : ''}
                </span>
              </h4>
              <p className="text-xs text-gray-400">
                사진, 스티커, 인용구, 투표 등을 넣어 나만의 멋진 블로그 글을 써보세요!
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            <button
              id="feed-open-write-btn"
              onClick={() => {
                if (!user) {
                  onOpenLogin();
                } else if (onOpenWrite) {
                  onOpenWrite();
                }
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: '#F7CAC9' }}
            >
              <PenLine className="w-4 h-4" />
              <span>스마트에디터로 글쓰기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col gap-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
            <p className="text-3xl mb-2">🍃</p>
            <p className="text-sm font-bold text-gray-700 mb-1">등록된 게시글이 없습니다</p>
            <p className="text-xs text-gray-400 mb-4">5학년 3반의 첫 번째 멋진 이야기를 작성해보세요!</p>
            <button
              onClick={() => {
                if (!user) onOpenLogin();
                else if (onOpenWrite) onOpenWrite();
              }}
              className="px-5 py-2.5 rounded-2xl text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              style={{ backgroundColor: '#92A8D1' }}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>새 글 쓰기</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const postComments = comments.filter((c) => String(c.postId) === String(post.id));
            const isLikedByMe = user && post.likedBy && post.likedBy.includes(user.name);
            const likeCount = post.likes || 0;
            const isUserAdmin = user?.role === 'admin' || user?.name.includes('선생님') || user?.name.includes('관리자');
            const isPostAdmin = post.isAdmin || post.author.includes('선생님') || post.author.includes('관리자');
            const isMyPost = user && post.author === user.name;
            const canDeletePost = isMyPost || isUserAdmin;
            const isEven = idx % 2 === 0;
            const avatarBg = isPostAdmin
              ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
              : isEven
              ? 'bg-[#92A8D1]/20 text-[#92A8D1]'
              : 'bg-[#F7CAC9]/20 text-[#E89E9D]';
            const catMeta = getCatMeta(post.category);
            const isExpanded = expandedComments[String(post.id)] ?? false;

            return (
              <article
                key={post.id}
                id={`post-card-${post.id}`}
                className={`bg-white p-6 sm:p-7 rounded-[32px] shadow-sm border shrink-0 transition-all ${
                  isPostAdmin
                    ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white hover:border-amber-300'
                    : 'border-gray-100 hover:border-[#F7CAC9]/40'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center font-bold text-sm`}
                    >
                      {isPostAdmin ? '👑' : post.author.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-gray-800">
                          {post.author}
                        </p>
                        {isPostAdmin && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                            👑 담임선생님
                          </span>
                        )}
                        <span className="text-[10px] font-normal text-gray-400 ml-1">{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${catMeta?.color || '#F7CAC9'}25`,
                            color: catMeta?.color === '#F7CAC9' ? '#E89E9D' : catMeta?.color === '#92A8D1' ? '#6B84B5' : '#4B5563'
                          }}
                        >
                          {catMeta?.emoji || post.emoji || '🌱'} {post.category || '일상'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canDeletePost && (
                    <button
                      onClick={() => {
                        const confirmMsg = isMyPost
                          ? '이 글을 삭제하시겠습니까?'
                          : `관리자 권한으로 '${post.author}' 학생의 글을 삭제하시겠습니까?`;
                        if (window.confirm(confirmMsg)) {
                          onDeletePost(post.id);
                        }
                      }}
                      className="text-gray-300 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                      title={isMyPost ? '내 글 삭제' : '관리자 권한으로 삭제'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Title if present */}
                {post.title && (
                  <h3 className="text-base sm:text-lg font-black text-gray-800 mb-2 tracking-tight">
                    {post.title}
                  </h3>
                )}

                {/* Body Content */}
                {post.content && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}

                {/* Rich Media Blocks */}
                {post.blocks && post.blocks.length > 0 && (
                  <div className="space-y-3.5 mb-4">
                    {post.blocks.map((block) => (
                      <div key={block.id} className="overflow-hidden">
                        {/* Image Block */}
                        {block.type === 'image' && (
                          <div className="space-y-1.5 text-center my-2">
                            <img
                              src={block.url}
                              alt="첨부된 사진"
                              className="max-h-80 w-auto mx-auto rounded-2xl object-cover shadow-xs border border-gray-100"
                              referrerPolicy="no-referrer"
                            />
                            {block.caption && (
                              <p className="text-xs text-gray-400 italic">📷 {block.caption}</p>
                            )}
                          </div>
                        )}

                        {/* Quote Block */}
                        {block.type === 'quote' && (
                          <div
                            className={`p-4 rounded-2xl my-2 ${
                              block.quoteStyle === 'box'
                                ? 'bg-[#F7CAC9]/15 border-2 border-[#F7CAC9]/40'
                                : block.quoteStyle === 'speech'
                                ? 'bg-blue-50/80 border border-blue-200 rounded-bl-none'
                                : 'border-l-4 border-[#92A8D1] bg-gray-50/80 pl-4'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-700 italic leading-relaxed">
                              &ldquo;{block.content}&rdquo;
                            </p>
                            {block.quoteAuthor && (
                              <p className="text-xs text-gray-400 text-right mt-1 font-medium">
                                — {block.quoteAuthor}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Divider Block */}
                        {block.type === 'divider' && (
                          <div className="py-2">
                            {block.dividerStyle === 'dashed' && <div className="border-t-2 border-dashed border-gray-200" />}
                            {block.dividerStyle === 'dotted' && <div className="border-t-2 border-dotted border-[#92A8D1]" />}
                            {block.dividerStyle === 'curved' && (
                              <div className="text-center text-gray-400 text-xs tracking-widest">~ • 🌸 • ~</div>
                            )}
                            {(!block.dividerStyle || block.dividerStyle === 'solid') && (
                              <div className="border-t border-gray-200" />
                            )}
                          </div>
                        )}

                        {/* Sticker Block */}
                        {block.type === 'sticker' && (
                          <div className="text-center py-2">
                            <span className="text-5xl inline-block transform hover:scale-110 transition-transform">
                              {block.sticker}
                            </span>
                          </div>
                        )}

                        {/* Place Block */}
                        {block.type === 'place' && (
                          <div className="flex items-center gap-3 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-xs">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-emerald-900">{block.placeName}</h4>
                              {block.placeDesc && <p className="text-[11px] text-emerald-700">{block.placeDesc}</p>}
                            </div>
                          </div>
                        )}

                        {/* Poll Block */}
                        {block.type === 'poll' && (
                          <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Vote className="w-4 h-4 text-purple-600" />
                              <h4 className="font-bold text-purple-900">학급 투표: {block.pollQuestion}</h4>
                            </div>
                            <div className="space-y-1.5">
                              {block.pollOptions?.map((opt) => (
                                <div
                                  key={opt.id}
                                  className="bg-white p-2 rounded-xl border border-purple-100 font-medium text-gray-700 flex items-center justify-between"
                                >
                                  <span>{opt.text}</span>
                                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">참여하기</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Schedule Block */}
                        {block.type === 'schedule' && (
                          <div className="flex items-center gap-3 bg-blue-50/70 p-3 rounded-2xl border border-blue-100 text-xs">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-700">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-900">{block.scheduleTitle}</h4>
                              <p className="text-[11px] text-blue-700">일시: {block.scheduleDate}</p>
                            </div>
                          </div>
                        )}

                        {/* Code Block */}
                        {block.type === 'code' && (
                          <div className="bg-gray-900 text-gray-100 p-3.5 rounded-2xl font-mono text-xs overflow-x-auto">
                            <div className="text-[10px] text-gray-400 mb-1 font-sans">{block.codeLanguage?.toUpperCase()}</div>
                            <pre>{block.content}</pre>
                          </div>
                        )}

                        {/* Math Formula Block */}
                        {block.type === 'math' && (
                          <div className="bg-teal-50/70 p-3 rounded-2xl border border-teal-200 text-center font-serif text-xs font-bold text-teal-900">
                            수식: {block.content}
                          </div>
                        )}

                        {/* Link Block */}
                        {block.type === 'link' && (
                          <a
                            href={block.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-indigo-50/50 rounded-xl border border-gray-200 hover:border-indigo-300 text-xs text-indigo-600 font-semibold"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span className="truncate">{block.content || block.url}</span>
                          </a>
                        )}

                        {/* Table Block */}
                        {block.type === 'table' && block.tableData && (
                          <div className="overflow-x-auto my-2">
                            <table className="w-full text-xs text-left border-collapse border border-gray-200 rounded-xl overflow-hidden">
                              <tbody>
                                {block.tableData.map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx === 0 ? 'bg-gray-100 font-bold text-gray-800' : 'border-t border-gray-100'}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2 border-r border-gray-200 last:border-r-0">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reaction & Action Bar */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          onOpenLogin();
                          return;
                        }
                        onToggleLike(post.id);
                      }}
                      className={`flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                        isLikedByMe ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'
                      }`}
                    >
                      <span className="text-lg leading-none">{isLikedByMe ? '♥' : '♡'}</span>
                      <span className="text-xs font-bold text-gray-600">{likeCount}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <span className="text-lg leading-none">💬</span>
                      <span className="text-xs font-bold text-gray-600">{postComments.length}</span>
                    </button>
                  </div>

                  {post.likedBy && post.likedBy.length > 0 && (
                    <span className="text-[11px] text-gray-400 hidden sm:inline">
                      ❤️ {post.likedBy.slice(0, 2).join(', ')}
                      {post.likedBy.length > 2 ? ` 외 ${post.likedBy.length - 2}명` : ''}
                    </span>
                  )}
                </div>

                {/* Expandable Comments Drawer */}
                {(isExpanded || postComments.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                    {postComments.map((comment) => {
                      const isCommentAdmin = comment.isAdmin || comment.author.includes('선생님') || comment.author.includes('관리자');
                      const canDeleteComment = user && (user.name === comment.author || isUserAdmin);

                      return (
                        <div
                          key={comment.id}
                          className={`p-2.5 rounded-2xl text-xs flex items-start justify-between gap-2 border ${
                            isCommentAdmin
                              ? 'bg-amber-50/80 border-amber-200/70'
                              : 'bg-gray-50/80 border-gray-100'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-gray-800 mr-1.5 flex-inline items-center gap-1">
                              {isCommentAdmin && <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md font-bold mr-1">👑 담임선생님</span>}
                              {comment.author}:
                            </span>
                            <span className="text-gray-600">{comment.text}</span>
                            {comment.date && (
                              <span className="text-[10px] text-gray-400 ml-2">{comment.date}</span>
                            )}
                          </div>
                          {canDeleteComment && (
                            <button
                              onClick={() => {
                                if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
                                  onDeleteComment(comment.id);
                                }
                              }}
                              className="text-gray-300 hover:text-red-500 p-0.5 cursor-pointer shrink-0"
                              title={user?.name === comment.author ? '댓글 삭제' : '관리자 권한으로 삭제'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Comment input form */}
                    {user ? (
                      <form
                        onSubmit={(e) => handleCommentSubmit(post.id, e)}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={commentInputs[String(post.id)] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [String(post.id)]: e.target.value
                            }))
                          }
                          placeholder={`${user.name}(으)로 따뜻한 댓글 남기기...`}
                          className="flex-1 bg-gray-50 focus:bg-white px-3.5 py-2 rounded-xl text-xs text-gray-700 placeholder-gray-400 border border-gray-200 focus:border-[#92A8D1] outline-none"
                          required
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-xl text-white shadow-xs cursor-pointer active:scale-95"
                          style={{ backgroundColor: '#92A8D1' }}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <div className="text-center pt-2">
                        <button
                          onClick={onOpenLogin}
                          className="text-xs text-[#92A8D1] font-semibold hover:underline cursor-pointer"
                        >
                          로그인하고 친구에게 댓글 남기기 ✨
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
