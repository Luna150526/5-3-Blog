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
  HelpCircle
} from 'lucide-react';
import { Student, Category, RichBlock } from '../types';

interface BlogEditorProps {
  user: Student | null;
  categories: Category[];
  onPublish: (title: string, content: string, category: string, emoji: string, blocks: RichBlock[]) => void;
  onCancel: () => void;
  onOpenLogin: () => void;
}

const FONT_FAMILIES = [
  { label: '기본서체', value: 'font-sans' },
  { label: '나눔고딕', value: 'font-sans tracking-tight' },
  { label: '마루부리(명조)', value: 'font-serif' },
  { label: '동글손글씨', value: 'font-mono' }
];

const FONT_SIZES = [
  { label: '11', value: 'text-xs' },
  { label: '13', value: 'text-[13px]' },
  { label: '15 (기본)', value: 'text-sm' },
  { label: '16', value: 'text-base' },
  { label: '19', value: 'text-lg' },
  { label: '24', value: 'text-xl' },
  { label: '28', value: 'text-2xl' }
];

const TEXT_COLORS = [
  { name: '기본', color: '#1F2937' },
  { name: '로즈쿼츠', color: '#E89E9D' },
  { name: '세레니티', color: '#6B84B5' },
  { name: '오렌지', color: '#EA580C' },
  { name: '그린', color: '#16A34A' },
  { name: '퍼플', color: '#9333EA' },
  { name: '레드', color: '#DC2626' }
];

