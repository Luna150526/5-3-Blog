import { Database } from '../types';

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
  Settings: [
    { key: 'className', value: '5학년 3반' },
    { key: 'notice', value: '💖 배려와 존중으로 함께 성장하는 5학년 3반 블로그에 온 것을 환영합니다! 서로를 응원하는 고운 말을 사용해요.' }
  ]
};
