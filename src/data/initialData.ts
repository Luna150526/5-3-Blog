import { Database } from '../types';

export const INITIAL_DB: Database = {
  Students: [
    { id: 1, name: '김민준', pw: '1234', grade: '5', class: '3', bio: '축구와 독서를 좋아하는 3반 부반장' },
    { id: 2, name: '이서연', pw: '5678', grade: '5', class: '3', bio: '그림 그리기와 음악 감상이 취미!' },
    { id: 3, name: '박지우', pw: '1111', grade: '5', class: '3', bio: '과학 실험과 코딩에 관심이 많아요' },
    { id: 4, name: '최현우', pw: '2222', grade: '5', class: '3', bio: '5학년 3반 체육부장 달려라!' },
    { id: 5, name: '정다은', pw: '3333', grade: '5', class: '3', bio: '우리 반 친구들 모두 행복한 하루 보내자~' }
  ],
  Posts: [
    {
      id: 101,
      author: '김민준',
      content: '오늘 과학 시간에 태양계 행성 모형 만들기를 했는데 목성의 줄무늬를 점토로 표현하는 게 정말 재미있었어요! 🪐✨ 친구들이 만든 행성도 다 멋졌습니다.',
      date: '2026. 8. 14. 오후 2:15',
      category: '배움기록',
      likes: 4,
      likedBy: ['이서연', '박지우', '정다은', '최현우'],
      emoji: '🪐'
    },
    {
      id: 102,
      author: '이서연',
      content: '방과 후에 학교 도서관에서 새로 들어온 책 <푸른 사자 와니니> 3권을 빌려 읽었습니다. 감동적인 부분이 많아서 내일 독서토론 때 이야기해보고 싶어요. 🦁📚',
      date: '2026. 8. 14. 오후 4:30',
      category: '독서',
      likes: 3,
      likedBy: ['김민준', '정다은', '최현우'],
      emoji: '📚'
    },
    {
      id: 103,
      author: '박지우',
      content: '내일 실과 시간에 엔트리로 나만의 미니게임 만드는 날인 거 다들 알고 있지? 아이디어 있으면 댓글로 공유해줘! 🎮🤖',
      date: '2026. 8. 14. 오후 6:10',
      category: '질문',
      likes: 5,
      likedBy: ['김민준', '이서연', '최현우', '정다은'],
      emoji: '🎮'
    }
  ],
  Comments: [
    {
      id: 201,
      postId: 101,
      author: '박지우',
      text: '민준아 토성 고리 표현한 것도 진짜 실감 났어!',
      date: '오후 2:30'
    },
    {
      id: 202,
      postId: 101,
      author: '이서연',
      text: '우리 조 모형이랑 합치니까 완전 은하수 같았지 ㅎㅎ',
      date: '오후 2:45'
    },
    {
      id: 203,
      postId: 103,
      author: '최현우',
      text: '달리기 장애물 피하기 게임 만들면 재밌을 것 같아!',
      date: '오후 6:40'
    },
    {
      id: 204,
      postId: 103,
      author: '김민준',
      text: '우주선 우주 미로 탈출 게임 추천!',
      date: '오후 7:02'
    }
  ],
  Settings: [
    { key: 'className', value: '5학년 3반' },
    { key: 'notice', value: '💖 배려와 존중으로 함께 성장하는 5학년 3반 블로그에 온 것을 환영합니다! 서로를 응원하는 고운 말을 사용해요.' }
  ]
};
