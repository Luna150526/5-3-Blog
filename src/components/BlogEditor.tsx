import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Video,
  Smile,
  Quote,
  Minus,
  Paperclip,
  Link2,
  MapPin,
  Lightbulb,
  Vote,
  Calendar,
  Table as TableIcon,
  Code2,
  SquareRadical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Type,
  ChevronDown,
  ArrowLeft,
  Save,
  Send,
  Trash2,
  Plus,
  Check,
  X,
  Sparkles,
  Tag,
  HelpCircle,
  Palette,
  CheckCircle2,
  Crown,
  PenLine
} from 'lucide-react';
import { Student, Category, RichBlock, Post } from '../types';

interface BlogEditorProps {
  user: Student | null;
  categories: Category[];
  editingPost?: Post | null;
  onPublish: (title: string, content: string, category: string, emoji: string, blocks: RichBlock[]) => void;
  onUpdatePost?: (postId: number | string, title: string, content: string, category: string, emoji: string, blocks: RichBlock[]) => void;
  onCancel: () => void;
  onOpenLogin: () => void;
}

const FONT_FAMILIES = [
  { label: '기본서체 (Sans)', value: 'font-sans' },
  { label: '마루부리 (Serif)', value: 'font-serif' },
  { label: '동글코딩 (Mono)', value: 'font-mono' }
];

const FONT_SIZES = [
  { label: '작게 (13px)', value: '13px' },
  { label: '보통 (15px)', value: '15px' },
  { label: '크게 (18px)', value: '18px' },
  { label: '아주 크게 (24px)', value: '24px' }
];

const TEXT_COLORS = [
  { name: '기본 먹색', color: '#1F2937' },
  { name: '로즈쿼츠', color: '#E89E9D' },
  { name: '세레니티', color: '#6B84B5' },
  { name: '오렌지 코랄', color: '#EA580C' },
  { name: '싱그러운 초록', color: '#16A34A' },
  { name: '보라 라벤더', color: '#9333EA' },
  { name: '선명한 빨강', color: '#DC2626' },
  { name: '깊은 바다 파랑', color: '#2563EB' },
  { name: '황금빛 앰버', color: '#D97706' }
];

const HIGHLIGHT_COLORS = [
  { name: '강조 없음', color: 'transparent' },
  { name: '노랑 형광펜', color: '#FEF08A' },
  { name: '핑크 형광펜', color: '#FBCFE8' },
  { name: '하늘 형광펜', color: '#BAE6FD' },
  { name: '민트 형광펜', color: '#BBF7D0' },
  { name: '라벤더 형광펜', color: '#E9D5FF' },
  { name: '피치 형광펜', color: '#FED7AA' }
];

const STICKER_PRESETS = [
  { emoji: '🌸', name: '예쁜 벚꽃' },
  { emoji: '✨', name: '반짝반짝' },
  { emoji: '🎉', name: '축하해요' },
  { emoji: '💖', name: '하트 뿅' },
  { emoji: '👍', name: '최고예요' },
  { emoji: '🏆', name: '1등상' },
  { emoji: '📚', name: '열공모드' },
  { emoji: '🌱', name: '새싹성장' },
  { emoji: '🍕', name: '맛있는 음식' },
  { emoji: '⚽', name: '체육활동' },
  { emoji: '🎨', name: '미술시간' },
  { emoji: '🪐', name: '우주탐험' },
  { emoji: '💡', name: '반짝 아이디어' },
  { emoji: '🐱', name: '귀여운 냥이' },
  { emoji: '🐶', name: '착한 댕댕이' },
  { emoji: '🔥', name: '열정가득' }
];

const WRITING_PROMPTS = [
  '📖 오늘 읽은 책 중에서 가장 기억에 남는 문장과 내 생각',
  '🔬 과학이나 실과 시간에 실험하면서 신기했던 점',
  '⚽ 체육 시간이나 쉬는 시간에 친구들과 함께한 즐거운 순간',
  '💡 내가 5학년이 되고 나서 가장 달라진 점이나 성장한 부분',
  '💌 우리 반 친구에게 전하고 싶었던 고마운 마음',
  '🎨 오늘 미술이나 음악 시간에 만든 나만의 작품 이야기',
  '🌟 이번 주말에 가족들과 함께한 특별하고 소중한 추억'
];

const DRAFT_STORAGE_KEY = 'class_5_3_editor_draft_v2';

