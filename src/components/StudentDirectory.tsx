import React from 'react';
import { BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { Student, Post, Comment } from '../types';

interface StudentDirectoryProps {
  students: Student[];
  posts: Post[];
  comments: Comment[];
  currentUser: Student | null;
  onSelectStudent: (studentName: string) => void;
}

const AVATAR_GRADIENTS = [
  'from-[#F7CAC9] to-[#E89E9D] text-white',
  'from-[#92A8D1] to-[#6B84B5] text-white',
  'from-[#FCE1B5] to-[#F59E0B] text-white',
  'from-[#A8E6CF] to-[#34D399] text-white',
  'from-[#DED2F9] to-[#8B5CF6] text-white'
];

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  posts,
  comments,
  currentUser,
  onSelectStudent
}) => {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#E89E9D]" />
            <h3 className="font-bold text-base text-gray-800">5학년 3반 친구들 목록</h3>
          </div>
          <p className="text-xs text-gray-400">
            총 <span className="font-bold text-[#92A8D1]">{students.length}명</span>의 친구들이 함께하고 있어요. 친구의 카드를 누르면 작성한 글을 볼 수 있습니다!
          </p>
        </div>
      </div>

      {/* Grid of students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {students.map((student, idx) => {
          const studentPosts = posts.filter((p) => p.author === student.name);
          const studentComments = comments.filter((c) => c.author === student.name);
          const isMe = currentUser && currentUser.name === student.name;
          const colorClass = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];

          return (
            <div
              key={student.id}
              id={`student-card-${student.id}`}
              onClick={() => onSelectStudent(student.name)}
              className={`bg-white p-5 rounded-[32px] shadow-sm border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 relative group ${
                isMe ? 'border-[#F7CAC9] ring-2 ring-[#F7CAC9]/30' : 'border-gray-100 hover:border-[#92A8D1]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-[20px] bg-gradient-to-br ${colorClass} flex items-center justify-center font-black text-lg shadow-xs shrink-0`}
                >
                  {student.name.slice(0, 1)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                        {student.name}
                      </h4>
                      {isMe && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7CAC9]/40 text-[#E89E9D]">
                          나
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-gray-400">
                      5-3 ({student.grade || '5'}학년)
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-normal">
                    {student.bio || '함께 배우고 나누는 즐거운 3반 친구'}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-gray-50 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#E89E9D]" />
                      작성글 <strong className="text-gray-700">{studentPosts.length}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-[#92A8D1]" />
                      댓글 <strong className="text-gray-700">{studentComments.length}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
