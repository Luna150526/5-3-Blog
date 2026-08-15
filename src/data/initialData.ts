import { Database, Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: '일상', emoji: '🌱', color: '#F7CAC9', description: '우리들의 소소하고 즐거운 하루 일상' },
  { id: 2, name: '배움기록', emoji: '📝', color: '#92A8D1', description: '수업 시간에 배우고 느낀 점 기록' },
  { id: 3, name: '독서', emoji: '📚', color: '#FCE1B5', description: '함께 읽은 책과 감상평 나누기' },
  { id: 4, name: '질문', emoji: '💡', color: '#A8E6CF', description: '궁금한 점이나 함께 고민하고 싶은 이야기' },
  { id: 5, name: '칭찬', emoji: '💖', color: '#DED2F9', description: '친구들의 멋진 모습과 고마운 마음 전하기' }
];

export const INITIAL_DB: Database = {
  Students: [
    { id: 1, name: '김민준', pw: '1234', grade: '5', class: '3', bio: '5학년 3반' },
    { id: 2, name: '이서연', pw: '5678', grade: '5', class: '3', bio: '5학년 3반' },
    { id: 3, name: '박지우', pw: '1111', grade: '5', class: '3', bio: '5학년 3반' },
    { id: 4, name: '최현우', pw: '2222', grade: '5', class: '3', bio: '5학년 3반' },
    { id: 5, name: '정다은', pw: '3333', grade: '5', class: '3', bio: '5학년 3반' }
  ],
  Posts: [],
  Comments: [],
  Categories: DEFAULT_CATEGORIES,
  Settings: [
    { key: 'className', value: '5학년 3반' },
    { key: 'notice', value: '💖 배려와 존중으로 함께 성장하는 5학년 3반 블로그에 온 것을 환영합니다! 서로를 응원하는 고운 말을 사용해요.' }
  ]
};
