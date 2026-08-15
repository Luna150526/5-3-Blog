import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Link2, 
  UserPlus, 
  BarChart3, 
  Trash2, 
  Code2, 
  Copy, 
  Check, 
  Users, 
  FileText, 
  MessageSquare, 
  AlertCircle, 
  RotateCcw,
  FolderPlus,
  FolderOpen,
  Edit3,
  X,
  Sparkles,
  Tag,
  Palette
} from 'lucide-react';
import { Database, Category } from '../types';

interface ControlPanelProps {
  db: Database;
  categories: Category[];
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  onAddStudent: (data: { name: string; pw: string; grade: string; class: string; bio?: string }) => void;
  onDeleteStudent: (id: number | string) => void;
  onAddCategory: (data: { name: string; emoji?: string; color?: string; description?: string }) => void;
  onUpdateCategory: (id: number | string, data: { name: string; emoji?: string; color?: string; description?: string }) => void;
  onDeleteCategory: (id: number | string) => void;
  onResetData: () => void;
}

const PRESET_COLORS = [
  { label: '로즈쿼츠', value: '#F7CAC9', bgClass: 'bg-[#F7CAC9]' },
  { label: '세레니티', value: '#92A8D1', bgClass: 'bg-[#92A8D1]' },
  { label: '웜피치', value: '#FCE1B5', bgClass: 'bg-[#FCE1B5]' },
  { label: '민트', value: '#A8E6CF', bgClass: 'bg-[#A8E6CF]' },
  { label: '라벤더', value: '#DED2F9', bgClass: 'bg-[#DED2F9]' },
  { label: '스카이블루', value: '#BAE6FD', bgClass: 'bg-[#BAE6FD]' }
];

const PRESET_EMOJIS = ['🌱', '📝', '📚', '💡', '💖', '🎨', '⚽', '🪐', '🎮', '🌿', '🔬', '🎵', '🏆', '📸'];