const HIGHLIGHT_COLORS = [
  { name: '없음', color: 'transparent' },
  { name: '노랑형광', color: '#FEF08A' },
  { name: '핑크형광', color: '#FBCFE8' },
  { name: '하늘형광', color: '#BAE6FD' },
  { name: '연두형광', color: '#BBF7D0' },
  { name: '라벤더', color: '#E9D5FF' }
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

const DRAFT_STORAGE_KEY = 'class_5_3_editor_draft';

export const BlogEditor: React.FC<BlogEditorProps> = ({
  user,
  categories,
  onPublish,
  onCancel,
  onOpenLogin
}) => {
  // Post metadata
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || '일상');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(categories[0]?.emoji || '📝');
  
  // Editor main content
  const [mainContent, setMainContent] = useState('');
  const [blocks, setBlocks] = useState<RichBlock[]>([]);

  // Formatting state
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [fontSize, setFontSize] = useState('text-sm');
  const [headingStyle, setHeadingStyle] = useState('normal'); // 'normal' | 'h1' | 'h2' | 'h3'
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textColor, setTextColor] = useState('#1F2937');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  // Popups / Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

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

  // Load draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setMainContent(parsed.content);
        if (parsed.category) setSelectedCategory(parsed.category);
        if (parsed.emoji) setSelectedEmoji(parsed.emoji);
        if (parsed.blocks && Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save Draft
  const handleSaveDraft = () => {
    try {
      const draft = {
        title,
        content: mainContent,
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
      setBlocks([]);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  // Add rich blocks
  const addBlock = (block: RichBlock) => {
    setBlocks((prev) => [...prev, block]);
    setActiveModal(null);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Handle Photo Insert
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

  // Handle Quote Insert
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

  // Handle Divider Insert
  const handleInsertDivider = (style: 'solid' | 'dashed' | 'dotted' | 'curved') => {
    addBlock({
      id: String(Date.now()),
      type: 'divider',
      dividerStyle: style
    });
  };

  // Handle Sticker Insert
  const handleInsertSticker = (sticker: string) => {
    addBlock({
      id: String(Date.now()),
      type: 'sticker',
      sticker
    });
  };

  // Handle Place Insert
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

  // Handle Poll Insert
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

  // Handle Code Insert
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

  // Handle Math Insert
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

  // Handle Schedule Insert
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

  // Handle Link Insert
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

  // Handle Table Insert
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

  // Publish Form Submission
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }
    if (!title.trim()) {
      alert('글 제목을 입력해 주세요.');
      return;
    }
    if (!mainContent.trim() && blocks.length === 0) {
      alert('글 본문 내용을 입력해 주세요.');
      return;
    }

    onPublish(title.trim(), mainContent.trim(), selectedCategory, selectedEmoji, blocks);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-[#F7CAC9]/30 flex items-center justify-center mx-auto text-3xl mb-4">
          ✏️
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">로그인이 필요합니다</h3>
        <p className="text-xs text-gray-400 mb-6">
          5학년 3반 학생 계정으로 로그인한 후 나만의 멋진 블로그 글을 작성할 수 있습니다.
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

  return (
    <div className="w-full space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Action Header Bar */}
      <div className="bg-white px-5 sm:px-8 py-4 rounded-[32px] shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 sticky top-24 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="목록으로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-800">
                  {user.role === 'admin' || user.name.includes('선생님') || user.name.includes('관리자')
                    ? '선생님 관리자 글 작성'
                    : '새 글 작성'}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#92A8D1]/20 text-[#6B84B5]">
                  스마트에디터 ONE
                </span>
                {(user.role === 'admin' || user.name.includes('선생님') || user.name.includes('관리자')) && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                    👑 학급 관리자
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                {user.role === 'admin' || user.name.includes('선생님') || user.name.includes('관리자')
                  ? <>작성자: 👑 <strong className="text-gray-700">{user.name}</strong> (학급 관리자)</>
                  : <>작성자: 5학년 3반 <strong className="text-gray-700">{user.name}</strong> 학생</>}
              </p>
            </div>
          </div>
        </div>

        {/* Category & Publish Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200 text-xs">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                const found = categories.find((c) => c.name === e.target.value);
                if (found?.emoji) setSelectedEmoji(found.emoji);
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

          {/* Draft Save Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>임시저장</span>
          </button>

          {/* Publish Button */}
          <button
            id="editor-publish-btn"
            type="button"
            onClick={handlePublishSubmit}
            className="px-5 sm:px-6 py-2.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            style={{ backgroundColor: '#F7CAC9' }}
          >
            <Send className="w-4 h-4" />
            <span>발행하기</span>
          </button>
        </div>
      </div>

      {/* Main Editor Body Container */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* 1. Title Input Area (as in reference image) */}
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

        {/* 2. Top SmartEditor Toolbar (Media & Block Inserts - matching image) */}
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

            {/* MYBOX */}
            <button
              type="button"
              onClick={() => setActiveModal('image')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-[#92A8D1]/15 hover:text-[#6B84B5] transition-colors cursor-pointer group"
            >
              <UploadCloud className="w-4 h-4 text-gray-500 group-hover:text-[#6B84B5] mb-0.5" />
              <span className="text-[11px] font-medium">MYBOX</span>
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

            {/* 파일 (File) */}
            <button
              type="button"
              onClick={() => setActiveModal('link')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Paperclip className="w-4 h-4 text-gray-500 group-hover:text-gray-800 mb-0.5" />
              <span className="text-[11px] font-medium">파일</span>
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

        {/* 3. Bottom Text Formatting Toolbar (matching image) */}
        <div className="bg-gray-50/90 border-b border-gray-200 px-4 sm:px-6 py-2 flex flex-wrap items-center gap-1 sm:gap-2 text-xs">
          {/* Format / Heading selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              <span>{headingStyle === 'normal' ? '본문' : headingStyle === 'h1' ? '제목 1' : headingStyle === 'h2' ? '제목 2' : '제목 3'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showHeadingDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 w-28">
                <button
                  type="button"
                  onClick={() => { setHeadingStyle('normal'); setFontSize('text-sm'); setShowHeadingDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                >
                  본문
                </button>
                <button
                  type="button"
                  onClick={() => { setHeadingStyle('h1'); setFontSize('text-2xl'); setShowHeadingDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm font-black hover:bg-gray-50 text-gray-800"
                >
                  제목 1
                </button>
                <button
                  type="button"
                  onClick={() => { setHeadingStyle('h2'); setFontSize('text-lg'); setShowHeadingDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-gray-50 text-gray-800"
                >
                  제목 2
                </button>
                <button
                  type="button"
                  onClick={() => { setHeadingStyle('h3'); setFontSize('text-base'); setShowHeadingDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 text-gray-800"
                >
                  소제목
                </button>
              </div>
            )}
          </div>

          {/* Font Family selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              <span>{FONT_FAMILIES.find((f) => f.value === fontFamily)?.label || '기본서체'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showFontDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 w-32">
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => { setFontFamily(f.value); setShowFontDropdown(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
              className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              <span>{FONT_SIZES.find((s) => s.value === fontSize)?.label.split(' ')[0] || '15'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showSizeDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 w-24">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => { setFontSize(s.value); setShowSizeDropdown(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden sm:block" />

          {/* B / I / U / Strikethrough */}
          <button
            type="button"
            onClick={() => setIsBold(!isBold)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBold ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-700'
            }`}
            title="굵게 (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsItalic(!isItalic)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isItalic ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-700'
            }`}
            title="기울임 (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsUnderline(!isUnderline)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isUnderline ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-700'
            }`}
            title="밑줄 (Underline)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsStrikethrough(!isStrikethrough)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isStrikethrough ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-700'
            }`}
            title="취소선 (Strikethrough)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Text Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
              className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 cursor-pointer"
              title="글자 색상"
            >
              <Type className="w-3.5 h-3.5" style={{ color: textColor }} />
              <div className="w-3 h-1 rounded-xs" style={{ backgroundColor: textColor }} />
            </button>
            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-30 flex gap-1.5">
                {TEXT_COLORS.map((tc) => (
                  <button
                    key={tc.color}
                    type="button"
                    onClick={() => { setTextColor(tc.color); setShowColorPicker(false); }}
                    className="w-5 h-5 rounded-full border border-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: tc.color }}
                    title={tc.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
              className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 cursor-pointer"
              title="형광펜 강조"
            >
              <Highlighter className="w-3.5 h-3.5 text-gray-700" />
              <div className="w-3 h-1 rounded-xs" style={{ backgroundColor: highlightColor === 'transparent' ? '#ccc' : highlightColor }} />
            </button>
            {showHighlightPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-30 flex gap-1.5">
                {HIGHLIGHT_COLORS.map((hc) => (
                  <button
                    key={hc.color}
                    type="button"
                    onClick={() => { setHighlightColor(hc.color); setShowHighlightPicker(false); }}
                    className="w-5 h-5 rounded-full border border-gray-300 transition-transform hover:scale-110 flex items-center justify-center text-[8px]"
                    style={{ backgroundColor: hc.color }}
                    title={hc.name}
                  >
                    {hc.color === 'transparent' ? '✕' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden sm:block" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setTextAlign('left')}
              className={`p-1.5 rounded-lg ${textAlign === 'left' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
              title="왼쪽 정렬"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('center')}
              className={`p-1.5 rounded-lg ${textAlign === 'center' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
              title="가운데 정렬"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('right')}
              className={`p-1.5 rounded-lg ${textAlign === 'right' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
              title="오른쪽 정렬"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('justify')}
              className={`p-1.5 rounded-lg ${textAlign === 'justify' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
              title="양쪽 정렬"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Main Canvas Editor Area (matching reference image) */}
        <div className="p-6 sm:p-10 min-h-[420px] max-w-4xl w-full mx-auto space-y-6">
          
          {/* Main Text Content Area */}
          <div className="relative">
            <textarea
              id="editor-main-textarea"
              rows={8}
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              placeholder="내용을 입력하세요."
              style={{
                color: textColor,
                backgroundColor: highlightColor === 'transparent' ? 'transparent' : `${highlightColor}40`,
                textAlign
              }}
              className={`w-full p-4 rounded-2xl bg-transparent outline-none resize-none transition-all placeholder-gray-300 leading-relaxed ${fontFamily} ${fontSize} ${
                isBold ? 'font-black' : 'font-normal'
              } ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''} ${isStrikethrough ? 'line-through' : ''}`}
            />
          </div>

          {/* Rendered Interactive Blocks */}
          {blocks.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-dashed border-gray-200">
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
                        <div className="text-center text-gray-400 text-sm tracking-widest">~ • 🌸 • ~</div>
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
                        <h4 className="text-xs font-bold text-emerald-900">{block.placeName}</h4>
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
                        <h4 className="text-xs font-bold text-blue-900">{block.scheduleTitle}</h4>
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

        {/* 5. Footer Quick Bar */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-600">글자수: {mainContent.length + title.length}자</span>
            <span>•</span>
            <span>블록: {blocks.length}개</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              새로 쓰기 (내용 비우기)
            </button>
          </div>
        </div>
      </div>

      {/* Draft Saved Toast */}
      {savedDraftToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-900/90 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-xs">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>임시저장되었습니다. 언제든 이어서 쓸 수 있어요!</span>
          </div>
        </div>
      )}

      {/* ================= MODAL DIALOGS ================= */}

      {/* 1. Image Modal */}
      {activeModal === 'image' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#E89E9D]" />
                <span>사진 이미지 삽입</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">이미지 웹 URL 주소</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... 또는 웹 이미지 주소"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#F7CAC9]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-600 mb-1">사진 설명 / 캡션 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 우리 반 과학 실험 현장 사진"
                  value={tempImageCaption}
                  onChange={(e) => setTempImageCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#F7CAC9]"
                />
              </div>

              {/* Sample Quick Images */}
              <div>
                <label className="block font-bold text-gray-500 mb-1">추천 학급 이미지</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { title: '우주/과학', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400' },
                    { title: '독서/책', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
                    { title: '자연/화단', url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400' }
                  ].map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => { setTempImageUrl(s.url); setTempImageCaption(s.title); }}
                      className="p-1.5 rounded-xl border border-gray-100 hover:border-[#F7CAC9] text-center bg-gray-50"
                    >
                      <img src={s.url} alt={s.title} className="h-12 w-full object-cover rounded-lg mb-1" referrerPolicy="no-referrer" />
                      <span className="text-[10px] text-gray-600 font-medium">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                style={{ backgroundColor: '#F7CAC9' }}
              >
                사진 삽입하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quote Modal */}
      {activeModal === 'quote' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#92A8D1]" />
                <span>인용구 삽입</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">인용 스타일</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'line', label: '세로선 스타일' },
                    { id: 'box', label: '로즈 박스' },
                    { id: 'speech', label: '말풍선 스타일' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setTempQuoteStyle(st.id as any)}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold ${
                        tempQuoteStyle === st.id
                          ? 'border-[#92A8D1] bg-[#92A8D1]/15 text-[#6B84B5]'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">인용 문구</label>
                <textarea
                  rows={3}
                  placeholder="강조하고 싶은 명언이나 감동적인 책 속 한 줄을 입력하세요..."
                  value={tempQuoteText}
                  onChange={(e) => setTempQuoteText(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#92A8D1] resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">출처 / 인물 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 푸른 사자 와니니 중에서, 담임 선생님 말씀"
                  value={tempQuoteAuthor}
                  onChange={(e) => setTempQuoteAuthor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#92A8D1]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertQuote}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                style={{ backgroundColor: '#92A8D1' }}
              >
                인용구 넣기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Divider Modal */}
      {activeModal === 'divider' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800">구분선 모양 선택</h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button
                type="button"
                onClick={() => { handleInsertDivider('solid'); setActiveModal(null); }}
                className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left flex items-center justify-between"
              >
                <span>실선 구분선</span>
                <div className="w-24 border-t border-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => { handleInsertDivider('dashed'); setActiveModal(null); }}
                className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left flex items-center justify-between"
              >
                <span>점선 구분선</span>
                <div className="w-24 border-t-2 border-dashed border-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => { handleInsertDivider('dotted'); setActiveModal(null); }}
                className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left flex items-center justify-between"
              >
                <span>도트 세레니티 선</span>
                <div className="w-24 border-t-2 border-dotted border-[#92A8D1]" />
              </button>

              <button
                type="button"
                onClick={() => { handleInsertDivider('curved'); setActiveModal(null); }}
                className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left flex items-center justify-between"
              >
                <span>벚꽃 장식 구분선</span>
                <span className="text-[11px] text-gray-400">~ • 🌸 • ~</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sticker Modal */}
      {activeModal === 'sticker' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>스티커 선택</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              {STICKER_PRESETS.map((st) => (
                <button
                  key={st.name}
                  type="button"
                  onClick={() => { handleInsertSticker(st.emoji); setActiveModal(null); }}
                  className="aspect-square rounded-2xl bg-gray-50 hover:bg-[#F7CAC9]/20 border border-gray-100 flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer"
                  title={st.name}
                >
                  <span className="text-3xl mb-1">{st.emoji}</span>
                  <span className="text-[9px] text-gray-500 font-medium truncate w-full text-center px-1">
                    {st.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Writing Prompts Modal (글감) */}
      {activeModal === 'prompts' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>오늘의 글감 아이디어</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              어떤 글을 써야 할지 고민될 때, 추천 글감을 클릭하면 본문에 자동으로 추가됩니다.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {WRITING_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMainContent((prev) => (prev ? `${prev}\n\n[글감 주제: ${prompt}]\n` : `[글감 주제: ${prompt}]\n`));
                    setActiveModal(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-yellow-50 hover:border-yellow-200 border border-gray-100 text-left text-xs font-semibold text-gray-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Place Modal (장소) */}
      {activeModal === 'place' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>장소 태그 추가</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">장소명</label>
                <input
                  type="text"
                  placeholder="예: 5학년 3반 교실, 학교 도서관, 운동장, 과학실"
                  value={tempPlaceName}
                  onChange={(e) => setTempPlaceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-600 mb-1">장소 설명 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 방과후 배드민턴 연습을 했던 장소"
                  value={tempPlaceDesc}
                  onChange={(e) => setTempPlaceDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertPlace}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer bg-emerald-500 hover:bg-emerald-600"
              >
                장소 태그 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Poll Modal (투표) */}
      {activeModal === 'poll' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Vote className="w-4 h-4 text-purple-600" />
                <span>학급 투표 만들기</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">투표 질문 / 제목</label>
                <input
                  type="text"
                  placeholder="예: 이번 주 체육 시간에 하고 싶은 종목은?"
                  value={tempPollQuestion}
                  onChange={(e) => setTempPollQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">선택지 목록</label>
                <div className="space-y-2">
                  {tempPollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...tempPollOptions];
                          newOpts[i] = e.target.value;
                          setTempPollOptions(newOpts);
                        }}
                        placeholder={`선택지 ${i + 1}`}
                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                      />
                      {tempPollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setTempPollOptions(tempPollOptions.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {tempPollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setTempPollOptions([...tempPollOptions, `선택지 ${tempPollOptions.length + 1}`])}
                    className="mt-2 text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>선택지 추가하기</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertPoll}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer bg-purple-600 hover:bg-purple-700"
              >
                투표 삽입하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Table Modal */}
      {activeModal === 'table' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-gray-600" />
                <span>표(Table) 크기 선택</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { handleInsertTable(2, 2); setActiveModal(null); }}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-center font-bold"
              >
                2 x 2 표
              </button>
              <button
                type="button"
                onClick={() => { handleInsertTable(3, 3); setActiveModal(null); }}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-center font-bold"
              >
                3 x 3 표
              </button>
              <button
                type="button"
                onClick={() => { handleInsertTable(4, 2); setActiveModal(null); }}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-center font-bold"
              >
                4줄 x 2칸 표
              </button>
              <button
                type="button"
                onClick={() => { handleInsertTable(5, 3); setActiveModal(null); }}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-center font-bold"
              >
                5줄 x 3칸 표
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Code Modal */}
      {activeModal === 'code' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-gray-800" />
                <span>소스코드 삽입</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">언어 선택</label>
                <select
                  value={tempCodeLang}
                  onChange={(e) => setTempCodeLang(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="python">Python (파이썬)</option>
                  <option value="entry">엔트리 / 블록코딩 설명</option>
                  <option value="html">HTML / JavaScript</option>
                  <option value="c">C / C++</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">코드 내용</label>
                <textarea
                  rows={5}
                  value={tempCode}
                  onChange={(e) => setTempCode(e.target.value)}
                  placeholder="print('Hello 5-3 Class!')"
                  className="w-full p-3 font-mono bg-gray-900 text-gray-100 rounded-xl outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertCode}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer bg-gray-900"
              >
                코드 블록 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Math Modal */}
      {activeModal === 'math' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <SquareRadical className="w-4 h-4 text-teal-600" />
                <span>수학 수식 삽입</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={tempMath}
                onChange={(e) => setTempMath(e.target.value)}
                placeholder="예: 3/4 + 1/2 = 5/4 = 1과 1/4"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-400"
              />
              <div className="flex flex-wrap gap-1.5">
                {['1/2 + 2/3', '직사각형 넓이 = 가로 × 세로', 'π × r²', 'x + 5 = 12'].map((formula) => (
                  <button
                    key={formula}
                    type="button"
                    onClick={() => setTempMath(formula)}
                    className="px-2 py-1 rounded-lg bg-teal-50 text-teal-700 text-[10px] hover:bg-teal-100"
                  >
                    {formula}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertMath}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer bg-teal-600 hover:bg-teal-700"
              >
                수식 넣기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Schedule Modal */}
      {activeModal === 'schedule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>일정 삽입</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">일정 내용</label>
                <input
                  type="text"
                  value={tempScheduleTitle}
                  onChange={(e) => setTempScheduleTitle(e.target.value)}
                  placeholder="예: 2학기 현장체험학습 가는 날"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-600 mb-1">일시</label>
                <input
                  type="text"
                  value={tempScheduleDate}
                  onChange={(e) => setTempScheduleDate(e.target.value)}
                  placeholder="예: 2026년 9월 18일(금)"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertSchedule}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer bg-blue-600 hover:bg-blue-700"
              >
                일정 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Link / File Modal */}
      {activeModal === 'link' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <span>링크 / 파일 연결</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">연결할 URL 주소</label>
                <input
                  type="url"
                  value={tempLinkUrl}
                  onChange={(e) => setTempLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-600 mb-1">표시할 텍스트 (선택)</label>
                <input
                  type="text"
                  value={tempLinkText}
                  onChange={(e) => setTempLinkText(e.target.value)}
                  placeholder="예: 참고한 e학습터 영상 보러가기"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer bg-indigo-600 hover:bg-indigo-700"
              >
                링크 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. Video Modal */}
      {activeModal === 'video' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                <span>동영상 링크 삽입</span>
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">동영상 URL (YouTube 등)</label>
                <input
                  type="url"
                  value={tempVideoUrl}
                  onChange={(e) => setTempVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tempVideoUrl.trim()) return;
                  addBlock({
                    id: String(Date.now()),
                    type: 'link',
                    url: tempVideoUrl.trim(),
                    content: `🎬 동영상 링크: ${tempVideoUrl.trim()}`
                  });
                  setTempVideoUrl('');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer bg-red-500 hover:bg-red-600"
              >
                동영상 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
