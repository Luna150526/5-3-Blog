export interface Student {
  id: number | string;
  name: string;
  pw: string;
  grade?: string;
  class?: string;
  avatar?: string;
  bio?: string;
  role?: 'admin' | 'student';
}

export interface Category {
  id: number | string;
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
}

export interface NoticeItem {
  id: number | string;
  tag: string;
  title: string;
  date?: string;
}

export interface GalleryItem {
  id: number | string;
  title: string;
  emoji?: string;
  color?: string;
  imageUrl?: string;
  description?: string;
  date?: string;
}

export interface RichBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'file' | 'quote' | 'divider' | 'sticker' | 'link' | 'place' | 'code' | 'math' | 'poll' | 'schedule' | 'table';
  content?: string;
  url?: string;
  caption?: string;
  videoType?: 'youtube' | 'file' | 'vimeo' | 'mp4';
  fileName?: string;
  fileSize?: string;
  quoteStyle?: 'line' | 'box' | 'speech' | 'marks';
  quoteAuthor?: string;
  dividerStyle?: 'solid' | 'dashed' | 'dotted' | 'curved';
  sticker?: string;
  placeName?: string;
  placeDesc?: string;
  codeLanguage?: string;
  pollQuestion?: string;
  pollOptions?: { id: string; text: string; votes: number }[];
  scheduleDate?: string;
  scheduleTitle?: string;
  tableData?: string[][];
}

export interface Post {
  id: number | string;
  author: string;
  title?: string;
  content: string;
  date: string;
  category?: string;
  likes?: number;
  likedBy?: string[];
  emoji?: string;
  blocks?: RichBlock[];
  coverImage?: string;
  isAdmin?: boolean;
}

export interface Comment {
  id: number | string;
  postId: number | string;
  author: string;
  text: string;
  date?: string;
  isAdmin?: boolean;
  parentId?: number | string | null;
  replyToAuthor?: string;
}

export interface Database {
  Students: Student[];
  Posts: Post[];
  Comments: Comment[];
  Categories?: Category[];
  Notices?: NoticeItem[];
  Gallery?: GalleryItem[];
  Settings: Record<string, any>[];
}

export type ViewType = 'home' | 'write' | 'myPosts' | 'control' | 'students' | 'gas';
