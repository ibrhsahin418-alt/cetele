
import React, { useState } from 'react';
import { Student, Mentor, Group } from '../types';
import { Users, BookOpen, GraduationCap, Copy, Check, TrendingUp, BarChart2, Search, Map } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DirectorViewProps {
  students: Student[];
  mentors: Mentor[];
  groups: Group[];
  directorCode: string;
}

const DirectorView: React.FC<DirectorViewProps> = ({ students, mentors, groups, directorCode }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(directorCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- STATS ---
  const totalStudents = students.length;
  const totalMentors = mentors.length;
  const totalReads = students.reduce((acc, s) => acc + s.logs.length, 0);
  const avgGroupStreak = Math.round(students.reduce((acc, s) => acc + s.streak, 0) / (students.length || 1));

  // --- CHARTS DATA ---
  
  // XP per Group
  const xpByGroup = groups.map(group => {
    const groupStudents = students.filter(s => s.groupId === group.id);
    const totalXp = groupStudents.reduce((acc, s) => acc + s.totalXp, 0);
    return { name: group.name, xp: totalXp, studentCount: groupStudents.length };
  });

  // Students Status (Active vs Inactive)
  const today = new Date().toISOString().split('T')[0];
  const activeCount = students.filter(s => s.logs.some(l => l.date === today)).length;
  const inactiveCount = totalStudents - activeCount;
  const pieData = [
    { name: 'Aktif', value: activeCount },
    { name: 'Beklemede', value: inactiveCount },
  ];
  const COLORS = ['#22c55e', '#cbd5e1'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-600 rounded-xl">
                  <Map className="w-8 h-8 text-white" />
               </div>
               <h1 className="text-3xl font-bold text-slate-800">Eğitim Danışmanı Paneli</h1>
           </div>
           <p className="text-slate-500">Tüm birimlerin genel durumuna kuş bakışı.</p>
        </div>

        {/* Mentor Invite Code Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-6 w-full md:w-auto">
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yeni Mentör Kayıt Kodu</p>
               <div className="flex items-center gap-3">
                   <p className="text-2xl font-mono font-bold tracking-wider text-white">{directorCode}</p>
                   <button 
                     onClick={handleCopyCode}
                     className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                     title="Kodu Kopyala"
                   >
                       {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                   </button>
               </div>
            </div>
            <div className="hidden sm:block opacity-20">
                <GraduationCap size={48} />
            </div>
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-slate-500 text-sm mb-1">Toplam Mentör</p>
             <p className="text-3xl font-bold text-slate-800">{totalMentors}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-slate-500 text-sm mb-1">Toplam Talebe</p>
             <p className="text-3xl font-bold text-slate-800">{totalStudents}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-slate-500 text-sm mb-1">Toplam Aktivite</p>
             <p className="text-3xl font-bold text-slate-800">{totalReads}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-slate-500 text-sm mb-1">Ortalama Seri</p>
             <p className="text-3xl font-bold text-slate-800">{avgGroupStreak} Gün</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Group Performance Chart */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-600" />
                      Grup Performansları (Toplam XP)
                  </h3>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={xpByGroup}>
                              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                              <Bar dataKey="xp" fill="#6366f1" radius={[4,4,0,0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Mentors List */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      Mentör Listesi
                  </h3>
                  <div className="space-y-4">
                      {mentors.map(mentor => {
                          const mentorGroup = groups.find(g => g.mentorId === mentor.id);
                          const studentCount = students.filter(s => s.groupId === mentorGroup?.id).length;
                          
                          return (
                          <div key={mentor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                      {mentor.name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-800">{mentor.name}</p>
                                      <p className="text-xs text-slate-500">{mentorGroup ? mentorGroup.name : 'Grup Atanmamış'}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="block font-bold text-slate-700">{studentCount}</span>
                                  <span className="text-xs text-slate-400">Talebe</span>
                              </div>
                          </div>
                      )})}
                  </div>
              </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
              
              {/* Daily Activity Pie */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Bugün Katılım Durumu
                  </h3>
                  <div className="h-48 w-full flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                          <span className="text-3xl font-bold text-slate-800">{activeCount}</span>
                          <span className="text-xs text-slate-400">Aktif</span>
                      </div>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                      {pieData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                              {entry.name} ({entry.value})
                          </div>
                      ))}
                  </div>
              </div>

              {/* All Students Quick Look */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm max-h-[500px] flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Tüm Talebeler
                  </h3>
                  <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Öğrenci ara..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                      <div className="space-y-2">
                          {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => {
                              const rank = groups.find(g => g.id === s.groupId)?.name || 'Bilinmiyor';
                              return (
                                  <div key={s.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                                      <div className="flex items-center gap-3">
                                          <img src={s.avatarUrl} className="w-8 h-8 rounded-full bg-slate-200" />
                                          <div>
                                              <p className="font-bold text-slate-700 text-sm">{s.name}</p>
                                              <p className="text-[10px] text-slate-400">{rank}</p>
                                          </div>
                                      </div>
                                      <div className="text-xs font-bold text-indigo-600">{s.totalXp} XP</div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DirectorView;
