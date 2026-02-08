
import React from 'react';
import { Student } from '../types';
import { Trophy, Medal, Crown } from 'lucide-react';
import { getStreakStyle, getRank, BADGE_ICONS } from '../constants';

interface LeaderboardProps {
  students: Student[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ students }) => {
  // Sort by XP descending
  const sortedStudents = [...students].sort((a, b) => b.totalXp - a.totalXp);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-slate-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700" />;
      default: return <span className="font-bold text-slate-400 w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
           <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Liderlik Tablosu</h2>
        <p className="text-slate-500">Hayırlarda yarışın...</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {sortedStudents.map((student, index) => {
          const rank = getRank(student.totalXp);
          const isTop3 = index < 3;
          
          return (
          <div 
            key={student.id}
            className={`flex items-center p-4 md:p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${index === 0 ? 'bg-yellow-50/30' : ''}`}
          >
            <div className="mr-4 md:mr-6 flex items-center justify-center w-8">
              {getRankIcon(index)}
            </div>
            
            <div className="relative mr-4">
                <img 
                src={student.avatarUrl} 
                alt={student.name} 
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 object-cover ${getStreakStyle(student.streak)}`}
                />
                {/* Badge Icons under Avatar */}
                <div className="absolute -bottom-2 -right-2 flex -space-x-1">
                    {student.badges.slice(0, 2).map((badge, i) => (
                        <div key={i} className="w-5 h-5 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm" title={badge}>
                           {BADGE_ICONS[badge] || <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
                        </div>
                    ))}
                </div>
            </div>
            
            
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isTop3 ? 'text-rainbow' : 'text-slate-800'}`}>
                 {student.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${rank.color} ${rank.border} bg-white flex items-center gap-1 w-fit`}>
                    {rank.icon} {rank.name}
                 </span>
                 <p className="text-xs text-slate-500 flex items-center gap-1">
                    {student.streak} Günlük Seri 🔥 
                 </p>
              </div>
            </div>

            <div className="text-right">
              <span className="block font-bold text-indigo-600 text-lg md:text-xl">{student.totalXp.toLocaleString()}</span>
              <span className="text-xs text-slate-400">XP</span>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Leaderboard;
