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
  Palette,
  Megaphone,
  PlusCircle,
  Image as ImageIcon,
  Calendar,
  Layers,
  Crown,
  PenLine,
  Play,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Database, Category, NoticeItem, GalleryItem, Student } from '../types';

interface ControlPanelProps {
  db: Database;
  categories: Category[];
  notices: NoticeItem[];
  gallery: GalleryItem[];
  gasUrl: string;
  user?: Student | null;
  onSaveGasUrl: (url: string) => void;
  onAddStudent: (data: { name: string; pw: string; grade: string; class: string; bio?: string }) => void;
  onDeleteStudent: (id: number | string) => void;
  onAddCategory: (data: { name: string; emoji?: string; color?: string; description?: string }) => void;
  onUpdateCategory: (id: number | string, data: { name: string; emoji?: string; color?: string; description?: string }) => void;
  onDeleteCategory: (id: number | string) => void;
  onAddNotice: (data: { tag: string; title: string; date?: string }) => void;
  onUpdateNotice: (id: number | string, data: { tag: string; title: string; date?: string }) => void;
  onDeleteNotice: (id: number | string) => void;
  onAddGalleryItem: (data: { title: string; emoji?: string; color?: string; imageUrl?: string; description?: string; date?: string }) => void;
  onUpdateGalleryItem: (id: number | string, data: { title: string; emoji?: string; color?: string; imageUrl?: string; description?: string; date?: string }) => void;
  onDeleteGalleryItem: (id: number | string) => void;
  onResetData: () => void;
  onLoginAsAdmin?: () => void;
  onNavigateToWrite?: () => void;
  onFetchFromGas?: () => void;
}

const PRESET_COLORS = [
  { label: '로즈쿼츠', value: '#F7CAC9', bgClass: 'bg-[#F7CAC9]' },
  { label: '세레니티', value: '#92A8D1', bgClass: 'bg-[#92A8D1]' },
  { label: '웜피치', value: '#FCE1B5', bgClass: 'bg-[#FCE1B5]' },
  { label: '민트', value: '#A8E6CF', bgClass: 'bg-[#A8E6CF]' },
  { label: '라벤더', value: '#DED2F9', bgClass: 'bg-[#DED2F9]' },
  { label: '스카이블루', value: '#BAE6FD', bgClass: 'bg-[#BAE6FD]' }
];

const PRESET_EMOJIS = ['🌱', '📝', '📚', '💡', '💖', '🎨', '⚽', '🪐', '🎮', '🌿', '🔬', '🎵', '🏆', '📸', '✨', '🍕'];

