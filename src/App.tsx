import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { LoginCard } from './components/LoginCard';
import { BlogList } from './components/BlogList';
import { ControlPanel } from './components/ControlPanel';
import { StudentDirectory } from './components/StudentDirectory';
import { Database, Student, ViewType, Post, Comment, Category } from './types';
import { INITIAL_DB, DEFAULT_CATEGORIES } from './data/initialData';
import { Sparkles, Megaphone, Heart } from 'lucide-react';

const LOCAL_STORAGE_DB_KEY = 'class_5_3_db_v3';
const LOCAL_STORAGE_GAS_KEY = 'class_gas_url';
const LOCAL_STORAGE_USER_KEY = 'class_logged_user';

export default function App() {
  // Navigation View: 'home' | 'myPosts' | 'students' | 'control'
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
              : DEFAULT_CATEGORIES
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached database, loading initial data', e);
    }
    return INITIAL_DB;
  });

  // Logged-in Student
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
          setDb((prev) => ({
            Students: Array.isArray(data.Students) && data.Students.length > 0 ? data.Students : prev.Students,
            Posts: Array.isArray(data.Posts) && data.Posts.length > 0 ? data.Posts : prev.Posts,
            Comments: Array.isArray(data.Comments) ? data.Comments : prev.Comments,
            Categories: Array.isArray(data.Categories) && data.Categories.length > 0 ? data.Categories : prev.Categories,
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

  // Student Login Handler
  const handleLogin = (name: string, pw: string): boolean => {
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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  // Add new post
  const handleAddPost = (content: string, category: string, emoji: string) => {
    if (!user) return;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${
      now.getHours() >= 12 ? '오후' : '오전'
    } ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPost: Post = {
      id: Date.now(),
      author: user.name,
      content,
      date: formattedDate,
      category: category || '일상',
      likes: 0,
      likedBy: [],
      emoji: emoji || '📝'
    };

    setDb((prev) => ({
      ...prev,
      Posts: [newPost, ...prev.Posts]
    }));

    apiCall('Posts', 'add', newPost);
  };

  // Delete post
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

  // Add Comment
  const handleAddComment = (postId: number | string, text: string) => {
    if (!user) return;
    const now = new Date();
    const formattedTime = `${now.getHours() >= 12 ? '오후' : '오전'} ${now.getHours() % 12 || 12}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newComment: Comment = {
      id: Date.now(),
      postId,
      author: user.name,
      text,
      date: formattedTime
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

  // Add Student
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

  // Delete Student
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

      // Also update any posts that had the old category name to the new name
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
        />

        {/* Center Main Section */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* Daily Notice Announcement Banner */}
          <div className="bg-white p-4 sm:p-5 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F7CAC9]/30 flex items-center justify-center text-[#E89E9D] shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">오늘의 학급 알림</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-snug">
                  배려와 존중으로 함께 성장하는 5학년 3반! 친구의 글에 따뜻한 응원의 댓글을 남겨보세요. ✨
                </p>
              </div>
            </div>
          </div>

          {/* Login Card for Guests on Home View */}
          {!user && view === 'home' && (
            <LoginCard students={db.Students} onLogin={handleLogin} />
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
            />
          )}

          {view === 'myPosts' && (
            <div>
              {user ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F7CAC9]/30 flex items-center justify-center text-xl">
                        🌸
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800">{user.name} 학생의 기록함</h3>
                        <p className="text-xs text-gray-400">
                          내가 작성한 이야기와 생각을 모아보는 공간입니다.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F7CAC9]/30 text-[#E89E9D]">
                      {db.Posts.filter((p) => p.author === user.name).length}개의 글
                    </span>
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
                  />
                </div>
              ) : (
                <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-2xl mb-3">
                    🔒
                  </div>
                  <h3 className="font-bold text-gray-800 text-base mb-1">로그인이 필요합니다</h3>
                  <p className="text-xs text-gray-400 mb-5">
                    나의 기록을 확인하고 글을 쓰려면 학생 이름과 비밀번호로 로그인해주세요.
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
              gasUrl={gasUrl}
              onSaveGasUrl={handleSaveGasUrl}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onResetData={handleResetData}
            />
          )}
        </main>

        {/* Right Sidebar (Notices & Class Gallery) */}
        <SidebarRight />
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
