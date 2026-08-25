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
  Code2,
  CornerDownRight,
  Reply,
  X,
  Crown,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Post, Comment, Student, Category, RichBlock } from '../types';

interface BlogListProps {
  posts: Post[];
  comments: Comment[];
  categories?: Category[];
  students?: Student[];
  user: Student | null;
  filterUser?: string | null;
  filterTag?: string | null;
  onClearFilter?: () => void;
  onAddPost: (content: string, category: string, emoji: string, title?: string, blocks?: RichBlock[]) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost: (postId: number | string) => void;
  onToggleLike: (postId: number | string) => void;
  onAddComment: (postId: number | string, text: string, parentId?: number | string, replyToAuthor?: string) => void;
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
  students = [],
  user,
  filterUser,
  filterTag,
  onClearFilter,
  onAddPost,
  onEditPost,
  onDeletePost,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onOpenLogin,
  onOpenWrite
}) => {
  const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORY_ITEMS;

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null); // commentId
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Password Verification Modal State
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    post: Post | null;
    action: 'edit' | 'delete' | null;
  }>({
    isOpen: false,
    post: null,
    action: null
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const openPasswordModal = (post: Post, action: 'edit' | 'delete') => {
    setPasswordModal({
      isOpen: true,
      post,
      action
    });
    setPasswordInput('');
    setPasswordError(null);
    setShowPasswordText(false);
  };

  const closePasswordModal = () => {
    setPasswordModal({
      isOpen: false,
      post: null,
      action: null
    });
    setPasswordInput('');
    setPasswordError(null);
  };

  const handlePasswordVerifyAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModal.post || !passwordModal.action) return;

    const post = passwordModal.post;
    const enteredPw = passwordInput.trim();

    if (!enteredPw) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    // Check author password in students list
    const authorStudent = students.find(
      (s) => s.name.trim() === post.author.trim()
    );

    const isTeacherAuthor =
      post.author.includes('선생님') ||
      post.author.includes('관리자') ||
      post.isAdmin;

    const expectedPw = isTeacherAuthor
      ? '0526'
      : authorStudent
      ? String(authorStudent.pw).trim()
      : null;

    // Admin master password '0526' always works
    const isMasterAdminPw = enteredPw === '0526';
    const isMatch = (expectedPw && enteredPw === expectedPw) || isMasterAdminPw;

    if (!isMatch) {
      setPasswordError('비밀번호가 일치하지 않습니다. 비밀번호를 다시 확인해주세요.');
      return;
    }

    // Success!
    const targetAction = passwordModal.action;
    const targetPost = passwordModal.post;
    closePasswordModal();

    if (targetAction === 'delete') {
      onDeletePost(targetPost.id);
      setActionSuccessToast(`'${targetPost.title || targetPost.author + '님의 글'}'이(가) 정상적으로 삭제되었습니다.`);
      setTimeout(() => setActionSuccessToast(null), 3000);
    } else if (targetAction === 'edit') {
      if (onEditPost) {
        onEditPost(targetPost);
      }
    }
  };

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

  const handleReplySubmit = (postId: number | string, parentComment: Comment, e: React.FormEvent) => {
    e.preventDefault();
    const text = replyInputs[String(parentComment.id)];
    if (!text || !text.trim()) return;
    onAddComment(postId, text.trim(), parentComment.id, parentComment.author);
    setReplyInputs((prev) => ({ ...prev, [String(parentComment.id)]: '' }));
    setActiveReplyId(null);
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

  const isHtmlContent = (str: string) => /<[a-z][\s\S]*>/i.test(str);

  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    if (isHtmlContent(content)) {
      return (
        <div 
          className="text-sm text-gray-700 leading-relaxed mb-4 space-y-2 prose-sm max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return (
      <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap break-words">
        {content}
      </p>
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Filter Indicator if any */}
      {(filterUser || filterTag) && (
        <div className="bg-white px-5 py-3 rounded-2xl border border-[#92A8D1]/40 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B84B5]">
              {filterUser ? `👤 ${filterUser} 학생의 글` : `🏷️ #${filterTag} 태그 검색`}
            </span>
            <span className="text-xs text-gray-400">({filteredPosts.length}개의 글)</span>
          </div>
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer underline"
            >
              전체 글 보기
            </button>
          )}
        </div>
      )}

      {/* Category Filter Pills Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategoryFilter === 'all'
              ? 'bg-gray-800 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ✨ 전체보기 ({posts.length})
        </button>
        {activeCategories.map((cat) => {
          const count = posts.filter((p) => p.category === cat.name).length;
          const isSelected = selectedCategoryFilter === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
              style={{
                backgroundColor: isSelected ? cat.color || '#F7CAC9' : undefined
              }}
            >
              <span>{cat.emoji || '🌱'}</span>
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Write Trigger Card for students/teachers */}
      {user && onOpenWrite && (
        <div className="bg-white p-4 sm:p-5 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
              user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-[#F7CAC9]/30 text-[#E89E9D]'
            }`}>
              {user.role === 'admin' ? '👑' : user.name.slice(0, 1)}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">
                {user.role === 'admin' ? '선생님 관리자님, 새로운 공지나 학급 이야기를 나눠보세요!' : `${user.name} 학생, 오늘 있었던 특별한 일을 블로그에 기록해보세요!`}
              </p>
              <p className="text-[11px] text-gray-400">
                스마트에디터로 사진, 스티커, 투표, 수식, 글자 색상/강조를 추가할 수 있어요.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenWrite}
            className="px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
            style={{ backgroundColor: user.role === 'admin' ? '#92A8D1' : '#F7CAC9' }}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>새 글 쓰기</span>
          </button>
        </div>
      )}

      {/* Post List Stream */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-2xl mb-3">
              📝
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">작성된 게시글이 없습니다</h3>
            <p className="text-xs text-gray-400 mb-6">
              {filterUser
                ? `${filterUser} 학생이 아직 작성한 글이 없습니다.`
                : '오늘 우리 반에서 있었던 이야기나 배운 점을 첫 번째로 공유해보세요!'}
            </p>
            {user ? (
              onOpenWrite && (
                <button
                  onClick={onOpenWrite}
                  className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm cursor-pointer"
                  style={{ backgroundColor: '#F7CAC9' }}
                >
                  첫 번째 글 작성하기
                </button>
              )
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm cursor-pointer"
                style={{ backgroundColor: '#92A8D1' }}
              >
                로그인하고 글 작성하기
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => {
            const postComments = comments.filter((c) => String(c.postId) === String(post.id));
            const rootComments = postComments.filter((c) => !c.parentId);
            const isLikedByMe = user && post.likedBy && post.likedBy.includes(user.name);
            const likeCount = post.likes || (post.likedBy ? post.likedBy.length : 0);
            const isExpanded = expandedComments[String(post.id)];
            const catMeta = getCatMeta(post.category);
            const isMyPost = user && user.name === post.author;
            const isUserAdmin = user?.role === 'admin' || user?.name.includes('선생님') || user?.name.includes('관리자');
            const isPostAdmin = post.isAdmin || post.author.includes('선생님') || post.author.includes('관리자');
            const canDeletePost = isMyPost || isUserAdmin;

            return (
              <article
                key={post.id}
                id={`post-card-${post.id}`}
                className={`p-6 sm:p-7 rounded-[32px] shadow-sm border transition-all ${
                  isPostAdmin
                    ? 'bg-gradient-to-br from-amber-50/40 via-white to-white border-amber-200/80 shadow-amber-50/50'
                    : 'bg-white border-gray-100'
                }`}
              >
                {/* Author Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs ${
                        isPostAdmin
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#F7CAC9]/30 text-[#E89E9D]'
                      }`}
                    >
                      {isPostAdmin ? '👑' : post.author.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-gray-800">
                          {post.author}
                        </p>
                        {isPostAdmin && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" />
                            <span>담임선생님</span>
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

                  {/* Post Action Buttons: Edit and Delete (Protected by Password Verification) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openPasswordModal(post, 'edit')}
                      className="flex items-center gap-1 text-gray-500 hover:text-[#6B84B5] bg-gray-50 hover:bg-[#92A8D1]/15 px-2.5 py-1.5 rounded-xl border border-gray-150 transition-all text-xs font-bold cursor-pointer active:scale-95 shadow-2xs"
                      title="비밀번호 확인 후 글 수정"
                    >
                      <PenLine className="w-3.5 h-3.5 text-[#6B84B5]" />
                      <span>수정</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openPasswordModal(post, 'delete')}
                      className="flex items-center gap-1 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-2.5 py-1.5 rounded-xl border border-gray-150 transition-all text-xs font-bold cursor-pointer active:scale-95 shadow-2xs"
                      title="비밀번호 확인 후 글 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>삭제</span>
                    </button>
                  </div>
                </div>

                {/* Post Title if present */}
                {post.title && (
                  <h3 className="text-base sm:text-lg font-black text-gray-800 mb-2.5 tracking-tight">
                    {post.title}
                  </h3>
                )}

                {/* Body Content with formatted HTML styling */}
                {renderFormattedContent(post.content)}

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
                              <div className="text-center text-gray-400 text-xs tracking-widest">~ • 🌸 5-3 • ~</div>
                            )}
                            {(!block.dividerStyle || block.dividerStyle === 'solid') && (
                              <div className="border-t border-gray-100" />
                            )}
                          </div>
                        )}

                        {/* Sticker Block */}
                        {block.type === 'sticker' && (
                          <div className="text-center py-2">
                            <span className="text-5xl inline-block transform hover:scale-110 transition-transform cursor-pointer">
                              {block.sticker}
                            </span>
                          </div>
                        )}

                        {/* Place Block */}
                        {block.type === 'place' && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-800">📍 {block.placeName}</h4>
                              {block.placeDesc && <p className="text-[11px] text-gray-500 mt-0.5">{block.placeDesc}</p>}
                            </div>
                          </div>
                        )}

                        {/* Poll Block */}
                        {block.type === 'poll' && (
                          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                              <Vote className="w-4 h-4 text-purple-600" />
                              <span>학급 투표: {block.pollQuestion}</span>
                            </div>
                            <div className="space-y-1.5 pt-1">
                              {block.pollOptions?.map((opt) => (
                                <div
                                  key={opt.id}
                                  className="px-3 py-2 rounded-xl bg-white border border-purple-100 text-xs text-gray-700 flex justify-between items-center"
                                >
                                  <span>{opt.text}</span>
                                  <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                    투표참여
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Schedule Block */}
                        {block.type === 'schedule' && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-blue-600">📅 {block.scheduleDate}</p>
                              <h4 className="text-xs font-bold text-gray-800">{block.scheduleTitle}</h4>
                            </div>
                          </div>
                        )}

                        {/* Code Block */}
                        {block.type === 'code' && (
                          <div className="rounded-2xl bg-slate-900 p-4 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner">
                            <div className="text-[10px] text-slate-400 mb-1 font-bold tracking-wider uppercase">
                              💻 {block.codeLanguage || 'Code'}
                            </div>
                            <pre className="text-emerald-400">{block.content}</pre>
                          </div>
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

                {/* Expandable Comments & Replies Thread Drawer */}
                {(isExpanded || postComments.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-gray-50 space-y-3">
                    {/* Root Comments List */}
                    {rootComments.map((comment) => {
                      const isCommentAdmin = comment.isAdmin || comment.author.includes('선생님') || comment.author.includes('관리자');
                      const canDeleteComment = user && (user.name === comment.author || isUserAdmin);
                      const isReplyingThis = activeReplyId === String(comment.id);
                      const childReplies = postComments.filter((c) => String(c.parentId) === String(comment.id));

                      return (
                        <div key={comment.id} className="space-y-2">
                          {/* Parent Comment Card */}
                          <div
                            className={`p-3 rounded-2xl text-xs border transition-all ${
                              isCommentAdmin
                                ? 'bg-amber-50/80 border-amber-200/70'
                                : 'bg-gray-50/80 border-gray-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isCommentAdmin && (
                                    <span className="text-[10px] text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                                      👑 담임선생님
                                    </span>
                                  )}
                                  <span className="font-bold text-gray-800">{comment.author}</span>
                                  {comment.date && (
                                    <span className="text-[10px] text-gray-400">{comment.date}</span>
                                  )}
                                </div>
                                <p className="text-gray-700 mt-1 leading-relaxed break-words">
                                  {comment.text}
                                </p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {user && (
                                  <button
                                    onClick={() => {
                                      setActiveReplyId(isReplyingThis ? null : String(comment.id));
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                      isReplyingThis
                                        ? 'bg-[#92A8D1] text-white'
                                        : 'bg-white hover:bg-gray-200 text-gray-600 border border-gray-200'
                                    }`}
                                  >
                                    <Reply className="w-3 h-3" />
                                    <span>{isReplyingThis ? '답글 닫기' : '답글'}</span>
                                  </button>
                                )}

                                {canDeleteComment && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm('이 댓글을 삭제하시겠습니까? (하위 답글도 함께 정리됩니다)')) {
                                        onDeleteComment(comment.id);
                                        // Also delete child replies
                                        childReplies.forEach((cr) => onDeleteComment(cr.id));
                                      }
                                    }}
                                    className="text-gray-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title={user?.name === comment.author ? '댓글 삭제' : '관리자 권한으로 삭제'}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Nested Replies (대댓글) List */}
                          {childReplies.length > 0 && (
                            <div className="ml-4 sm:ml-7 pl-3 border-l-2 border-[#92A8D1]/40 space-y-2">
                              {childReplies.map((reply) => {
                                const isReplyAdmin = reply.isAdmin || reply.author.includes('선생님') || reply.author.includes('관리자');
                                const canDeleteReply = user && (user.name === reply.author || isUserAdmin);

                                return (
                                  <div
                                    key={reply.id}
                                    className={`p-2.5 rounded-2xl text-xs border flex items-start justify-between gap-2 ${
                                      isReplyAdmin
                                        ? 'bg-amber-50/90 border-amber-200/80'
                                        : 'bg-white border-gray-100 shadow-2xs'
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <CornerDownRight className="w-3 h-3 text-[#92A8D1] shrink-0" />
                                        {isReplyAdmin && (
                                          <span className="text-[10px] text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded-md font-bold">
                                            👑 담임선생님
                                          </span>
                                        )}
                                        <span className="font-bold text-gray-800">{reply.author}</span>
                                        {reply.replyToAuthor && (
                                          <span className="text-[10px] font-bold text-[#6B84B5] bg-[#92A8D1]/20 px-1.5 py-0.2 rounded-md">
                                            @{reply.replyToAuthor}
                                          </span>
                                        )}
                                        {reply.date && (
                                          <span className="text-[10px] text-gray-400">{reply.date}</span>
                                        )}
                                      </div>
                                      <p className="text-gray-700 mt-1 pl-4 leading-relaxed break-words">
                                        {reply.text}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      {user && (
                                        <button
                                          onClick={() => {
                                            setActiveReplyId(String(comment.id));
                                            setReplyInputs((prev) => ({
                                              ...prev,
                                              [String(comment.id)]: `@${reply.author} `
                                            }));
                                          }}
                                          className="text-gray-400 hover:text-gray-700 p-1 text-[10px] cursor-pointer"
                                          title="답글에 답글달기"
                                        >
                                          <Reply className="w-3 h-3" />
                                        </button>
                                      )}
                                      {canDeleteReply && (
                                        <button
                                          onClick={() => {
                                            if (window.confirm('이 답글을 삭제하시겠습니까?')) {
                                              onDeleteComment(reply.id);
                                            }
                                          }}
                                          className="text-gray-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                          title={user?.name === reply.author ? '답글 삭제' : '관리자 권한으로 삭제'}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Inline Reply Input Box (when activeReplyId === comment.id) */}
                          {isReplyingThis && user && (
                            <form
                              onSubmit={(e) => handleReplySubmit(post.id, comment, e)}
                              className="ml-4 sm:ml-7 pl-3 border-l-2 border-[#92A8D1] space-y-1.5 animate-in fade-in duration-200"
                            >
                              <div className="flex items-center justify-between text-[11px] text-[#6B84B5] font-bold px-1">
                                <span>↳ {comment.author} 님에게 답글 작성</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveReplyId(null)}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer flex items-center gap-0.5"
                                >
                                  <X className="w-3 h-3" />
                                  <span>취소</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  autoFocus
                                  value={replyInputs[String(comment.id)] || ''}
                                  onChange={(e) =>
                                    setReplyInputs((prev) => ({
                                      ...prev,
                                      [String(comment.id)]: e.target.value
                                    }))
                                  }
                                  placeholder={`${user.name}(으)로 ${comment.author} 님에게 답글 작성...`}
                                  className="flex-1 bg-white px-3.5 py-2 rounded-xl text-xs text-gray-700 placeholder-gray-400 border border-[#92A8D1] focus:ring-1 focus:ring-[#92A8D1] outline-none shadow-xs"
                                  required
                                />
                                <button
                                  type="submit"
                                  className="px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 flex items-center gap-1 shrink-0"
                                  style={{ backgroundColor: '#92A8D1' }}
                                >
                                  <Send className="w-3 h-3" />
                                  <span>등록</span>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}

                    {/* New Root Comment Form */}
                    {user ? (
                      <form
                        onSubmit={(e) => handleCommentSubmit(post.id, e)}
                        className="flex items-center gap-2 pt-2"
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
                          className="flex-1 bg-gray-50 focus:bg-white px-3.5 py-2.5 rounded-xl text-xs text-gray-700 placeholder-gray-400 border border-gray-200 focus:border-[#92A8D1] outline-none transition-all shadow-2xs"
                          required
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                          style={{ backgroundColor: '#92A8D1' }}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>댓글</span>
                        </button>
                      </form>
                    ) : (
                      <div className="text-center pt-2">
                        <button
                          onClick={onOpenLogin}
                          className="text-xs text-[#92A8D1] font-semibold hover:underline cursor-pointer"
                        >
                          로그인하고 친구에게 댓글과 답글 남기기 ✨
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

      {/* Action Success Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom duration-200 border border-gray-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* Password Verification Modal (수정 및 삭제 본인 비밀번호 확인 모달) */}
      {passwordModal.isOpen && passwordModal.post && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePasswordModal();
            }
          }}
        >
          <div className="bg-white rounded-[32px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 space-y-4.5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
                    passwordModal.action === 'edit'
                      ? 'bg-[#92A8D1]/20 text-[#6B84B5]'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {passwordModal.action === 'edit' ? (
                    <PenLine className="w-5 h-5" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                    {passwordModal.action === 'edit' ? '게시글 수정' : '게시글 삭제'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    본인 확인을 위해 비밀번호를 입력해주세요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Post Info Preview */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-150 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                <span className="flex items-center gap-1 text-gray-700">
                  <span className="font-bold text-gray-900">👤 {passwordModal.post.author}</span> 학생의 글
                </span>
                <span className="text-[10px] text-gray-400">{passwordModal.post.date}</span>
              </div>
              <p className="text-xs font-bold text-gray-800 line-clamp-1">
                {passwordModal.post.title || (passwordModal.post.content ? passwordModal.post.content.replace(/<[^>]*>?/gm, '').slice(0, 35) + '...' : '제목 없음')}
              </p>
            </div>

            {/* Explanatory Guide */}
            <p className="text-xs text-gray-600 leading-relaxed">
              작성자 <strong className="text-gray-900 font-bold">[{passwordModal.post.author}]</strong> 학생의 로그인 비밀번호(또는 선생님 관리자 비밀번호)를 입력하면 글을 {passwordModal.action === 'edit' ? '수정할 수 있는 스마트에디터가 열립니다.' : '즉시 삭제합니다.'}
            </p>

            {/* Password Input Form */}
            <form onSubmit={handlePasswordVerifyAndProceed} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    비밀번호 입력
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    선생님(0526) 또는 학생 본인 번호/비번
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="비밀번호를 입력하세요"
                    className={`w-full px-4 py-3 bg-gray-50 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 border outline-none transition-all pr-11 shadow-2xs ${
                      passwordError
                        ? 'border-red-400 focus:ring-2 focus:ring-red-300'
                        : 'border-gray-200 focus:border-[#92A8D1] focus:ring-2 focus:ring-[#92A8D1]/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg cursor-pointer"
                    title={showPasswordText ? '비밀번호 가리기' : '비밀번호 보기'}
                  >
                    {showPasswordText ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {passwordError && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${
                    passwordModal.action === 'edit'
                      ? 'bg-[#92A8D1] hover:bg-[#7d97c4]'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {passwordModal.action === 'edit' ? (
                    <>
                      <PenLine className="w-3.5 h-3.5" />
                      <span>비밀번호 확인 후 수정</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>비밀번호 확인 후 삭제</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