const SAMPLE_GAS_CODE = `/**
 * 5학년 3반 학급 블로그 - Google Apps Script (GAS) 통합 백엔드
 * 
 * [배포 설정 필수 방법]
 * 1. 구글 스프레드시트에서 [확장 프로그램] > [Apps Script] 클릭
 * 2. 이 코드 전체를 Code.gs 파일에 복사하여 붙여넣고 [저장(Ctrl+S)]
 * 3. 상단 [배포] > [새 배포] 클릭
 * 4. 톱니바퀴 아이콘 클릭 > [웹 앱] 선택
 * 5. 설명: 5-3 학급 블로그
 * 6. 다음 사용자로 실행: [나] (본인 구글 계정)
 * 7. ⭐ [가장 중요] 액세스 권한: [모든 사용자(Anyone)] 선택! (로그인 필요 없음)
 * 8. [배포] 버튼 클릭 후 생성된 웹 앱 URL(https://script.google.com/macros/s/.../exec)을 복사하여 블로그 관리설정에 등록하세요.
 */

// 스프레드시트 초기 시트 및 헤더 자동 생성
function initSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var schema = {
    'Students': ['id', 'name', 'pw', 'grade', 'class', 'bio', 'role', 'badge', 'color'],
    'Posts': ['id', 'author', 'title', 'content', 'category', 'emoji', 'date', 'likes', 'likedBy', 'blocks', 'isAdmin'],
    'Comments': ['id', 'postId', 'author', 'text', 'date', 'isAdmin', 'parentId', 'replyToAuthor'],
    'Categories': ['id', 'name', 'emoji', 'color', 'description'],
    'Notices': ['id', 'tag', 'title', 'date'],
    'Gallery': ['id', 'title', 'emoji', 'color', 'imageUrl', 'description', 'date'],
    'Settings': ['key', 'value']
  };

  Object.keys(schema).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(schema[sheetName]);
      sheet.setFrozenRows(1);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(schema[sheetName]);
      sheet.setFrozenRows(1);
    }
  });
}

// GET 요청 처리 (데이터 조회)
function doGet(e) {
  initSpreadsheet();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var getSheetData = function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    var headers = data[0];
    return data.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) {
        var val = row[i];
        // JSON 문자열로 저장된 배열/객체 자동 파싱
        if (typeof val === 'string' && (val.indexOf('[') === 0 || val.indexOf('{') === 0)) {
          try {
            obj[h] = JSON.parse(val);
          } catch (err) {
            obj[h] = val;
          }
        } else {
          obj[h] = val;
        }
      });
      return obj;
    });
  };
  
  var result = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    Students: getSheetData('Students'),
    Posts: getSheetData('Posts'),
    Comments: getSheetData('Comments'),
    Categories: getSheetData('Categories'),
    Notices: getSheetData('Notices'),
    Gallery: getSheetData('Gallery'),
    Settings: getSheetData('Settings')
  };
  
  // JSONP 지원
  var callback = e && e.parameter && e.parameter.callback;
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST 요청 처리 (데이터 추가, 수정, 삭제, 전체 동기화)
function doPost(e) {
  initSpreadsheet();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var payload = {};
  if (e && e.postData && e.postData.contents) {
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      payload = e.parameter || {};
    }
  } else if (e && e.parameter) {
    payload = e.parameter;
  }
  
  var type = payload.type; // e.g. 'Posts', 'Comments', 'Students', etc.
  var action = payload.action; // 'add', 'delete', 'update', 'syncAll'
  var data = payload.data;
  
  // 전체 동기화 처리 (syncAll)
  if (action === 'syncAll' && data) {
    Object.keys(data).forEach(function(sheetName) {
      var items = data[sheetName];
      if (Array.isArray(items)) {
        var sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        }
        sheet.clear();
        if (items.length > 0) {
          var headers = Object.keys(items[0]);
          sheet.appendRow(headers);
          sheet.setFrozenRows(1);
          items.forEach(function(item) {
            var row = headers.map(function(h) {
              var val = item[h];
              if (typeof val === 'object' && val !== null) {
                return JSON.stringify(val);
              }
              return val !== undefined ? val : '';
            });
            sheet.appendRow(row);
          });
        }
      }
    });
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'All data synced successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (!type) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Type is required' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = ss.getSheetByName(type);
  if (!sheet) {
    sheet = ss.insertSheet(type);
  }
  
  var values = sheet.getDataRange().getValues();
  var headers = values[0] || [];
  
  if (action === 'add' && data) {
    if (headers.length === 0) {
      headers = Object.keys(data);
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
    var row = headers.map(function(h) {
      var val = data[h];
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val !== undefined ? val : '';
    });
    sheet.appendRow(row);
  } else if (action === 'delete' && data && data.id) {
    var idColIdx = headers.indexOf('id');
    if (idColIdx !== -1) {
      for (var i = values.length - 1; i >= 1; i--) {
        if (String(values[i][idColIdx]) === String(data.id)) {
          sheet.deleteRow(i + 1);
        }
      }
    }
  } else if (action === 'update' && data && data.id) {
    var idColIdx = headers.indexOf('id');
    if (idColIdx !== -1) {
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][idColIdx]) === String(data.id)) {
          headers.forEach(function(h, cIdx) {
            if (data[h] !== undefined) {
              var val = data[h];
              if (typeof val === 'object' && val !== null) {
                val = JSON.stringify(val);
              }
              sheet.getRange(i + 1, cIdx + 1).setValue(val);
            }
          });
        }
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

type AdminTab = 'categories' | 'notices' | 'gallery' | 'students' | 'gas' | 'stats';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  db,
  categories,
  notices,
  gallery,
  gasUrl,
  user,
  onSaveGasUrl,
  onAddStudent,
  onDeleteStudent,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddNotice,
  onUpdateNotice,
  onDeleteNotice,
  onAddGalleryItem,
  onUpdateGalleryItem,
  onDeleteGalleryItem,
  onResetData,
  onLoginAsAdmin,
  onNavigateToWrite,
  onFetchFromGas
}) => {
  const [adminPw, setAdminPw] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');

  // GAS State
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Connection Test State
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [testDetails, setTestDetails] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');

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

  // Notice Form State
  const [newNoticeTag, setNewNoticeTag] = useState('알림');
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDate, setNewNoticeDate] = useState('');

  // Notice Edit State
  const [editingNoticeId, setEditingNoticeId] = useState<number | string | null>(null);
  const [editNoticeTag, setEditNoticeTag] = useState('');
  const [editNoticeTitle, setEditNoticeTitle] = useState('');
  const [editNoticeDate, setEditNoticeDate] = useState('');

  // Gallery Form State
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryEmoji, setNewGalleryEmoji] = useState('🎨');
  const [newGalleryColor, setNewGalleryColor] = useState('#F7CAC9');
  const [newGalleryDesc, setNewGalleryDesc] = useState('');
  const [newGalleryImg, setNewGalleryImg] = useState('');
  const [newGalleryDate, setNewGalleryDate] = useState('');

  // Gallery Edit State
  const [editingGalleryId, setEditingGalleryId] = useState<number | string | null>(null);
  const [editGalleryTitle, setEditGalleryTitle] = useState('');
  const [editGalleryEmoji, setEditGalleryEmoji] = useState('🎨');
  const [editGalleryColor, setEditGalleryColor] = useState('#F7CAC9');
  const [editGalleryDesc, setEditGalleryDesc] = useState('');
  const [editGalleryImg, setEditGalleryImg] = useState('');
  const [editGalleryDate, setEditGalleryDate] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPw === '0526') {
      setIsAuth(true);
      if (onLoginAsAdmin) {
        onLoginAsAdmin();
      }
    } else {
      alert('관리자 비밀번호가 올바르지 않습니다. (기본: 0526)');
    }
  };

  // Student Handler
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

  // Category Handlers
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
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

  // Notice Handlers
  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) {
      alert('공지 내용을 입력해주세요.');
      return;
    }
    const now = new Date();
    const dateStr = newNoticeDate.trim() || `${now.getMonth() + 1}.${now.getDate()}`;
    
    onAddNotice({
      tag: newNoticeTag.trim() || '알림',
      title: newNoticeTitle.trim(),
      date: dateStr
    });

    setNewNoticeTitle('');
    setNewNoticeDate('');
    alert('새 공지사항이 등록되었습니다!');
  };

  const startEditNotice = (item: NoticeItem) => {
    setEditingNoticeId(item.id);
    setEditNoticeTag(item.tag);
    setEditNoticeTitle(item.title);
    setEditNoticeDate(item.date || '');
  };

  const saveEditNotice = (id: number | string) => {
    if (!editNoticeTitle.trim()) {
      alert('공지 내용을 입력해주세요.');
      return;
    }
    onUpdateNotice(id, {
      tag: editNoticeTag.trim() || '알림',
      title: editNoticeTitle.trim(),
      date: editNoticeDate.trim() || undefined
    });
    setEditingNoticeId(null);
  };

  // Gallery Handlers
  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle.trim()) {
      alert('갤러리 활동 제목을 입력해주세요.');
      return;
    }
    const now = new Date();
    const dateStr = newGalleryDate.trim() || `${now.getMonth() + 1}월`;

    onAddGalleryItem({
      title: newGalleryTitle.trim(),
      emoji: newGalleryEmoji,
      color: newGalleryColor,
      imageUrl: newGalleryImg.trim() || undefined,
      description: newGalleryDesc.trim() || undefined,
      date: dateStr
    });

    setNewGalleryTitle('');
    setNewGalleryDesc('');
    setNewGalleryImg('');
    setNewGalleryDate('');
    alert('새 갤러리 활동 기록이 등록되었습니다!');
  };

  const startEditGallery = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setEditGalleryTitle(item.title);
    setEditGalleryEmoji(item.emoji || '🎨');
    setEditGalleryColor(item.color || '#F7CAC9');
    setEditGalleryDesc(item.description || '');
    setEditGalleryImg(item.imageUrl || '');
    setEditGalleryDate(item.date || '');
  };

  const saveEditGallery = (id: number | string) => {
    if (!editGalleryTitle.trim()) {
      alert('갤러리 활동 제목을 입력해주세요.');
      return;
    }
    onUpdateGalleryItem(id, {
      title: editGalleryTitle.trim(),
      emoji: editGalleryEmoji,
      color: editGalleryColor,
      description: editGalleryDesc.trim() || undefined,
      imageUrl: editGalleryImg.trim() || undefined,
      date: editGalleryDate.trim() || undefined
    });
    setEditingGalleryId(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_GAS_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Google Sheets Diagnostic & Connection Tester
  const handleTestConnection = async () => {
    const url = urlInput.trim();
    if (!url) {
      setTestState('error');
      setTestMessage('구글 앱스 스크립트 웹 앱 URL을 입력해주세요.');
      return;
    }

    if (url.includes('docs.google.com/spreadsheets')) {
      setTestState('error');
      setTestMessage(
        '⚠️ 스프레드시트 편집 URL이 입력되었습니다. [확장 프로그램] > [Apps Script] > [배포] > [새 배포] > [웹 앱]에서 생성된 https://script.google.com/macros/s/.../exec URL을 입력해야 합니다.'
      );
      return;
    }

    if (!url.includes('script.google.com/macros/s/') || !url.includes('/exec')) {
      setTestState('error');
      setTestMessage('⚠️ 올바른 Google Apps Script 웹 앱 배포 URL 형식이 아닙니다. (/exec 로 끝나는 주소여야 합니다)');
      return;
    }

    setTestState('testing');
    setTestMessage('구글 시트 엔드포인트로 연결 및 데이터 조회를 시도하고 있습니다...');
    setTestDetails(null);

    const startTime = Date.now();
    try {
      const res = await fetch(url);
      const text = await res.text();
      const elapsed = Date.now() - startTime;

      // Check if Google returned HTML login screen (permission error)
      if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com') || text.includes('Sign in')) {
        setTestState('error');
        setTestMessage(
          '⚠️ 구글 로그인 페이지가 반환되었습니다. Apps Script 배포 설정 시 [액세스 권한]을 반드시 "모든 사용자(Anyone)"로 설정하셔야 브라우저에서 데이터가 정상 연동됩니다.'
        );
        return;
      }

      const json = JSON.parse(text);
      setTestState('success');
      setTestMessage(`🎉 연결 성공! (${elapsed}ms 응답 완료)`);
      setTestDetails({
        students: Array.isArray(json.Students) ? json.Students.length : 0,
        posts: Array.isArray(json.Posts) ? json.Posts.length : 0,
        comments: Array.isArray(json.Comments) ? json.Comments.length : 0,
        categories: Array.isArray(json.Categories) ? json.Categories.length : 0,
        notices: Array.isArray(json.Notices) ? json.Notices.length : 0,
        gallery: Array.isArray(json.Gallery) ? json.Gallery.length : 0
      });
      onSaveGasUrl(url);
    } catch (err: any) {
      setTestState('error');
      setTestMessage(
        `⚠️ 연결에 실패했습니다: ${err.message || '네트워크/CORS 에러'}. Apps Script 코드에 doGet/doPost가 포함되어 있는지 확인하고 새 배포를 실행해 주세요.`
      );
    }
  };

  // Sync All Data to Google Sheets Now
  const handleSyncAllToGoogleSheets = async () => {
    const url = urlInput.trim() || gasUrl;
    if (!url) {
      alert('먼저 구글 시트 웹 앱 URL을 저장해주세요.');
      return;
    }

    setSyncStatus('동기화 중...');
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncAll',
          data: {
            Students: db.Students,
            Posts: db.Posts,
            Comments: db.Comments,
            Categories: categories,
            Notices: notices,
            Gallery: gallery,
            Settings: db.Settings || []
          }
        })
      });
      setSyncStatus('🎉 구글 시트로 전체 데이터가 성공적으로 백업/동기화되었습니다!');
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (err: any) {
      setSyncStatus(`⚠️ 동기화 실패: ${err.message}`);
    }
  };

  // Password Lock Screen if not authenticated
  if (!isAuth) {
    return (
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 max-w-md mx-auto my-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#92A8D1]/20 flex items-center justify-center mx-auto mb-3 text-[#6B84B5]">
            <Key className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">학급 관리자 인증</h2>
          <p className="text-xs text-gray-400 mt-1">
            카테고리, 공지사항, 갤러리, 학생 명단 및 구글 시트 연동을 설정합니다.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">관리자 비밀번호</label>
            <input
              id="admin-pw-input"
              type="password"
              placeholder="비밀번호를 입력하세요 (기본: 0526)"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#92A8D1] rounded-2xl text-sm text-gray-800 outline-none transition-colors"
              required
            />
          </div>

          <button
            id="admin-auth-submit-btn"
            type="submit"
            className="w-full py-3 rounded-2xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            style={{ backgroundColor: '#92A8D1' }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>관리자 로그인</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            담임선생님 기본 마스터 비밀번호는 <code className="bg-gray-100 px-1.5 py-0.5 rounded-sm font-bold text-gray-600">0526</code> 입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Teacher Badge and Quick Write Action */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-sky-50 p-5 rounded-[32px] shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shadow-xs">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-gray-800">5학년 3반 학급 총괄 관리자 모드</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                담임선생님
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              카테고리, 공지사항, 갤러리, 학생 계정, 구글 시트 양방향 연동을 실시간으로 관리합니다.
            </p>
          </div>
        </div>

        {onNavigateToWrite && (
          <button
            onClick={onNavigateToWrite}
            className="px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: '#92A8D1' }}
          >
            <PenLine className="w-4 h-4" />
            <span>선생님 글/공지 작성하기</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'categories' ? 'bg-[#F7CAC9] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>카테고리 관리 ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notices' ? 'bg-[#92A8D1] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>공지사항 관리 ({notices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'gallery' ? 'bg-[#FCE1B5] text-amber-900 shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>갤러리 관리 ({gallery.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'students' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>학생 계정 관리 ({db.Students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'gas' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>구글 시트 연동 및 진단</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>통계 및 초기화</span>
        </button>
      </div>

      {/* Tab 1: Categories Management */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#E89E9D]" />
                <h3 className="text-base font-bold text-gray-800">새 카테고리 추가</h3>
              </div>
              <span className="text-xs text-gray-400">게시글 분류를 추가할 수 있습니다</span>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="카테고리 이름 (예: 동아리, 미술, 과학)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F7CAC9] rounded-2xl text-xs text-gray-800 outline-none"
                  required
                />

                {/* Emoji Picker */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5">
                  <span className="text-xs text-gray-400 font-bold">아이콘:</span>
                  <select
                    value={newCatEmoji}
                    onChange={(e) => setNewCatEmoji(e.target.value)}
                    className="bg-transparent text-sm outline-none cursor-pointer flex-1 font-emoji"
                  >
                    {PRESET_EMOJIS.map((em) => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5">
                  <span className="text-xs text-gray-400 font-bold">테마색:</span>
                  <select
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="bg-transparent text-xs font-bold outline-none cursor-pointer flex-1"
                  >
                    {PRESET_COLORS.map((pc) => (
                      <option key={pc.value} value={pc.value}>{pc.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="카테고리 설명 (선택, 예: 자유로운 동아리 활동 이야기)"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#F7CAC9] rounded-2xl text-xs text-gray-800 outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
                  style={{ backgroundColor: '#F7CAC9' }}
                >
                  카테고리 생성
                </button>
              </div>
            </form>
          </div>

          {/* Current Category List */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              현재 활성화된 카테고리 ({categories.length}개)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isEditing = editingCatId === cat.id;
                const postCount = db.Posts.filter((p) => p.category === cat.name).length;

                if (isEditing) {
                  return (
                    <div key={cat.id} className="p-4 rounded-2xl bg-gray-50 border-2 border-[#92A8D1] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#6B84B5]">카테고리 수정</span>
                        <button onClick={() => setEditingCatId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="col-span-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl outline-none"
                        />
                        <select
                          value={editEmoji}
                          onChange={(e) => setEditEmoji(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-center"
                        >
                          {PRESET_EMOJIS.map((em) => (
                            <option key={em} value={em}>{em}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="설명"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none"
                      />
                      <button
                        onClick={() => saveEditCategory(cat.id)}
                        className="w-full py-1.5 rounded-xl text-white font-bold text-xs bg-[#92A8D1] shadow-xs cursor-pointer"
                      >
                        수정 저장
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-white hover:border-[#F7CAC9] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 shadow-2xs border border-white"
                        style={{ backgroundColor: `${cat.color || '#F7CAC9'}30` }}
                      >
                        {cat.emoji || '🌱'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                            {cat.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-normal">
                            (글 {postCount}개)
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="p-1.5 rounded-xl text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                        title="수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategoryClick(cat)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Notices Management */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#92A8D1]" />
                <h3 className="text-base font-bold text-gray-800">학급 공지사항 등록</h3>
              </div>
              <span className="text-xs text-gray-400">사이드바 알림판에 노출됩니다</span>
            </div>

            <form onSubmit={handleNoticeSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="태그 (예: 알림, 과제, 준비물)"
                  value={newNoticeTag}
                  onChange={(e) => setNewNoticeTag(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#92A8D1] rounded-2xl text-xs text-gray-800 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="공지 내용 (예: 내일 체육복과 줄넘기 준비하기)"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#92A8D1] rounded-2xl text-xs text-gray-800 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="날짜 (예: 6.15)"
                  value={newNoticeDate}
                  onChange={(e) => setNewNoticeDate(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#92A8D1] rounded-2xl text-xs text-gray-800 outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: '#92A8D1' }}
                >
                  공지사항 추가
                </button>
              </div>
            </form>
          </div>

          {/* Current Notices List */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              등록된 공지사항 목록 ({notices.length}개)
            </h4>

            <div className="space-y-2.5">
              {notices.map((item) => {
                const isEditing = editingNoticeId === item.id;

                if (isEditing) {
                  return (
                    <div key={item.id} className="p-4 rounded-2xl bg-gray-50 border-2 border-[#92A8D1] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#6B84B5]">공지사항 수정</span>
                        <button onClick={() => setEditingNoticeId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                        <input
                          type="text"
                          value={editNoticeTag}
                          onChange={(e) => setEditNoticeTag(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl outline-none"
                          placeholder="태그"
                        />
                        <input
                          type="text"
                          value={editNoticeTitle}
                          onChange={(e) => setEditNoticeTitle(e.target.value)}
                          className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl outline-none"
                          placeholder="내용"
                        />
                        <input
                          type="text"
                          value={editNoticeDate}
                          onChange={(e) => setEditNoticeDate(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl outline-none"
                          placeholder="날짜"
                        />
                      </div>
                      <button
                        onClick={() => saveEditNotice(item.id)}
                        className="w-full py-1.5 rounded-xl text-white font-bold text-xs bg-[#92A8D1] shadow-xs cursor-pointer"
                      >
                        공지 수정 저장
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-white hover:border-[#92A8D1] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#92A8D1]/20 text-[#6B84B5] shrink-0">
                        {item.tag}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                        {item.title}
                      </p>
                      {item.date && (
                        <span className="text-[10px] text-gray-400 shrink-0">{item.date}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditNotice(item)}
                        className="p-1.5 rounded-xl text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                        title="수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`'${item.title}' 공지를 삭제하시겠습니까?`)) {
                            onDeleteNotice(item.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gallery Management */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-gray-800">학급 갤러리 활동 등록</h3>
              </div>
              <span className="text-xs text-gray-400">추억 갤러리에 카드 형태로 전시됩니다</span>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  placeholder="활동 제목 (예: 봄맞이 화단 가꾸기)"
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#FCE1B5] rounded-2xl text-xs text-gray-800 outline-none"
                  required
                />

                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5">
                  <span className="text-xs text-gray-400 font-bold">아이콘:</span>
                  <select
                    value={newGalleryEmoji}
                    onChange={(e) => setNewGalleryEmoji(e.target.value)}
                    className="bg-transparent text-sm outline-none cursor-pointer flex-1"
                  >
                    {PRESET_EMOJIS.map((em) => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5">
                  <span className="text-xs text-gray-400 font-bold">테마색:</span>
                  <select
                    value={newGalleryColor}
                    onChange={(e) => setNewGalleryColor(e.target.value)}
                    className="bg-transparent text-xs font-bold outline-none cursor-pointer flex-1"
                  >
                    {PRESET_COLORS.map((pc) => (
                      <option key={pc.value} value={pc.value}>{pc.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="url"
                  placeholder="사진 웹 URL (선택, 예: https://...)"
                  value={newGalleryImg}
                  onChange={(e) => setNewGalleryImg(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#FCE1B5] rounded-2xl text-xs text-gray-800 outline-none"
                />
                <input
                  type="text"
                  placeholder="활동 날짜 (예: 5월 셋째주)"
                  value={newGalleryDate}
                  onChange={(e) => setNewGalleryDate(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#FCE1B5] rounded-2xl text-xs text-gray-800 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="활동 한 줄 설명 (예: 학교 화단에 봄꽃 모종을 심었어요)"
                  value={newGalleryDesc}
                  onChange={(e) => setNewGalleryDesc(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#FCE1B5] rounded-2xl text-xs text-gray-800 outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-amber-900 font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
                  style={{ backgroundColor: '#FCE1B5' }}
                >
                  갤러리 추가
                </button>
              </div>
            </form>
          </div>

          {/* Current Gallery List */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              현재 등록된 갤러리 활동 ({gallery.length}개)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gallery.map((item) => {
                const isEditing = editingGalleryId === item.id;

                if (isEditing) {
                  return (
                    <div key={item.id} className="p-4 rounded-2xl bg-gray-50 border-2 border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800">갤러리 수정</span>
                        <button onClick={() => setEditingGalleryId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editGalleryTitle}
                        onChange={(e) => setEditGalleryTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none"
                        placeholder="제목"
                      />
                      <input
                        type="url"
                        value={editGalleryImg}
                        onChange={(e) => setEditGalleryImg(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none"
                        placeholder="사진 URL"
                      />
                      <input
                        type="text"
                        value={editGalleryDesc}
                        onChange={(e) => setEditGalleryDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none"
                        placeholder="설명"
                      />
                      <button
                        onClick={() => saveEditGallery(item.id)}
                        className="w-full py-1.5 rounded-xl text-amber-900 font-bold text-xs bg-[#FCE1B5] shadow-xs cursor-pointer"
                      >
                        갤러리 수정 저장
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-white hover:border-[#FCE1B5] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs border border-white/60 overflow-hidden"
                        style={{ backgroundColor: `${item.color || '#F7CAC9'}40` }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-2xl"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          item.emoji || '🎨'
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.description || '학급 활동 기록'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEditGallery(item)}
                        className="p-1.5 rounded-xl text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                        title="수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`'${item.title}' 갤러리 활동을 삭제하시겠습니까?`)) {
                            onDeleteGalleryItem(item.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Student Accounts Management */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
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

      {/* Tab 5: Google Sheets (GAS) Integration & Connection Diagnostic Tool */}
      {activeTab === 'gas' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-[32px] shadow-sm border border-gray-100 border-t-4 border-t-emerald-500">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-800">구글 스프레드시트 (GAS) 실시간 연동</h3>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  gasUrl ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {gasUrl ? '● 연동 URL 등록됨' : '○ 로컬 브라우저 모드'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              구글 스프레드시트의 Apps Script 웹 앱 URL을 등록하면 학생 글, 댓글, 공지사항, 갤러리 데이터가 구글 시트에 실시간 자동 저장 및 양방향 동기화됩니다.
            </p>

            {/* URL Input Bar & Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  id="gas-url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 min-w-[260px] px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-2xl text-xs text-gray-800 outline-none font-mono"
                />
                
                <button
                  id="test-gas-conn-btn"
                  onClick={handleTestConnection}
                  disabled={testState === 'testing'}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{testState === 'testing' ? '연결 확인 중...' : '연동 테스트 및 진단'}</span>
                </button>

                <button
                  id="save-gas-url-btn"
                  onClick={() => {
                    onSaveGasUrl(urlInput.trim());
                    alert('구글 시트 연동 URL이 저장되었습니다!');
                  }}
                  className="px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: '#92A8D1' }}
                >
                  URL 저장
                </button>
              </div>

              {/* Diagnostic Test Results Box */}
              {testMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs border animate-in fade-in duration-200 ${
                    testState === 'success'
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : testState === 'error'
                      ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {testState === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1.5 flex-1">
                      <p className="font-bold leading-relaxed">{testMessage}</p>
                      {testDetails && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-emerald-200/60 font-mono text-[11px]">
                          <div className="bg-white/80 p-1.5 rounded-lg text-center">학생: {testDetails.students}명</div>
                          <div className="bg-white/80 p-1.5 rounded-lg text-center">게시글: {testDetails.posts}개</div>
                          <div className="bg-white/80 p-1.5 rounded-lg text-center">댓글: {testDetails.comments}개</div>
                          <div className="bg-white/80 p-1.5 rounded-lg text-center">카테고리: {testDetails.categories}개</div>
                          <div className="bg-white/80 p-1.5 rounded-lg text-center">공지: {testDetails.notices}개</div>
                          <div className="bg-white/80 p-1.5 rounded-lg text-center">갤러리: {testDetails.gallery}개</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Manual Sync Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSyncAllToGoogleSheets}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>현재 블로그 전체 데이터 구글 시트로 즉시 백업/업로드</span>
                </button>

                {onFetchFromGas && (
                  <button
                    type="button"
                    onClick={onFetchFromGas}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#92A8D1]" />
                    <span>구글 시트에서 최신 데이터 불러오기</span>
                  </button>
                )}

                {syncStatus && (
                  <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                    {syncStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Step by step Visual Setup Guide */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>구글 시트 연동 초간단 5단계 가이드</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="font-black text-emerald-600 block mb-1">1단계: 스프레드시트 생성</span>
                  <p className="text-gray-500">
                    <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-bold inline-flex items-center gap-0.5">
                      구글 스프레드시트 새 문서 열기 <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="font-black text-emerald-600 block mb-1">2단계: Apps Script 열기</span>
                  <p className="text-gray-500">
                    상단 메뉴 <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 클릭합니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="font-black text-emerald-600 block mb-1">3단계: 코드 붙여넣기 및 저장</span>
                  <p className="text-gray-500">
                    아래 <strong>Code.gs</strong> 템플릿 코드를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="font-black text-amber-800 block mb-1">4단계: ⭐ 웹 앱으로 배포 (핵심!)</span>
                  <p className="text-amber-900 leading-relaxed">
                    상단 <strong>[배포] &gt; [새 배포] &gt; [웹 앱]</strong> 선택 후, 액세스 권한을 반드시 <strong>&ldquo;모든 사용자(Anyone)&rdquo;</strong>로 설정하여 배포합니다!
                  </p>
                </div>
              </div>

              {/* Code Toggle & Copy Box */}
              <div>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Code2 className="w-4 h-4" />
                  <span>{showCode ? 'Google Apps Script (Code.gs) 코드 접기' : 'Google Apps Script (Code.gs) 최신 템플릿 코드 보기'}</span>
                </button>

                {showCode && (
                  <div className="mt-3 p-4 bg-[#1E293B] rounded-2xl text-slate-200 text-xs font-mono relative">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                      <span className="text-slate-400">Code.gs (모든 사용자 액세스 권한으로 배포)</span>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? '복사 완료!' : '전체 코드 복사'}</span>
                      </button>
                    </div>
                    <pre className="overflow-x-auto max-h-72 scrollbar-thin scrollbar-thumb-slate-700 leading-relaxed">
                      {SAMPLE_GAS_CODE}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Stats & Reset */}
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
                <p className="text-[10px] font-bold text-gray-400 uppercase">총 댓글 &amp; 답글</p>
                <p className="text-2xl font-black text-gray-800 mt-0.5">{db.Comments.length}개</p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                <ImageIcon className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">갤러리 활동</p>
                <p className="text-2xl font-black text-gray-800 mt-0.5">{gallery.length}개</p>
              </div>
            </div>
          </div>

          {/* Reset Box */}
          <div className="bg-rose-50/50 p-6 rounded-[32px] border border-rose-200">
            <div className="flex items-center gap-2 text-rose-700 font-bold mb-2 text-sm">
              <RotateCcw className="w-4 h-4" />
              <span>데이터 초기화</span>
            </div>
            <p className="text-xs text-rose-600 mb-4 leading-relaxed">
              모든 학생, 게시글, 댓글, 카테고리, 공지사항을 최초 기본 데이터 상태로 초기화합니다.
            </p>
            <button
              onClick={() => {
                if (window.confirm('정말로 모든 학급 블로그 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                  onResetData();
                  alert('데이터가 성공적으로 초기화되었습니다.');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              기본 데이터로 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