const SAMPLE_GAS_CODE = `function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var getSheetData = function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    var headers = data[0];
    return data.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    });
  };
  
  var result = {
    Students: getSheetData('Students'),
    Posts: getSheetData('Posts'),
    Comments: getSheetData('Comments'),
    Categories: getSheetData('Categories'),
    Settings: getSheetData('Settings')
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var body = JSON.parse(e.postData.contents);
  var type = body.type;
  var action = body.action;
  var data = body.data;
  
  var sheet = ss.getSheetByName(type);
  if (!sheet) {
    sheet = ss.insertSheet(type);
  }
  
  if (action === 'add') {
    var headers = sheet.getDataRange().getValues()[0] || [];
    if (headers.length === 0) {
      headers = Object.keys(data);
      sheet.appendRow(headers);
    }
    var row = headers.map(function(h) { return data[h] !== undefined ? data[h] : ''; });
    sheet.appendRow(row);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

type AdminTab = 'categories' | 'students' | 'gas' | 'stats';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  db,
  categories,
  gasUrl,
  onSaveGasUrl,
  onAddStudent,
  onDeleteStudent,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetData
}) => {
  const [adminPw, setAdminPw] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');

  // GAS State
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPw, setNewStudentPw] = useState('');
  const [newStudentBio, setNewStudentBio] = useState('');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🌱');
  const [newCatColor, setNewCatColor] = useState('#F7CAC9');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Category Edit State
  const [editingCatId, setEditingCatId] = useState<number | string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('🌱');
  const [editColor, setEditColor] = useState('#F7CAC9');
  const [editDesc, setEditDesc] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPw === '0526') {
      setIsAuth(true);
    } else {
      alert('관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentPw.trim()) return;
    if (newStudentPw.length !== 4) {
      alert('비밀번호는 4자리 숫자여야 합니다.');
      return;
    }
    onAddStudent({
      name: newStudentName.trim(),
      pw: newStudentPw.trim(),
      grade: '5',
      class: '3',
      bio: newStudentBio.trim() || undefined
    });
    setNewStudentName('');
    setNewStudentPw('');
    setNewStudentBio('');
    alert(`${newStudentName} 학생이 성공적으로 등록되었습니다!`);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
    // Check duplicate
    const exists = categories.some((c) => c.name.trim() === newCatName.trim());
    if (exists) {
      alert('이미 존재하는 카테고리 이름입니다.');
      return;
    }

    onAddCategory({
      name: newCatName.trim(),
      emoji: newCatEmoji,
      color: newCatColor,
      description: newCatDesc.trim() || undefined
    });

    setNewCatName('');
    setNewCatDesc('');
    alert(`'${newCatName}' 카테고리가 추가되었습니다!`);
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditEmoji(cat.emoji || '🌱');
    setEditColor(cat.color || '#F7CAC9');
    setEditDesc(cat.description || '');
  };

  const cancelEditCategory = () => {
    setEditingCatId(null);
  };

  const saveEditCategory = (id: number | string) => {
    if (!editName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
    onUpdateCategory(id, {
      name: editName.trim(),
      emoji: editEmoji,
      color: editColor,
      description: editDesc.trim() || undefined
    });
    setEditingCatId(null);
  };

  const handleDeleteCategoryClick = (cat: Category) => {
    const postCount = db.Posts.filter((p) => p.category === cat.name).length;
    let message = `'${cat.name}' 카테고리를 정말 삭제하시겠습니까?`;
    if (postCount > 0) {
      message = `'${cat.name}' 카테고리에 작성된 글이 ${postCount}개 있습니다.\n카테고리를 삭제하시겠습니까?`;
    }
    if (window.confirm(message)) {
      onDeleteCategory(cat.id);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_GAS_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isAuth) {
    return (
      <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-sm border border-gray-100 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#92A8D1]/30 to-[#F7CAC9]/40 flex items-center justify-center mx-auto text-[#6B84B5] mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">선생님 관리자 인증</h2>
        <p className="text-xs text-gray-400 mb-6">
          카테고리 설정, 학생 명단 및 구글 시트 연동을 위해 관리자 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="admin-pw-input"
              type="password"
              placeholder="관리자 비밀번호를 입력하세요"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 focus:border-[#92A8D1] rounded-2xl outline-none text-sm text-gray-800 transition-all"
              required
            />
          </div>
          <button
            id="admin-auth-btn"
            type="submit"
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: '#F7CAC9' }}
          >
            관리자 인증하기
          </button>
        </form>
      </div>
    );
  }

  const totalLikes = db.Posts.reduce((acc, p) => acc + (p.likes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar for Admin Settings */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-1.5 sm:gap-2">
        <button
          id="admin-tab-categories"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#F7CAC9] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>카테고리 관리</span>
        </button>

        <button
          id="admin-tab-students"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#92A8D1] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>학생 계정 관리</span>
        </button>

        <button
          id="admin-tab-gas"
          onClick={() => setActiveTab('gas')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'gas'
              ? 'bg-[#92A8D1] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>구글 시트 연동</span>
        </button>

        <button
          id="admin-tab-stats"
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-gray-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>통계 및 초기화</span>
        </button>
      </div>

      {/* 1. Category Management Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Form Card */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F7CAC9]/30 flex items-center justify-center text-[#E89E9D]">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">새 블로그 카테고리 추가</h3>
                  <p className="text-xs text-gray-400">학생들이 글을 쓸 때 분류할 새로운 카테고리를 생성합니다.</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                총 {categories.length}개 등록됨
              </span>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    카테고리 이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="new-category-name"
                    type="text"
                    placeholder="예: 체육활동, 미술작품, 우리들의 동아리"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F7CAC9] rounded-2xl text-xs sm:text-sm text-gray-800 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    간단 설명 (선택)
                  </label>
                  <input
                    id="new-category-desc"
                    type="text"
                    placeholder="예: 체육 시간 및 운동 활동에 대한 이야기"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F7CAC9] rounded-2xl text-xs sm:text-sm text-gray-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Emoji & Color Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Emoji Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    대표 아이콘 (이모지)
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCatEmoji(emoji)}
                        className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer ${
                          newCatEmoji === emoji
                            ? 'bg-[#F7CAC9]/30 ring-2 ring-[#F7CAC9] scale-110 shadow-xs'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                    <input
                      type="text"
                      maxLength={2}
                      value={newCatEmoji}
                      onChange={(e) => setNewCatEmoji(e.target.value)}
                      title="직접 입력"
                      className="w-8 h-8 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    테마 색상
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setNewCatColor(col.value)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          newCatColor === col.value
                            ? 'border-gray-800 ring-2 ring-gray-400 bg-white shadow-xs font-bold'
                            : 'border-gray-200 bg-gray-50 hover:bg-white'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${col.bgClass}`} />
                        <span className="text-gray-700 text-[11px]">{col.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  id="add-category-btn"
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  style={{ backgroundColor: '#F7CAC9' }}
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>카테고리 추가하기</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Category List with Edit & Delete */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">카테고리 목록 및 수정 / 삭제</h3>
                <p className="text-xs text-gray-400">카테고리 이름이나 색상을 변경하거나 불필요한 분류를 삭제할 수 있습니다.</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {categories.map((cat) => {
                const isEditing = editingCatId === cat.id;
                const postCount = db.Posts.filter((p) => p.category === cat.name).length;

                if (isEditing) {
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl bg-gray-50 border-2 border-[#92A8D1]/60 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#6B84B5]">카테고리 정보 수정 중</span>
                        <button
                          onClick={cancelEditCategory}
                          className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            카테고리 이름
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-gray-200 focus:border-[#92A8D1] rounded-xl text-xs text-gray-800 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            설명
                          </label>
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-gray-200 focus:border-[#92A8D1] rounded-xl text-xs text-gray-800 outline-none"
                          />
                        </div>
                      </div>

                      {/* Emojis & Colors */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-gray-500 mr-1">아이콘:</span>
                          {PRESET_EMOJIS.slice(0, 8).map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => setEditEmoji(em)}
                              className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                                editEmoji === em ? 'bg-white ring-2 ring-[#92A8D1] shadow-xs' : 'hover:bg-white'
                              }`}
                            >
                              {em}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-gray-500 mr-1">테마:</span>
                          {PRESET_COLORS.map((col) => (
                            <button
                              key={col.value}
                              type="button"
                              onClick={() => setEditColor(col.value)}
                              className={`w-5 h-5 rounded-full ${col.bgClass} transition-all cursor-pointer ${
                                editColor === col.value ? 'ring-2 ring-gray-800 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                              }`}
                              title={col.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditCategory}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditCategory(cat.id)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                          style={{ backgroundColor: '#92A8D1' }}
                        >
                          변경사항 저장
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-white hover:border-[#F7CAC9]/40 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${cat.color || '#F7CAC9'}30` }}
                      >
                        {cat.emoji || '🌱'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800 truncate">{cat.name}</span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${cat.color || '#F7CAC9'}25`,
                              color: cat.color === '#F7CAC9' ? '#E89E9D' : cat.color === '#92A8D1' ? '#6B84B5' : '#4B5563'
                            }}
                          >
                            작성글 {postCount}개
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {cat.description || '학생들의 생각을 공유하는 주제'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                        title="카테고리 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="hidden sm:inline">수정</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCategoryClick(cat)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="카테고리 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Student Accounts Management Tab */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-[#F7CAC9]" />
            <h3 className="text-base font-bold text-gray-800">학생 등록 및 계정 관리</h3>
          </div>

          <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
            <input
              id="reg-student-name"
              type="text"
              placeholder="학생 이름 (예: 홍길동)"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F7CAC9] rounded-2xl text-xs text-gray-800 outline-none"
              required
            />
            <input
              id="reg-student-pw"
              type="password"
              maxLength={4}
              placeholder="비밀번호 (4자리)"
              value={newStudentPw}
              onChange={(e) => setNewStudentPw(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F7CAC9] rounded-2xl text-xs text-gray-800 outline-none"
              required
            />
            <button
              id="reg-student-btn"
              type="submit"
              className="px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
              style={{ backgroundColor: '#92A8D1' }}
            >
              학생 추가 등록
            </button>
          </form>

          {/* Current student list */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              등록된 학생 명단 ({db.Students.length}명)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {db.Students.map((s) => (
                <div
                  key={s.id}
                  className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#F7CAC9]/30 flex items-center justify-center font-bold text-[#E89E9D]">
                      {s.name.slice(0, 1)}
                    </div>
                    <div>
                      <span className="font-bold text-gray-800">{s.name}</span>
                      <span className="text-[11px] text-gray-400 ml-2 font-mono">PW: {s.pw}</span>
                    </div>
                  </div>
                  <button
                    id={`del-student-${s.id}`}
                    onClick={() => {
                      if (window.confirm(`${s.name} 학생을 명단에서 삭제하시겠습니까?`)) {
                        onDeleteStudent(s.id);
                      }
                    }}
                    className="p-1 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Google Sheets (GAS) Tab */}
      {activeTab === 'gas' && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 border-t-4 border-t-[#92A8D1]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#92A8D1]" />
              <h3 className="text-base font-bold text-gray-800">Google Apps Script (GAS) 연동</h3>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                gasUrl ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              {gasUrl ? '연동 활성' : '로컬 브라우저 모드'}
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            구글 스프레드시트의 Apps Script 웹 앱 URL을 입력하면 실시간 구글 시트와 자동 양방향 동기화됩니다.
          </p>

          <div className="flex gap-2 mb-3">
            <input
              id="gas-url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#92A8D1] rounded-2xl text-xs text-gray-800 outline-none"
            />
            <button
              id="save-gas-url-btn"
              onClick={() => onSaveGasUrl(urlInput.trim())}
              className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
              style={{ backgroundColor: '#92A8D1' }}
            >
              저장
            </button>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs text-[#92A8D1] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showCode ? '구글 앱스 스크립트 코드 접기' : '구글 앱스 스크립트(GAS) 템플릿 코드 보기'}</span>
            </button>

            {showCode && (
              <div className="mt-3 p-4 bg-[#1E293B] rounded-2xl text-slate-200 text-xs font-mono relative">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Code.gs (웹 앱으로 배포: 모든 사용자 액세스)</span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-[11px] transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? '복사됨' : '코드 복사'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto max-h-56 scrollbar-thin scrollbar-thumb-slate-700">
                  {SAMPLE_GAS_CODE}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Statistics & Reset Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#92A8D1]" />
              <h3 className="text-base font-bold text-gray-800">학급 활동 통계</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F7CAC9]/15 p-4 rounded-2xl border border-[#F7CAC9]/30 text-center">
                <Users className="w-5 h-5 text-[#E89E9D] mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">총 학생</p>
                <p className="text-2xl font-black text-gray-800 mt-0.5">{db.Students.length}명</p>
              </div>

              <div className="bg-[#92A8D1]/15 p-4 rounded-2xl border border-[#92A8D1]/30 text-center">
                <FileText className="w-5 h-5 text-[#6B84B5] mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">총 게시글</p>
                <p className="text-2xl font-black text-gray-800 mt-0.5">{db.Posts.length}개</p>
              </div>

              <div className="bg-[#FDF3DE] p-4 rounded-2xl border border-[#FCE1B5] text-center">
                <MessageSquare className="w-5 h-5 text-[#D97706] mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">총 댓글</p>
                <p className="text-2xl font-black text-gray-800 mt-0.5">{db.Comments.length}개</p>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center">
                <span className="text-xl block mb-0.5">💖</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">받은 응원</p>
                <p className="text-2xl font-black text-gray-800 mt-0.5">{totalLikes}개</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[32px] border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                데이터를 초기 상태로 리셋할 수 있습니다.
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('기본 초기 상태로 복원하시겠습니까?')) {
                  onResetData();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>데이터 초기화</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
