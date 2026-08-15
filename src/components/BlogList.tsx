import React, { useState } from 'react';
import { 
  Trash2, 
  Send, 
  Tag, 
  Smile, 
  Sparkles,
  MessageCircle,
  Heart
} from 'lucide-react';
import { Post, Comment, Student } from '../types';

interface BlogListProps {
  posts: Post[];
  comments: Comment[];
  user: Student | null;
  filterUser?: string | null;
  filterTag?: string | null;
  onClearFilter?: () => void;
  onAddPost: (content: string, category: Post['category'], emoji: string) => void;
  onDeletePost: (postId: number | string) => void;
  onToggleLike: (postId: number | string) => void;
  onAddComment: (postId: number | string, text: string) => void;
  onDeleteComment: (commentId: number | string) => void;
  onOpenLogin: () => void;
}

const CATEGORIES: Post['category'][] = ['일상', '배움기록', '독서', '질문', '칭찬'];
const EMOJI_OPTIONS = ['📝', '✨', '🪐', '📚', '🎮', '🎨', '⚽', '🌿', '💡', '💖'];

export const BlogList: React.FC<BlogListProps> = ({
  posts,
  comments,
  user,
  filterUser,
  filterTag,
  onClearFilter,
  onAddPost,
  onDeletePost,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onOpenLogin
}) => {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Post['category']>('일상');
  const [selectedEmoji, setSelectedEmoji] = useState('📝');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const filteredPosts = posts
    .filter((p) => {
      if (filterUser && p.author !== filterUser) return false;
      if (filterTag && !p.content.includes(filterTag) && p.category !== filterTag) return false;
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
      return true;
    })
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddPost(content.trim(), selectedCategory, selectedEmoji);
    setContent('');
  };

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
        {CATEGORIES.map((cat) => {
          const count = posts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat || 'all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategoryFilter === cat
                  ? 'bg-[#F7CAC9] text-white shadow-xs'
                  : 'bg-white text-gray-500 hover:bg-[#F7CAC9]/20 border border-gray-100'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Sleek Post Creator */}
      {user ? (
        <div className="bg-white p-5 rounded-[32px] shadow-sm border-2 border-dashed border-[#F7CAC9] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-600">
              오늘은 어떤 일이 있었나요? {selectedEmoji}
            </h4>
            <span className="text-xs text-gray-400 font-medium">5학년 3반 {user.name}</span>
          </div>

          <form onSubmit={handlePostSubmit} className="space-y-3">
            {/* Quick Category & Emoji selectors */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-gray-50/70 rounded-2xl border border-gray-100 text-xs">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#F7CAC9] text-white'
                        : 'bg-white text-gray-500 hover:bg-[#F7CAC9]/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-gray-400" />
                {EMOJI_OPTIONS.slice(0, 6).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setSelectedEmoji(em)}
                    className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-all ${
                      selectedEmoji === em ? 'bg-white shadow-xs scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                id="post-content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                placeholder="즐거웠던 기억, 배움 기록, 친구에게 전하고 싶은 이야기를 남겨보세요..."
                className="flex-grow bg-gray-50 focus:bg-white rounded-2xl p-4 text-sm text-gray-700 placeholder-gray-400 border border-gray-100 focus:border-[#F7CAC9] outline-none transition-all resize-none"
                required
              />
              <button
                id="post-submit-btn"
                type="submit"
                className="sm:w-32 py-3 sm:py-0 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: '#F7CAC9' }}
              >
                작성하기
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-[32px] shadow-sm border-2 border-dashed border-[#F7CAC9]/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F7CAC9]/20 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">오늘은 어떤 일이 있었나요? 📝</p>
              <p className="text-xs text-gray-400">로그인 후 나만의 즐거운 하루를 기록해보세요</p>
            </div>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: '#92A8D1' }}
          >
            로그인하기
          </button>
        </div>
      )}

      {/* Posts Feed */}
      <div className="flex flex-col gap-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 text-center">
            <p className="text-2xl mb-2">🍃</p>
            <p className="text-sm font-bold text-gray-700 mb-1">등록된 게시글이 없습니다</p>
            <p className="text-xs text-gray-400">첫 번째 이야기를 작성해보세요!</p>
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const postComments = comments.filter((c) => String(c.postId) === String(post.id));
            const isLikedByMe = user && post.likedBy && post.likedBy.includes(user.name);
            const likeCount = post.likes || 0;
            const isMyPost = user && post.author === user.name;
            const isEven = idx % 2 === 0;
            const avatarBg = isEven ? 'bg-[#92A8D1]/20 text-[#92A8D1]' : 'bg-[#F7CAC9]/20 text-[#E89E9D]';
            const categoryColor = isEven ? 'text-[#92A8D1]' : 'text-[#E89E9D]';
            const isExpanded = expandedComments[String(post.id)] ?? false;

            return (
              <article
                key={post.id}
                id={`post-card-${post.id}`}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 shrink-0 transition-all hover:border-[#F7CAC9]/40"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center font-bold text-sm`}
                    >
                      {post.author.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {post.author}
                        <span className="text-[10px] font-normal text-gray-400 ml-2">{post.date}</span>
                      </p>
                      <p className={`text-xs font-medium ${categoryColor}`}>
                        {post.category || '일상'} • {post.emoji || '📝'}
                      </p>
                    </div>
                  </div>

                  {isMyPost && (
                    <button
                      onClick={() => {
                        if (window.confirm('이 글을 삭제하시겠습니까?')) {
                          onDeletePost(post.id);
                        }
                      }}
                      className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                      title="글 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Body Content */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

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
                    {postComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50/80 p-2.5 rounded-2xl text-xs flex items-start justify-between gap-2 border border-gray-100"
                      >
                        <div>
                          <span className="font-bold text-gray-800 mr-1.5">{comment.author}:</span>
                          <span className="text-gray-600">{comment.text}</span>
                          {comment.date && (
                            <span className="text-[10px] text-gray-400 ml-2">{comment.date}</span>
                          )}
                        </div>
                        {user && user.name === comment.author && (
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-gray-300 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}

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
                          className="text-xs text-[#92A8D1] font-semibold hover:underline"
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
