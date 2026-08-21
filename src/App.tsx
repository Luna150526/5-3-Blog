import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { LoginCard } from './components/LoginCard';
import { BlogList } from './components/BlogList';
import { BlogEditor } from './components/BlogEditor';
import { ControlPanel } from './components/ControlPanel';
import { StudentDirectory } from './components/StudentDirectory';
import { Database, Student, ViewType, Post, Comment, Category, NoticeItem, GalleryItem, RichBlock } from './types';
import { INITIAL_DB, DEFAULT_CATEGORIES, DEFAULT_NOTICES, DEFAULT_GALLERY } from './data/initialData';
import { Sparkles, Megaphone, Heart, Crown } from 'lucide-react';

const LOCAL_STORAGE_DB_KEY = 'class_5_3_db_v4';
const LOCAL_STORAGE_GAS_KEY = 'class_gas_url';
const LOCAL_STORAGE_USER_KEY = 'class_logged_user';

export default function App() {
  // Navigation View: 'home' | 'write' | 'myPosts' | 'students' | 'control'
  const [view, setView] = useState<ViewType>('home');
  const [gasUrl, setGasUrl] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_GAS_KEY) || '';
  });

  // Local or Synced Database State
  const [db, setDb] = useState<Database>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.Students) && Array.isArray(parsed.Posts)) {
          return {
            ...parsed,
            Categories: Array.isArray(parsed.Categories) && parsed.Categories.length > 0
              ? parsed.Categories
              : DEFAULT_CATEGORIES,
            Notices: Array.isArray(parsed.Notices) && parsed.Notices.length > 0
              ? parsed.Notices
              : DEFAULT_NOTICES,
            Gallery: Array.isArray(parsed.Gallery) && parsed.Gallery.length > 0
              ? parsed.Gallery
              : DEFAULT_GALLERY
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached database, loading initial data', e);
    }
    return INITIAL_DB;
  });

  // Logged-in Student or Teacher Admin
  const [user, setUser] = useState<Student | null>(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [filterStudentName, setFilterStudentName] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const categories = db.Categories && db.Categories.length > 0 ? db.Categories : DEFAULT_CATEGORIES;
  const notices = db.Notices && db.Notices.length > 0 ? db.Notices : DEFAULT_NOTICES;
  const gallery = db.Gallery && db.Gallery.length > 0 ? db.Gallery : DEFAULT_GALLERY;

  const isUserAdmin = user?.role === 'admin' || user?.name.includes('선생님') || user?.name.includes('관리자');

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [db]);

  // Fetch data from GAS URL if set
  const fetchData = useCallback(async () => {
    if (!gasUrl) return;
    setLoading(true);
    try {
      const response = await fetch(gasUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && (data.Students || data.Posts)) {
          const parsedPosts = Array.isArray(data.Posts)
            ? data.Posts.map((p: any) => ({
                ...p,
                likedBy: typeof p.likedBy === 'string' ? (() => { try { return JSON.parse(p.likedBy); } catch { return []; } })() : (Array.isArray(p.likedBy) ? p.likedBy : []),
                blocks: typeof p.blocks === 'string' ? (() => { try { return JSON.parse(p.blocks); } catch { return []; } })() : (Array.isArray(p.blocks) ? p.blocks : [])
              }))
            : [];

          setDb((prev) => ({
            Students: Array.isArray(data.Students) && data.Students.length > 0 ? data.Students : prev.Students,
            Posts: parsedPosts.length > 0 ? parsedPosts : prev.Posts,
            Comments: Array.isArray(data.Comments) ? data.Comments : prev.Comments,
            Categories: Array.isArray(data.Categories) && data.Categories.length > 0 ? data.Categories : prev.Categories,
            Notices: Array.isArray(data.Notices) && data.Notices.length > 0 ? data.Notices : prev.Notices,
            Gallery: Array.isArray(data.Gallery) && data.Gallery.length > 0 ? data.Gallery : prev.Gallery,
            Settings: Array.isArray(data.Settings) ? data.Settings : prev.Settings
          }));
        }
      }
    } catch (e) {
      console.warn('데이터 로드 실패 또는 CORS 정책으로 인해 로컬 저장소 모드를 사용합니다:', e);
    } finally {
      setLoading(false);
    }
  }, [gasUrl]);

  useEffect(() => {
    if (gasUrl) {
      fetchData();
    }
  }, [gasUrl, fetchData]);

  // API Call to GAS backend with local immediate update
  const apiCall = async (type: string, action: string, data: any) => {
    setLoading(true);
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, action, data })
        });
      } catch (e) {
        console.warn('GAS POST call failed, continuing with local state', e);
      }
    }
    setLoading(false);
  };

  // Login Handler (Students & Admin Teacher)
  const handleLogin = (name: string, pw: string): boolean => {
    // 1. Admin Login check
    if (
      (name.trim() === '선생님 (관리자)' ||
        name.trim() === '선생님' ||
        name.trim() === '관리자' ||
        name.trim() === '담임선생님' ||
        name.trim().toLowerCase() === 'admin') &&
      pw.trim() === '0526'
    ) {
      const adminStudent: Student = {
        id: 'admin_teacher',
        name: '선생님 (관리자)',
        pw: '0526',
        grade: '5',
        class: '3',
        bio: '5학년 3반 담임교사 / 블로그 총괄 관리자',
        role: 'admin'
      };
      setUser(adminStudent);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(adminStudent));
      return true;
    }

    // 2. Student Login check
    const student = db.Students.find(
      (s) => s.name.trim() === name.trim() && String(s.pw).trim() === String(pw).trim()
    );
    if (student) {
      setUser(student);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(student));
      return true;
    }
    return false;
  };

  const handleLoginAsAdmin = () => {
    const adminStudent: Student = {
      id: 'admin_teacher',
      name: '선생님 (관리자)',
      pw: '0526',
      grade: '5',
      class: '3',
      bio: '5학년 3반 담임교사 / 블로그 총괄 관리자',
      role: 'admin'
    };
    setUser(adminStudent);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(adminStudent));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    if (view === 'write' || view === 'myPosts') {
      setView('home');
    }
  };

  // Add new post (supports students and teacher admin)
  const handleAddPost = (
    content: string,
    category: string,
    emoji: string,
    title?: string,
    blocks?: RichBlock[]
  ) => {
    if (!user) return;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${
      now.getHours() >= 12 ? '오후' : '오전'
    } ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isAdminAuthor = user.role === 'admin' || user.name.includes('선생님') || user.name.includes('관리자');

    const newPost: Post = {
      id: Date.now(),
      author: user.name,
      title: title || undefined,
      content,
      date: formattedDate,
      category: category || (isAdminAuthor ? '공지' : '일상'),
      likes: 0,
      likedBy: [],
      emoji: emoji || (isAdminAuthor ? '👑' : '📝'),
      blocks: blocks || [],
      isAdmin: isAdminAuthor
    };

    setDb((prev) => ({
      ...prev,
      Posts: [newPost, ...prev.Posts]
    }));

    apiCall('Posts', 'add', newPost);
  };

  // Publish from BlogEditor
  const handlePublishFromEditor = (
    title: string,
    content: string,
    category: string,
    emoji: string,
    blocks: RichBlock[]
  ) => {
    handleAddPost(content, category, emoji, title, blocks);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete post (Students delete their own, Admin can delete any)
  const handleDeletePost = (postId: number | string) => {
    setDb((prev) => ({
      ...prev,
      Posts: prev.Posts.filter((p) => String(p.id) !== String(postId)),
      Comments: prev.Comments.filter((c) => String(c.postId) !== String(postId))
    }));
  };

  // Toggle Like
  const handleToggleLike = (postId: number | string) => {
    if (!user) return;
    setDb((prev) => {
      const updatedPosts = prev.Posts.map((p) => {
        if (String(p.id) === String(postId)) {
          const likedBy = p.likedBy || [];
          const isLiked = likedBy.includes(user.name);
          const newLikedBy = isLiked
            ? likedBy.filter((n) => n !== user.name)
            : [...likedBy, user.name];
          const newLikes = Math.max(0, (p.likes || 0) + (isLiked ? -1 : 1));
          return {
            ...p,
            likes: newLikes,
            likedBy: newLikedBy
          };
        }
        return p;
      });
      return { ...prev, Posts: updatedPosts };
    });
  };

  // Add Comment (with nested reply support)
  const handleAddComment = (
    postId: number | string,
    text: string,
    parentId?: number | string | null,
    replyToAuthor?: string
  ) => {
    if (!user) return;
    const now = new Date();
    const formattedTime = `${now.getHours() >= 12 ? '오후' : '오전'} ${now.getHours() % 12 || 12}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const isAdminAuthor = user.role === 'admin' || user.name.includes('선생님') || user.name.includes('관리자');

    const newComment: Comment = {
      id: Date.now(),
      postId,
      author: user.name,
      text,
      date: formattedTime,
      isAdmin: isAdminAuthor,
      parentId: parentId || null,
      replyToAuthor: replyToAuthor || undefined
    };

    setDb((prev) => ({
      ...prev,
      Comments: [...prev.Comments, newComment]
    }));

    apiCall('Comments', 'add', newComment);
  };

  // Delete Comment
  const handleDeleteComment = (commentId: number | string) => {
    setDb((prev) => ({
      ...prev,
      Comments: prev.Comments.filter((c) => String(c.id) !== String(commentId))
    }));
  };

  // Student Handlers
  const handleAddStudent = (studentData: {
    name: string;
    pw: string;
    grade: string;
    class: string;
    bio?: string;
  }) => {
    const newStudent: Student = {
      id: Date.now(),
      ...studentData
    };
    setDb((prev) => ({
      ...prev,
      Students: [...prev.Students, newStudent]
    }));
    apiCall('Students', 'add', newStudent);
  };

  const handleDeleteStudent = (studentId: number | string) => {
    setDb((prev) => ({
      ...prev,
      Students: prev.Students.filter((s) => String(s.id) !== String(studentId))
    }));
  };

  // Category Handlers
  const handleAddCategory = (data: { name: string; emoji?: string; color?: string; description?: string }) => {
    const newCategory: Category = {
      id: Date.now(),
      name: data.name,
      emoji: data.emoji || '🌱',
      color: data.color || '#F7CAC9',
      description: data.description
    };
    setDb((prev) => ({
      ...prev,
      Categories: [...(prev.Categories || DEFAULT_CATEGORIES), newCategory]
    }));
    apiCall('Categories', 'add', newCategory);
  };

  const handleUpdateCategory = (
    id: number | string,
    data: { name: string; emoji?: string; color?: string; description?: string }
  ) => {
    setDb((prev) => {
      const existingCategories = prev.Categories || DEFAULT_CATEGORIES;
      const oldCat = existingCategories.find((c) => String(c.id) === String(id));
      const oldName = oldCat?.name;

      const updatedCategories = existingCategories.map((cat) => {
        if (String(cat.id) === String(id)) {
          return {
            ...cat,
            ...data
          };
        }
        return cat;
      });

      const updatedPosts = oldName && oldName !== data.name
        ? prev.Posts.map((p) => (p.category === oldName ? { ...p, category: data.name } : p))
        : prev.Posts;

      return {
        ...prev,
        Categories: updatedCategories,
        Posts: updatedPosts
      };
    });
  };

  const handleDeleteCategory = (id: number | string) => {
    setDb((prev) => {
      const existingCategories = prev.Categories || DEFAULT_CATEGORIES;
      return {
        ...prev,
        Categories: existingCategories.filter((c) => String(c.id) !== String(id))
      };
    });
  };

  // Notice Handlers
  const handleAddNotice = (data: { tag: string; title: string; date?: string }) => {
    const newNotice: NoticeItem = {
      id: Date.now(),
      tag: data.tag,
      title: data.title,
      date: data.date
    };
    setDb((prev) => ({
      ...prev,
      Notices: [...(prev.Notices || DEFAULT_NOTICES), newNotice]
    }));
    apiCall('Notices', 'add', newNotice);
  };

  const handleUpdateNotice = (
    id: number | string,
    data: { tag: string; title: string; date?: string }
  ) => {
    setDb((prev) => {
      const existingNotices = prev.Notices || DEFAULT_NOTICES;
      return {
        ...prev,
        Notices: existingNotices.map((n) =>
          String(n.id) === String(id) ? { ...n, ...data } : n
        )
      };
    });
  };

  const handleDeleteNotice = (id: number | string) => {
    setDb((prev) => {
      const existingNotices = prev.Notices || DEFAULT_NOTICES;
      return {
        ...prev,
        Notices: existingNotices.filter((n) => String(n.id) !== String(id))
      };
    });
  };

  // Gallery Handlers
  const handleAddGalleryItem = (data: {
    title: string;
    emoji?: string;
    color?: string;
    imageUrl?: string;
    description?: string;
    date?: string;
  }) => {
    const newItem: GalleryItem = {
      id: Date.now(),
      ...data
    };
    setDb((prev) => ({
      ...prev,
      Gallery: [...(prev.Gallery || DEFAULT_GALLERY), newItem]
    }));
    apiCall('Gallery', 'add', newItem);
  };

  const handleUpdateGalleryItem = (
    id: number | string,
    data: {
      title: string;
      emoji?: string;
      color?: string;
      imageUrl?: string;
      description?: string;
      date?: string;
    }
  ) => {
    setDb((prev) => {
      const existingGallery = prev.Gallery || DEFAULT_GALLERY;
      return {
        ...prev,
        Gallery: existingGallery.map((g) =>
          String(g.id) === String(id) ? { ...g, ...data } : g
        )
      };
    });
  };

  const handleDeleteGalleryItem = (id: number | string) => {
    setDb((prev) => {
      const existingGallery = prev.Gallery || DEFAULT_GALLERY;
      return {
        ...prev,
        Gallery: existingGallery.filter((g) => String(g.id) !== String(id))
      };
    });
  };

  // Save GAS URL
  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    localStorage.setItem(LOCAL_STORAGE_GAS_KEY, url);
    if (url) {
      fetchData();
      alert('GAS URL이 저장되었습니다! 실시간 시트 동기화를 시도합니다.');
    } else {
      alert('GAS URL이 해제되었습니다. 로컬 저장소 모드로 동작합니다.');
    }
  };

  // Reset to initial mock data
  const handleResetData = () => {
    setDb(INITIAL_DB);
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(INITIAL_DB));
    alert('기본 데이터로 초기화되었습니다.');
  };

  const handleSelectStudentForFilter = (studentName: string) => {
    setFilterStudentName(studentName);
    setFilterTag(null);
    setView('home');
  };

  const handleSelectTag = (tag: string) => {
    setFilterTag(tag);
    setFilterStudentName(null);
    setView('home');
  };

  const handleClearFilters = () => {
    setFilterStudentName(null);
    setFilterTag(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-gray-800 font-sans flex flex-col antialiased selection:bg-[#F7CAC9]/40">
      {/* Sleek Header */}
      <Navbar
        view={view}
        setView={(v) => {
          setView(v);
          handleClearFilters();
        }}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => {
          setView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasGasUrl={!!gasUrl}
        onRefresh={fetchData}
        loading={loading}
      />

      {/* Main 3-Column Workspace */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar (Profile & Statistics) */}
        <SidebarLeft
          user={user}
          db={db}
          onOpenLogin={() => {
            setView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
          onSelectTag={handleSelectTag}
          onNavigate={(v) => setView(v)}
        />

        {/* Center Main Section */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* Daily Notice Announcement Banner */}
          {view !== 'write' && (
            <div className="bg-white p-4 sm:p-5 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F7CAC9]/30 flex items-center justify-center text-[#E89E9D] shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">오늘의 학급 알림</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-snug">
                    {notices.length > 0 ? notices[0].title : '배려와 존중으로 함께 성장하는 5학년 3반!'} ✨
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Card for Guests on Home View */}
          {!user && view === 'home' && (
            <LoginCard
              students={db.Students}
              onLogin={handleLogin}
              onAdminLogin={handleLoginAsAdmin}
            />
          )}

          {/* Views Router */}
          {view === 'home' && (
            <BlogList
              posts={db.Posts}
              comments={db.Comments}
              categories={categories}
              user={user}
              filterUser={filterStudentName}
              filterTag={filterTag}
              onClearFilter={handleClearFilters}
              onAddPost={handleAddPost}
              onDeletePost={handleDeletePost}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onOpenLogin={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenWrite={() => setView('write')}
            />
          )}

          {/* Dedicated SmartEditor Write Post View */}
          {view === 'write' && (
            <BlogEditor
              user={user}
              categories={categories}
              onPublish={handlePublishFromEditor}
              onCancel={() => setView('home')}
              onOpenLogin={() => setView('home')}
            />
          )}

          {view === 'myPosts' && (
            <div>
              {user ? (
                <div className="space-y-6">
                  <div className={`p-6 rounded-[32px] shadow-sm border flex items-center justify-between ${
                    isUserAdmin ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200/80' : 'bg-white border-gray-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        isUserAdmin ? 'bg-amber-100 text-amber-700' : 'bg-[#F7CAC9]/30'
                      }`}>
                        {isUserAdmin ? '👑' : '🌸'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800">
                          {isUserAdmin ? '선생님 관리자 기록함' : `${user.name} 학생의 기록함`}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {isUserAdmin
                            ? '선생님이 학급 블로그에 등록한 공지와 글을 모아보는 공간입니다.'
                            : '내가 작성한 이야기와 생각을 모아보는 공간입니다.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setView('write')}
                        className="px-4 py-2 rounded-2xl text-white font-bold text-xs shadow-xs cursor-pointer"
                        style={{ backgroundColor: isUserAdmin ? '#92A8D1' : '#F7CAC9' }}
                      >
                        {isUserAdmin ? '관리자 새 글 쓰기' : '새 글 쓰기'}
                      </button>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isUserAdmin ? 'bg-amber-100 text-amber-800' : 'bg-[#F7CAC9]/30 text-[#E89E9D]'
                      }`}>
                        {db.Posts.filter((p) => p.author === user.name).length}개의 글
                      </span>
                    </div>
                  </div>

                  <BlogList
                    posts={db.Posts}
                    comments={db.Comments}
                    categories={categories}
                    user={user}
                    filterUser={user.name}
                    onClearFilter={handleClearFilters}
                    onAddPost={handleAddPost}
                    onDeletePost={handleDeletePost}
                    onToggleLike={handleToggleLike}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onOpenLogin={() => {}}
                    onOpenWrite={() => setView('write')}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-2xl mb-3">
                    🔒
                  </div>
                  <h3 className="font-bold text-gray-800 text-base mb-1">로그인이 필요합니다</h3>
                  <p className="text-xs text-gray-400 mb-5">
                    기록을 확인하고 글을 쓰려면 계정으로 로그인해주세요.
                  </p>
                  <button
                    onClick={() => setView('home')}
                    className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm cursor-pointer"
                    style={{ backgroundColor: '#92A8D1' }}
                  >
                    로그인 화면으로 이동
                  </button>
                </div>
              )}
            </div>
          )}

          {view === 'students' && (
            <StudentDirectory
              students={db.Students}
              posts={db.Posts}
              comments={db.Comments}
              currentUser={user}
              onSelectStudent={handleSelectStudentForFilter}
            />
          )}

          {view === 'control' && (
            <ControlPanel
              db={db}
              categories={categories}
              notices={notices}
              gallery={gallery}
              gasUrl={gasUrl}
              user={user}
              onSaveGasUrl={handleSaveGasUrl}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddNotice={handleAddNotice}
              onUpdateNotice={handleUpdateNotice}
              onDeleteNotice={handleDeleteNotice}
              onAddGalleryItem={handleAddGalleryItem}
              onUpdateGalleryItem={handleUpdateGalleryItem}
              onDeleteGalleryItem={handleDeleteGalleryItem}
              onResetData={handleResetData}
              onLoginAsAdmin={handleLoginAsAdmin}
              onNavigateToWrite={() => setView('write')}
              onFetchFromGas={fetchData}
            />
          )}
        </main>

        {/* Right Sidebar (Dynamic Notices & Class Gallery) */}
        <SidebarRight
          notices={notices}
          gallery={gallery}
        />
      </div>

      {/* Syncing Toast Indicator */}
      {loading && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-[#92A8D1]/40 flex items-center gap-2.5 text-xs font-bold text-gray-700 animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-[#92A8D1] border-t-transparent rounded-full animate-spin" />
            <span>데이터 동기화 중...</span>
          </div>
        </div>
      )}

      {/* Sleek Footer */}
      <footer className="mt-auto h-16 bg-white/60 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between px-6 lg:px-10 py-3 text-[11px] text-gray-400 border-t border-gray-100 gap-2 shrink-0">
        <div>
          © 2024 Happiness Elementary School • 5th Grade Class 3 Digital Archive
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="hover:text-gray-600 transition-colors cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-gray-600 transition-colors cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="text-[#E89E9D] font-semibold">Rose Quartz &amp; Serenity</span>
        </div>
      </footer>
    </div>
  );
}
