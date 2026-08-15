export interface Student {
  id: number | string;
  name: string;
  pw: string;
  grade?: string;
  class?: string;
  avatar?: string;
  bio?: string;
}

export interface Post {
  id: number | string;
  author: string;
  content: string;
  date: string;
  category?: '일상' | '배움기록' | '독서' | '질문' | '칭찬';
  likes?: number;
  likedBy?: string[];
  emoji?: string;
}

export interface Comment {
  id: number | string;
  postId: number | string;
  author: string;
  text: string;
  date?: string;
}

export interface Database {
  Students: Student[];
  Posts: Post[];
  Comments: Comment[];
  Settings: Record<string, any>[];
}

export type ViewType = 'home' | 'myPosts' | 'control' | 'students';
