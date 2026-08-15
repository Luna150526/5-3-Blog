export interface Student {
  id: number | string;
  name: string;
  pw: string;
  grade?: string;
  class?: string;
  avatar?: string;
  bio?: string;
}

export interface Category {
  id: number | string;
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
}

export interface Post {
  id: number | string;
  author: string;
  content: string;
  date: string;
  category?: string;
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
  Categories?: Category[];
  Settings: Record<string, any>[];
}

export type ViewType = 'home' | 'myPosts' | 'control' | 'students';