export const BlogEditor: React.FC<BlogEditorProps> = ({
  user,
  categories,
  editingPost,
  onPublish,
  onUpdatePost,
  onCancel,
  onOpenLogin
}) => {
  // Post metadata
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || '일상');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(categories[0]?.emoji || '📝');
  
  // Editor content & Rich Blocks
  const [mainContent, setMainContent] = useState('');
  const [blocks, setBlocks] = useState<RichBlock[]>([]);

  // Font family & alignment
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  // Floating mini-toolbar for selected words
  const [floatingPos, setFloatingPos] = useState<{ top: number; left: number } | null>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [selectedTextPreview, setSelectedTextPreview] = useState<string>('');

  // Dropdown states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);

  // Popups / Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Temporary inputs for modals
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempImageCaption, setTempImageCaption] = useState('');
  const [tempQuoteText, setTempQuoteText] = useState('');
  const [tempQuoteAuthor, setTempQuoteAuthor] = useState('');
  const [tempQuoteStyle, setTempQuoteStyle] = useState<'line' | 'box' | 'speech' | 'marks'>('line');
  const [tempPlaceName, setTempPlaceName] = useState('');
  const [tempPlaceDesc, setTempPlaceDesc] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempPollQuestion, setTempPollQuestion] = useState('');
  const [tempPollOptions, setTempPollOptions] = useState<string[]>(['옵션 1', '옵션 2']);
  const [tempCode, setTempCode] = useState('');
  const [tempCodeLang, setTempCodeLang] = useState('python');
  const [tempMath, setTempMath] = useState('');
  const [tempScheduleDate, setTempScheduleDate] = useState('');
  const [tempScheduleTitle, setTempScheduleTitle] = useState('');
  const [tempLinkUrl, setTempLinkUrl] = useState('');
  const [tempLinkText, setTempLinkText] = useState('');

  const [savedDraftToast, setSavedDraftToast] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize from editingPost or saved draft
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setSelectedCategory(editingPost.category || categories[0]?.name || '일상');
      setSelectedEmoji(editingPost.emoji || categories[0]?.emoji || '📝');
      setMainContent(editingPost.content || '');
      if (editorRef.current) {
        editorRef.current.innerHTML = editingPost.content || '';
      }
      setBlocks(editingPost.blocks || []);
      return;
    }

    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) {
          setMainContent(parsed.content);
          if (editorRef.current) {
            editorRef.current.innerHTML = parsed.content;
          }
        }
        if (parsed.category) setSelectedCategory(parsed.category);
        if (parsed.emoji) setSelectedEmoji(parsed.emoji);
        if (parsed.blocks && Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
      }
    } catch {
      // ignore
    }
  }, [editingPost, categories]);

  // Save Draft
  const handleSaveDraft = () => {
    try {
      const currentHtml = editorRef.current ? editorRef.current.innerHTML : mainContent;
      const draft = {
        title,
        content: currentHtml,
        category: selectedCategory,
        emoji: selectedEmoji,
        blocks,
        savedAt: new Date().toLocaleString()
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setSavedDraftToast(true);
      setTimeout(() => setSavedDraftToast(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Clear Draft
  const handleClearDraft = () => {
    if (window.confirm('임시저장된 내용을 모두 지우고 새 글을 시작하시겠습니까?')) {
      setTitle('');
      setMainContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setBlocks([]);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  // Detect selection for floating toolbar
  const checkSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setFloatingPos(null);
      setSelectedTextPreview('');
      return;
    }

    if (!editorRef.current.contains(selection.anchorNode)) {
      setFloatingPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    if (!text) {
      setFloatingPos(null);
      return;
    }

    setSavedRange(range.cloneRange());
    setSelectedTextPreview(text);

    const rect = range.getBoundingClientRect();
    const containerRect = editorRef.current.getBoundingClientRect();

    setFloatingPos({
      top: Math.max(10, rect.top - containerRect.top - 50),
      left: Math.max(10, Math.min(containerRect.width - 240, rect.left - containerRect.left + (rect.width / 2) - 120))
    });
  };

  // Restore range before executing format commands
  const restoreRange = () => {
    if (savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
    }
  };

  // Apply basic formatting commands (Bold, Italic, Underline, Strikethrough)
  const execFormat = (cmd: string, val: string | undefined = undefined) => {
    restoreRange();
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setMainContent(editorRef.current.innerHTML);
    }
  };

  // Apply custom inline span style (Color, Highlight, Size, Tag)
  const applyCustomSpan = (styleStr: string, className = '') => {
    restoreRange();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    const span = document.createElement('span');
    if (styleStr) span.style.cssText = styleStr;
    if (className) span.className = className;
    span.textContent = selectedText;

    range.deleteContents();
    range.insertNode(span);

    // Keep caret after the newly formatted node
    const newRange = document.createRange();
    newRange.setStartAfter(span);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setFloatingPos(null);
    if (editorRef.current) {
      setMainContent(editorRef.current.innerHTML);
    }
  };

  // Apply specific Text Color to selected word
  const handleApplyColor = (color: string) => {
    applyCustomSpan(`color: ${color}; font-weight: inherit;`);
    setShowColorPicker(false);
  };

  // Apply specific Highlight / Background Color to selected word
  const handleApplyHighlight = (color: string) => {
    if (color === 'transparent') {
      execFormat('removeFormat');
    } else {
      applyCustomSpan(`background-color: ${color}; border-radius: 4px; padding: 1px 4px;`);
    }
    setShowHighlightPicker(false);
  };

  // Apply Font Size to selected word
  const handleApplyFontSize = (sizePx: string) => {
    applyCustomSpan(`font-size: ${sizePx}; display: inline-block;`);
    setShowSizeDropdown(false);
  };

  // Apply Badge Pill styling to selected word
  const handleApplyBadge = (bgColor: string, textColor: string) => {
    applyCustomSpan(
      `background-color: ${bgColor}; color: ${textColor}; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 0.85em; display: inline-block; margin: 0 2px;`
    );
  };

  // Add rich block
  const addBlock = (block: RichBlock) => {
    setBlocks((prev) => [...prev, block]);
    setActiveModal(null);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Insert Photo
  const handleInsertImage = () => {
    if (!tempImageUrl.trim()) {
      alert('이미지 웹 URL을 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'image',
      url: tempImageUrl.trim(),
      caption: tempImageCaption.trim() || undefined
    });
    setTempImageUrl('');
    setTempImageCaption('');
  };

  // Insert Quote
  const handleInsertQuote = () => {
    if (!tempQuoteText.trim()) {
      alert('인용할 문구를 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'quote',
      content: tempQuoteText.trim(),
      quoteAuthor: tempQuoteAuthor.trim() || undefined,
      quoteStyle: tempQuoteStyle
    });
    setTempQuoteText('');
    setTempQuoteAuthor('');
  };

  // Insert Divider
  const handleInsertDivider = (style: 'solid' | 'dashed' | 'dotted' | 'curved') => {
    addBlock({
      id: String(Date.now()),
      type: 'divider',
      dividerStyle: style
    });
  };

  // Insert Sticker
  const handleInsertSticker = (sticker: string) => {
    addBlock({
      id: String(Date.now()),
      type: 'sticker',
      sticker
    });
  };

  // Insert Place
  const handleInsertPlace = () => {
    if (!tempPlaceName.trim()) {
      alert('장소 이름을 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'place',
      placeName: tempPlaceName.trim(),
      placeDesc: tempPlaceDesc.trim() || undefined
    });
    setTempPlaceName('');
    setTempPlaceDesc('');
  };

  // Insert Poll
  const handleInsertPoll = () => {
    if (!tempPollQuestion.trim()) {
      alert('투표 주제/질문을 입력해주세요.');
      return;
    }
    const filteredOptions = tempPollOptions.filter((o) => o.trim().length > 0);
    if (filteredOptions.length < 2) {
      alert('최소 2개 이상의 선택지를 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'poll',
      pollQuestion: tempPollQuestion.trim(),
      pollOptions: filteredOptions.map((opt, i) => ({
        id: `opt-${i}-${Date.now()}`,
        text: opt.trim(),
        votes: 0
      }))
    });
    setTempPollQuestion('');
    setTempPollOptions(['옵션 1', '옵션 2']);
  };

  // Insert Code
  const handleInsertCode = () => {
    if (!tempCode.trim()) {
      alert('코드를 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'code',
      content: tempCode.trim(),
      codeLanguage: tempCodeLang
    });
    setTempCode('');
  };

  // Insert Math
  const handleInsertMath = () => {
    if (!tempMath.trim()) {
      alert('수식을 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'math',
      content: tempMath.trim()
    });
    setTempMath('');
  };

  // Insert Schedule
  const handleInsertSchedule = () => {
    if (!tempScheduleTitle.trim()) {
      alert('일정 제목을 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'schedule',
      scheduleTitle: tempScheduleTitle.trim(),
      scheduleDate: tempScheduleDate.trim() || '오늘'
    });
    setTempScheduleTitle('');
    setTempScheduleDate('');
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!tempLinkUrl.trim()) {
      alert('링크 URL을 입력해주세요.');
      return;
    }
    addBlock({
      id: String(Date.now()),
      type: 'link',
      url: tempLinkUrl.trim(),
      content: tempLinkText.trim() || tempLinkUrl.trim()
    });
    setTempLinkUrl('');
    setTempLinkText('');
  };

  // Insert Table
  const handleInsertTable = (rows: number, cols: number) => {
    const tableData: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(r === 0 ? `항목 ${c + 1}` : `내용 ${r}-${c + 1}`);
      }
      tableData.push(row);
    }
    addBlock({
      id: String(Date.now()),
      type: 'table',
      tableData
    });
  };

  // Publish Form Submission (New post or Update existing post)
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !editingPost) {
      onOpenLogin();
      return;
    }
    if (!title.trim()) {
      alert('글 제목을 입력해 주세요.');
      return;
    }

    const currentHtml = editorRef.current ? editorRef.current.innerHTML.trim() : mainContent.trim();
    if (!currentHtml && blocks.length === 0) {
      alert('글 본문 내용을 입력해 주세요.');
      return;
    }

    if (editingPost && onUpdatePost) {
      onUpdatePost(editingPost.id, title.trim(), currentHtml, selectedCategory, selectedEmoji, blocks);
    } else {
      onPublish(title.trim(), currentHtml, selectedCategory, selectedEmoji, blocks);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  if (!user && !editingPost) {
    return (
      <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-[#F7CAC9]/30 flex items-center justify-center mx-auto text-3xl mb-4">
          ✏️
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">로그인이 필요합니다</h3>
        <p className="text-xs text-gray-400 mb-6">
          5학년 3반 학생 계정 또는 선생님 계정으로 로그인한 후 나만의 멋진 블로그 글을 작성할 수 있습니다.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 cursor-pointer"
          >
            돌아가기
          </button>
          <button
            onClick={onOpenLogin}
            className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md cursor-pointer"
            style={{ backgroundColor: '#92A8D1' }}
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const isUserAdmin =
    (user && (user.role === 'admin' || user.name.includes('선생님') || user.name.includes('관리자'))) ||
    (editingPost && (editingPost.isAdmin || editingPost.author.includes('선생님')));

  const displayAuthorName = user ? user.name : (editingPost ? editingPost.author : '작성자');

  return (
    <div className="w-full space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {savedDraftToast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>임시저장되었습니다! 언제든 이어서 작성할 수 있어요.</span>
        </div>
      )}

      {/* Top Header Controls Bar */}
      <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            title="목록으로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">작성자:</span>
              <span className={`text-xs font-black flex items-center gap-1 ${
                isUserAdmin ? 'text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200' : 'text-gray-800'
              }`}>
                {isUserAdmin && <Crown className="w-3 h-3 text-amber-600" />}
                {displayAuthorName} {isUserAdmin && '(관리자)'}
              </span>
              {editingPost && (
                <span className="text-[10px] font-extrabold bg-[#92A8D1]/20 text-[#6B84B5] px-2 py-0.5 rounded-full border border-[#92A8D1]/40 flex items-center gap-1">
                  <PenLine className="w-2.5 h-2.5" />
                  <span>수정 모드</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-2xl text-xs">
            <span className="text-gray-400 font-bold">카테고리:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const cat = categories.find((c) => c.name === e.target.value);
                setSelectedCategory(e.target.value);
                if (cat?.emoji) setSelectedEmoji(cat.emoji);
              }}
              className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Draft Save Button (only when creating new post) */}
          {!editingPost && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>임시저장</span>
            </button>
          )}

          {/* Cancel button if editing */}
          {editingPost && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>수정 취소</span>
            </button>
          )}

          {/* Publish / Update Button */}
          <button
            id="editor-publish-btn"
            type="button"
            onClick={handlePublishSubmit}
            className="px-5 sm:px-6 py-2.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            style={{
              backgroundColor: editingPost
                ? '#6B84B5'
                : (isUserAdmin ? '#92A8D1' : '#F7CAC9')
            }}
          >
            {editingPost ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>수정 완료 (저장)</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>발행하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Editor Canvas Container */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* 1. Title Input Area */}
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-[#FDFCF0]/50">
          <div className="max-w-4xl mx-auto">
            <input
              id="editor-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해 주세요."
              className="w-full text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 placeholder-gray-300 bg-transparent outline-none border-b-2 border-transparent focus:border-[#F7CAC9] pb-2 transition-all"
            />
          </div>
        </div>

        {/* 2. Top SmartEditor Block Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 overflow-x-auto scrollbar-none shadow-2xs">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {/* 사진 (Photo) */}
            <button
              type="button"
              onClick={() => setActiveModal('image')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-[#F7CAC9]/15 hover:text-[#E89E9D] transition-colors cursor-pointer group"
            >
              <ImageIcon className="w-4 h-4 text-gray-500 group-hover:text-[#E89E9D] mb-0.5" />
              <span className="text-[11px] font-medium">사진</span>
            </button>

            {/* 동영상 (Video) */}
            <button
              type="button"
              onClick={() => setActiveModal('video')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Video className="w-4 h-4 text-gray-500 group-hover:text-red-500 mb-0.5" />
              <span className="text-[11px] font-medium">동영상</span>
            </button>

            {/* 스티커 (Sticker) */}
            <button
              type="button"
              onClick={() => setActiveModal('sticker')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-colors cursor-pointer group"
            >
              <Smile className="w-4 h-4 text-gray-500 group-hover:text-amber-500 mb-0.5" />
              <span className="text-[11px] font-medium">스티커</span>
            </button>

            {/* 인용구 (Quote) */}
            <button
              type="button"
              onClick={() => setActiveModal('quote')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Quote className="w-4 h-4 text-gray-500 group-hover:text-gray-800 mb-0.5" />
              <span className="text-[11px] font-medium flex items-center gap-0.5">인용구 <ChevronDown className="w-2.5 h-2.5" /></span>
            </button>

            {/* 구분선 (Divider) */}
            <button
              type="button"
              onClick={() => setActiveModal('divider')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Minus className="w-4 h-4 text-gray-500 group-hover:text-gray-800 mb-0.5" />
              <span className="text-[11px] font-medium flex items-center gap-0.5">구분선 <ChevronDown className="w-2.5 h-2.5" /></span>
            </button>

            {/* 링크 (Link) */}
            <button
              type="button"
              onClick={() => setActiveModal('link')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Link2 className="w-4 h-4 text-gray-500 group-hover:text-indigo-500 mb-0.5" />
              <span className="text-[11px] font-medium">링크</span>
            </button>

            {/* 장소 (Place) */}
            <button
              type="button"
              onClick={() => setActiveModal('place')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer group"
            >
              <MapPin className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 mb-0.5" />
              <span className="text-[11px] font-medium">장소</span>
            </button>

            {/* 글감 (Ideas / Prompts) */}
            <button
              type="button"
              onClick={() => setActiveModal('prompts')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 transition-colors cursor-pointer group"
            >
              <Lightbulb className="w-4 h-4 text-gray-500 group-hover:text-yellow-500 mb-0.5" />
              <span className="text-[11px] font-medium">글감</span>
            </button>

            {/* 투표 (Poll) */}
            <button
              type="button"
              onClick={() => setActiveModal('poll')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors cursor-pointer group"
            >
              <Vote className="w-4 h-4 text-gray-500 group-hover:text-purple-500 mb-0.5" />
              <span className="text-[11px] font-medium">투표</span>
            </button>

            {/* 일정 (Schedule) */}
            <button
              type="button"
              onClick={() => setActiveModal('schedule')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer group"
            >
              <Calendar className="w-4 h-4 text-gray-500 group-hover:text-blue-500 mb-0.5" />
              <span className="text-[11px] font-medium">일정</span>
            </button>

            {/* 표 (Table) */}
            <button
              type="button"
              onClick={() => setActiveModal('table')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <TableIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-800 mb-0.5" />
              <span className="text-[11px] font-medium">표</span>
            </button>

            {/* 소스코드 (Code) */}
            <button
              type="button"
              onClick={() => setActiveModal('code')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Code2 className="w-4 h-4 text-gray-500 group-hover:text-gray-800 mb-0.5" />
              <span className="text-[11px] font-medium">소스코드</span>
            </button>

            {/* 수식 (Math) */}
            <button
              type="button"
              onClick={() => setActiveModal('math')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <SquareRadical className="w-4 h-4 text-gray-500 group-hover:text-teal-600 mb-0.5" />
              <span className="text-[11px] font-medium">수식</span>
            </button>
          </div>
        </div>

        {/* 3. Text & Word-Level Formatting Toolbar */}
        <div className="bg-gray-50/95 border-b border-gray-200 px-4 sm:px-6 py-2 flex flex-wrap items-center gap-1 sm:gap-2 text-xs">
          
          {/* Font Family selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 cursor-pointer shadow-2xs"
            >
              <span>{FONT_FAMILIES.find((f) => f.value === fontFamily)?.label.split(' ')[0] || '기본서체'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showFontDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl py-1 z-30 w-36">
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => { setFontFamily(f.value); setShowFontDropdown(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700 cursor-pointer"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size selector for selected word */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 cursor-pointer shadow-2xs"
              title="선택한 글자 크기 변경"
            >
              <Type className="w-3 h-3 text-gray-500" />
              <span>크기</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showSizeDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl py-1 z-30 w-32">
                <div className="px-3 py-1 text-[10px] text-gray-400 font-bold border-b border-gray-100">
                  선택한 단어 크기
                </div>
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleApplyFontSize(s.value)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700 cursor-pointer font-bold"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden sm:block" />

          {/* Bold, Italic, Underline, Strikethrough for Selected Text */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execFormat('bold'); }}
            className="p-1.5 rounded-xl transition-colors cursor-pointer bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs active:bg-gray-200"
            title="선택한 단어 굵게 (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execFormat('italic'); }}
            className="p-1.5 rounded-xl transition-colors cursor-pointer bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs active:bg-gray-200"
            title="선택한 단어 기울임 (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execFormat('underline'); }}
            className="p-1.5 rounded-xl transition-colors cursor-pointer bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs active:bg-gray-200"
            title="선택한 단어 밑줄 (Underline)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execFormat('strikeThrough'); }}
            className="p-1.5 rounded-xl transition-colors cursor-pointer bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs active:bg-gray-200"
            title="선택한 단어 취소선 (Strikethrough)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Text Color Palette Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer shadow-2xs"
              title="선택한 글자 색상 변경"
            >
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold">글자색</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-30 w-56 space-y-2">
                <p className="text-[11px] font-bold text-gray-500">선택한 단어의 글자 색상</p>
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_COLORS.map((tc) => (
                    <button
                      key={tc.color}
                      type="button"
                      onClick={() => handleApplyColor(tc.color)}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-50 border border-gray-100 cursor-pointer text-left transition-transform hover:scale-105"
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-white"
                        style={{ backgroundColor: tc.color }}
                      />
                      <span className="text-[10px] font-bold truncate text-gray-700">{tc.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Highlight Color Palette Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer shadow-2xs"
              title="선택한 단어 형광펜 강조"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold">형광펜</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showHighlightPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-30 w-56 space-y-2">
                <p className="text-[11px] font-bold text-gray-500">선택한 단어 형광펜 배경색</p>
                <div className="grid grid-cols-2 gap-2">
                  {HIGHLIGHT_COLORS.map((hc) => (
                    <button
                      key={hc.color}
                      type="button"
                      onClick={() => handleApplyHighlight(hc.color)}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-50 border border-gray-100 cursor-pointer text-left transition-transform hover:scale-105"
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0 border border-gray-200 flex items-center justify-center text-[8px]"
                        style={{ backgroundColor: hc.color }}
                      >
                        {hc.color === 'transparent' ? '✕' : ''}
                      </div>
                      <span className="text-[10px] font-bold truncate text-gray-700">{hc.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Keyword Badge Tag Preset Button */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleApplyBadge('#F7CAC9', '#882222')}
              className="px-2.5 py-1 bg-[#F7CAC9]/30 hover:bg-[#F7CAC9]/50 text-[#E89E9D] border border-[#F7CAC9] rounded-full text-[11px] font-bold cursor-pointer transition-colors"
              title="선택한 단어를 로즈쿼츠 배지 태그로 만들기"
            >
              🏷️ 핑크배지
            </button>
            <button
              type="button"
              onClick={() => handleApplyBadge('#92A8D1', '#1e3a8a')}
              className="px-2.5 py-1 bg-[#92A8D1]/30 hover:bg-[#92A8D1]/50 text-[#6B84B5] border border-[#92A8D1] rounded-full text-[11px] font-bold cursor-pointer transition-colors"
              title="선택한 단어를 세레니티 배지 태그로 만들기"
            >
              🏷️ 블루배지
            </button>
          </div>

          <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden sm:block" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => { setTextAlign('left'); execFormat('justifyLeft'); }}
              className={`p-1.5 rounded-xl border border-gray-200 bg-white ${textAlign === 'left' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-100'} cursor-pointer`}
              title="왼쪽 정렬"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setTextAlign('center'); execFormat('justifyCenter'); }}
              className={`p-1.5 rounded-xl border border-gray-200 bg-white ${textAlign === 'center' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-100'} cursor-pointer`}
              title="가운데 정렬"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setTextAlign('right'); execFormat('justifyRight'); }}
              className={`p-1.5 rounded-xl border border-gray-200 bg-white ${textAlign === 'right' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-100'} cursor-pointer`}
              title="오른쪽 정렬"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Main Interactive Canvas Editor Area */}
        <div className="p-6 sm:p-10 min-h-[440px] max-w-4xl w-full mx-auto space-y-6 relative">
          
          {/* Helpful Tips Badge */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <p className="text-[11px] sm:text-xs">
                <strong>글자 서식 팁:</strong> 특정 단어를 마우스로 드래그하여 선택하면 팝업 툴바와 상단 메뉴에서 <strong>볼드체, 색상, 형광펜, 크기</strong>를 그 단어에만 자유롭게 적용할 수 있습니다!
              </p>
            </div>
          </div>

          {/* Floating Selection Quick Mini-Toolbar */}
          {floatingPos && (
            <div
              className="absolute z-40 bg-gray-900 text-white px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 border border-gray-700"
              style={{
                top: `${floatingPos.top}px`,
                left: `${floatingPos.left}px`
              }}
            >
              <span className="text-[10px] text-gray-400 font-mono pr-1 max-w-[60px] truncate">
                &ldquo;{selectedTextPreview}&rdquo;
              </span>

              {/* Bold */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execFormat('bold'); }}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer text-white font-bold"
                title="굵게"
              >
                <Bold className="w-3 h-3" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execFormat('italic'); }}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer text-white"
                title="기울임"
              >
                <Italic className="w-3 h-3" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execFormat('underline'); }}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer text-white"
                title="밑줄"
              >
                <Underline className="w-3 h-3" />
              </button>

              <div className="w-[1px] h-3.5 bg-gray-700 mx-0.5" />

              {/* Quick Rose Color */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleApplyColor('#E89E9D'); }}
                className="w-4 h-4 rounded-full bg-[#E89E9D] border border-white/50 transition-transform hover:scale-125 cursor-pointer"
                title="로즈쿼츠 색상"
              />

              {/* Quick Blue Color */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleApplyColor('#6B84B5'); }}
                className="w-4 h-4 rounded-full bg-[#6B84B5] border border-white/50 transition-transform hover:scale-125 cursor-pointer"
                title="세레니티 색상"
              />

              {/* Quick Red Color */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleApplyColor('#DC2626'); }}
                className="w-4 h-4 rounded-full bg-[#DC2626] border border-white/50 transition-transform hover:scale-125 cursor-pointer"
                title="빨간색"
              />

              {/* Quick Yellow Highlight */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleApplyHighlight('#FEF08A'); }}
                className="w-4 h-4 rounded-full bg-[#FEF08A] border border-white/50 transition-transform hover:scale-125 cursor-pointer"
                title="노랑 형광펜"
              />

              {/* Quick Pink Highlight */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleApplyHighlight('#FBCFE8'); }}
                className="w-4 h-4 rounded-full bg-[#FBCFE8] border border-white/50 transition-transform hover:scale-125 cursor-pointer"
                title="핑크 형광펜"
              />

              <div className="w-[1px] h-3.5 bg-gray-700 mx-0.5" />

              {/* Quick Large Size */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleApplyFontSize('18px'); }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 font-bold text-amber-300 cursor-pointer"
                title="크게 (18px)"
              >
                크게
              </button>
            </div>
          )}

          {/* WYSIWYG ContentEditable Text Canvas Area */}
          <div className="relative min-h-[260px]">
            <div
              id="editor-wysiwyg-content"
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onMouseUp={checkSelection}
              onKeyUp={checkSelection}
              onBlur={() => {
                if (editorRef.current) {
                  setMainContent(editorRef.current.innerHTML);
                }
              }}
              onInput={() => {
                if (editorRef.current) {
                  setMainContent(editorRef.current.innerHTML);
                }
              }}
              className={`w-full min-h-[240px] p-4 rounded-2xl outline-none transition-all text-gray-800 leading-relaxed ${fontFamily} text-sm sm:text-base border-2 border-transparent focus:border-[#92A8D1]/40`}
              style={{
                textAlign
              }}
              data-placeholder="내용을 입력하세요. 특정 단어를 드래그하여 색상이나 굵기를 예쁘게 꾸며보세요!"
            />
          </div>

          {/* Rendered Interactive Multimedia Blocks */}
          {blocks.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-dashed border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  삽입된 멀티미디어 &amp; 컴포넌트 ({blocks.length}개)
                </span>
                <span className="text-[11px] text-gray-400">카드를 눌러 삭제할 수 있습니다</span>
              </div>

              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="relative group p-4 rounded-2xl bg-gray-50/80 border border-gray-200 transition-all hover:border-[#F7CAC9]"
                >
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-xl bg-white shadow-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="이 블록 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Image Block */}
                  {block.type === 'image' && (
                    <div className="space-y-2 text-center">
                      <img
                        src={block.url}
                        alt="삽입된 이미지"
                        className="max-h-72 w-auto mx-auto rounded-2xl object-cover shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      {block.caption && (
                        <p className="text-xs text-gray-500 italic">📷 {block.caption}</p>
                      )}
                    </div>
                  )}

                  {/* Quote Block */}
                  {block.type === 'quote' && (
                    <div
                      className={`p-4 rounded-2xl ${
                        block.quoteStyle === 'box'
                          ? 'bg-[#F7CAC9]/15 border-2 border-[#F7CAC9]/40'
                          : block.quoteStyle === 'speech'
                          ? 'bg-blue-50 border border-blue-200 rounded-bl-none'
                          : 'border-l-4 border-[#92A8D1] bg-white pl-4'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-700 italic leading-relaxed">
                        &ldquo;{block.content}&rdquo;
                      </p>
                      {block.quoteAuthor && (
                        <p className="text-xs text-gray-400 text-right mt-1.5 font-medium">
                          — {block.quoteAuthor}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Divider Block */}
                  {block.type === 'divider' && (
                    <div className="py-2">
                      {block.dividerStyle === 'dashed' && <div className="border-t-2 border-dashed border-gray-300" />}
                      {block.dividerStyle === 'dotted' && <div className="border-t-2 border-dotted border-[#92A8D1]" />}
                      {block.dividerStyle === 'curved' && (
                        <div className="text-center text-gray-400 text-sm tracking-widest">~ • 🌸 5-3 • ~</div>
                      )}
                      {(!block.dividerStyle || block.dividerStyle === 'solid') && (
                        <div className="border-t border-gray-300" />
                      )}
                    </div>
                  )}

                  {/* Sticker Block */}
                  {block.type === 'sticker' && (
                    <div className="text-center py-2">
                      <span className="text-6xl inline-block transform hover:scale-110 transition-transform">
                        {block.sticker}
                      </span>
                    </div>
                  )}

                  {/* Place Block */}
                  {block.type === 'place' && (
                    <div className="flex items-center gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">📍 {block.placeName}</h4>
                        {block.placeDesc && <p className="text-[11px] text-emerald-700">{block.placeDesc}</p>}
                      </div>
                    </div>
                  )}

                  {/* Poll Block */}
                  {block.type === 'poll' && (
                    <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-bold text-purple-900">학급 투표: {block.pollQuestion}</h4>
                      </div>
                      <div className="space-y-1.5">
                        {block.pollOptions?.map((opt) => (
                          <div
                            key={opt.id}
                            className="bg-white p-2.5 rounded-xl border border-purple-100 text-xs font-medium text-gray-700 flex items-center justify-between"
                          >
                            <span>{opt.text}</span>
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">0표</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule Block */}
                  {block.type === 'schedule' && (
                    <div className="flex items-center gap-3 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-700">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-blue-900">📅 {block.scheduleTitle}</h4>
                        <p className="text-[11px] text-blue-700">일시: {block.scheduleDate}</p>
                      </div>
                    </div>
                  )}

                  {/* Code Block */}
                  {block.type === 'code' && (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto">
                      <div className="text-[10px] text-gray-400 mb-1 font-sans">{block.codeLanguage?.toUpperCase()}</div>
                      <pre>{block.content}</pre>
                    </div>
                  )}

                  {/* Math Formula Block */}
                  {block.type === 'math' && (
                    <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200 text-center font-serif text-sm font-bold text-teal-900">
                      수식: {block.content}
                    </div>
                  )}

                  {/* Link Block */}
                  {block.type === 'link' && (
                    <a
                      href={block.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 text-xs text-indigo-600 font-semibold"
                    >
                      <Link2 className="w-4 h-4" />
                      <span className="truncate">{block.content || block.url}</span>
                    </a>
                  )}

                  {/* Table Block */}
                  {block.type === 'table' && block.tableData && (
                    <div className="overflow-x-auto">
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
        </div>
      </div>

      {/* --- Modals for Media & Interactive Block Insertion --- */}

      {/* 1. Image Insert Modal */}
      {activeModal === 'image' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#E89E9D]" />
                <h3 className="font-bold text-gray-800 text-sm">사진 삽입하기</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">이미지 웹 URL 링크</label>
                <input
                  type="url"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#F7CAC9]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">사진 설명 / 캡션 (선택)</label>
                <input
                  type="text"
                  value={tempImageCaption}
                  onChange={(e) => setTempImageCaption(e.target.value)}
                  placeholder="예: 우리 반 과학 실험 모습"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#F7CAC9]"
                />
              </div>

              {/* Sample Quick Unsplash Photo buttons */}
              <div>
                <span className="text-[11px] text-gray-400 font-medium block mb-1.5">추천 학급 테마 사진:</span>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTempImageUrl('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] cursor-pointer"
                  >
                    🏫 학교 교실
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempImageUrl('https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] cursor-pointer"
                  >
                    📚 책과 독서
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempImageUrl('https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] cursor-pointer"
                  >
                    🎨 미술 그리기
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempImageUrl('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] cursor-pointer"
                  >
                    ⚽ 신나는 체육
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-xs"
                style={{ backgroundColor: '#F7CAC9' }}
              >
                사진 삽입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quote Insert Modal */}
      {activeModal === 'quote' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-800 text-sm">인용구 삽입</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">인용 문구</label>
                <textarea
                  rows={3}
                  value={tempQuoteText}
                  onChange={(e) => setTempQuoteText(e.target.value)}
                  placeholder="기억에 남는 문장이나 친구의 명언을 입력하세요."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#92A8D1]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">출처 / 인물 (선택)</label>
                <input
                  type="text"
                  value={tempQuoteAuthor}
                  onChange={(e) => setTempQuoteAuthor(e.target.value)}
                  placeholder="예: 어린 왕자 中, 김민준 학생"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#92A8D1]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">인용구 스타일</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempQuoteStyle('line')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      tempQuoteStyle === 'line' ? 'border-[#92A8D1] bg-[#92A8D1]/15 text-[#6B84B5]' : 'border-gray-200'
                    }`}
                  >
                    라인형
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempQuoteStyle('box')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      tempQuoteStyle === 'box' ? 'border-[#F7CAC9] bg-[#F7CAC9]/20 text-[#E89E9D]' : 'border-gray-200'
                    }`}
                  >
                    박스형
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempQuoteStyle('speech')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      tempQuoteStyle === 'speech' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200'
                    }`}
                  >
                    말풍선형
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertQuote}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-xs"
                style={{ backgroundColor: '#92A8D1' }}
              >
                인용구 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Divider Insert Modal */}
      {activeModal === 'divider' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Minus className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-800 text-sm">구분선 스타일 선택</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button
                type="button"
                onClick={() => handleInsertDivider('solid')}
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-gray-400 text-left space-y-1.5 cursor-pointer"
              >
                <span className="font-bold text-gray-700">실선 구분선</span>
                <div className="border-t border-gray-300 w-full" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertDivider('dashed')}
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-gray-400 text-left space-y-1.5 cursor-pointer"
              >
                <span className="font-bold text-gray-700">점선(대시) 구분선</span>
                <div className="border-t-2 border-dashed border-gray-300 w-full" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertDivider('dotted')}
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-gray-400 text-left space-y-1.5 cursor-pointer"
              >
                <span className="font-bold text-gray-700">도트(점) 구분선</span>
                <div className="border-t-2 border-dotted border-[#92A8D1] w-full" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertDivider('curved')}
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-gray-400 text-left space-y-1 cursor-pointer"
              >
                <span className="font-bold text-gray-700">꽃장식 구분선</span>
                <div className="text-center text-gray-400 text-xs font-mono">~ • 🌸 5-3 • ~</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sticker Insert Modal */}
      {activeModal === 'sticker' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-800 text-sm">감정 &amp; 활동 스티커 선택</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {STICKER_PRESETS.map((stk) => (
                <button
                  key={stk.name}
                  type="button"
                  onClick={() => handleInsertSticker(stk.emoji)}
                  className="p-3 rounded-2xl bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 cursor-pointer"
                >
                  <span className="text-3xl">{stk.emoji}</span>
                  <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{stk.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Prompts / Ideas Modal */}
      {activeModal === 'prompts' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-gray-800 text-sm">오늘의 추천 글감 아이디어</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              무슨 이야기를 쓸지 고민될 때 아래 주제 중 마음에 드는 글감을 골라보세요!
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {WRITING_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(prompt.slice(2));
                    setActiveModal(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-yellow-50/60 hover:bg-yellow-100/70 border border-yellow-200 text-left text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Place Modal */}
      {activeModal === 'place' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-800 text-sm">장소 정보 추가</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">장소명</label>
                <input
                  type="text"
                  value={tempPlaceName}
                  onChange={(e) => setTempPlaceName(e.target.value)}
                  placeholder="예: 5학년 3반 교실, 학교 운동장, 국립중앙박물관"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-bold mb-1">장소 설명 (선택)</label>
                <input
                  type="text"
                  value={tempPlaceDesc}
                  onChange={(e) => setTempPlaceDesc(e.target.value)}
                  placeholder="예: 우리 반 현장체험학습 장소"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertPlace}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 cursor-pointer shadow-xs"
              >
                장소 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Poll Modal */}
      {activeModal === 'poll' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-800 text-sm">학급 투표 만들기</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">투표 질문 / 주제</label>
                <input
                  type="text"
                  value={tempPollQuestion}
                  onChange={(e) => setTempPollQuestion(e.target.value)}
                  placeholder="예: 이번 체육 시간에 하고 싶은 종목은?"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">선택지 목록</label>
                <div className="space-y-1.5">
                  {tempPollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...tempPollOptions];
                          updated[i] = e.target.value;
                          setTempPollOptions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                      />
                      {tempPollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setTempPollOptions(tempPollOptions.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {tempPollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setTempPollOptions([...tempPollOptions, `선택지 ${tempPollOptions.length + 1}`])}
                      className="text-xs text-purple-600 font-bold hover:underline cursor-pointer"
                    >
                      + 선택지 추가
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertPoll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 cursor-pointer shadow-xs"
              >
                투표 생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Schedule Modal */}
      {activeModal === 'schedule' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800 text-sm">일정 공유</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">일정 내용</label>
                <input
                  type="text"
                  value={tempScheduleTitle}
                  onChange={(e) => setTempScheduleTitle(e.target.value)}
                  placeholder="예: 5학년 3반 학급 회의 및 마니또 발표"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-bold mb-1">날짜 및 시간</label>
                <input
                  type="text"
                  value={tempScheduleDate}
                  onChange={(e) => setTempScheduleDate(e.target.value)}
                  placeholder="예: 2024년 6월 15일 5교시"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertSchedule}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 cursor-pointer shadow-xs"
              >
                일정 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Table Modal */}
      {activeModal === 'table' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-800 text-sm">표 만들기</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleInsertTable(2, 2)}
                className="p-3 rounded-2xl border border-gray-200 hover:border-[#92A8D1] text-center font-bold"
              >
                2 x 2 표
              </button>
              <button
                type="button"
                onClick={() => handleInsertTable(3, 3)}
                className="p-3 rounded-2xl border border-gray-200 hover:border-[#92A8D1] text-center font-bold"
              >
                3 x 3 표
              </button>
              <button
                type="button"
                onClick={() => handleInsertTable(4, 2)}
                className="p-3 rounded-2xl border border-gray-200 hover:border-[#92A8D1] text-center font-bold"
              >
                4 x 2 표 (목록형)
              </button>
              <button
                type="button"
                onClick={() => handleInsertTable(3, 4)}
                className="p-3 rounded-2xl border border-gray-200 hover:border-[#92A8D1] text-center font-bold"
              >
                3 x 4 표 (시간표형)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Code Modal */}
      {activeModal === 'code' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-800 text-sm">소스코드 삽입</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <textarea
                rows={4}
                value={tempCode}
                onChange={(e) => setTempCode(e.target.value)}
                placeholder="print('Hello 5-3!')"
                className="w-full px-3.5 py-2.5 bg-gray-900 text-emerald-400 font-mono rounded-xl outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertCode}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gray-800 cursor-pointer shadow-xs"
              >
                코드 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Math Modal */}
      {activeModal === 'math' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SquareRadical className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-gray-800 text-sm">수식 삽입</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={tempMath}
                onChange={(e) => setTempMath(e.target.value)}
                placeholder="예: 3/4 + 1/2 = 5/4 = 1과 1/4"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertMath}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 cursor-pointer shadow-xs"
              >
                수식 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Link Modal */}
      {activeModal === 'link' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-800 text-sm">링크 추가</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">링크 주소 (URL)</label>
                <input
                  type="url"
                  value={tempLinkUrl}
                  onChange={(e) => setTempLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-bold mb-1">링크 제목 / 텍스트 (선택)</label>
                <input
                  type="text"
                  value={tempLinkText}
                  onChange={(e) => setTempLinkText(e.target.value)}
                  placeholder="예: EBS 만점왕 강의 보러가기"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 cursor-pointer shadow-xs"
              >
                링크 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
