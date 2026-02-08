import React, { useState } from 'react';
import { Student, TaskType, LogEntry, CustomTask } from '../types';
import { TASK_LABELS, XP_RATES, TASK_ICONS, getStreakStyle, getRank } from '../constants';
import { Users, AlertCircle, TrendingUp, Calendar, CheckCircle2, XCircle, Plus, Trash2, ChevronRight, X, Layers, Settings, KeyRound, Copy, Check, Search, ClipboardCheck, Clock, Medal, CheckCheck, History } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MentorViewProps {
  view: string; // 'dashboard' or 'mentor' (tracking)
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  groupName: string;
  groupCode: string;
}

const MentorView: React.FC<MentorViewProps> = ({ view, students, onUpdateStudents, groupName, groupCode }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New Task Input State (Individual)
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  // New Group Task Input State
  const [groupTaskTitle, setGroupTaskTitle] = useState("");
  const [groupTaskDesc, setGroupTaskDesc] = useState("");
  const [groupTaskType, setGroupTaskType] = useState<TaskType>(TaskType.NAMAZ);

  const today = new Date().toISOString().split('T')[0];
  
  // Derived state for the selected student to ensure we always show fresh data
  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

  // Helper: Open Modal
  const handleOpenStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setIsModalOpen(true);
  };

  // Helper: Toggle Verification (Individual Log)
  const handleToggleVerification = (studentId: string, logId: string) => {
    const updatedStudents = students.map(s => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        logs: s.logs.map(l => l.id === logId ? { ...l, isVerified: !l.isVerified } : l)
      };
    });
    onUpdateStudents(updatedStudents);
  };

  // Helper: Approve ALL pending logs for a specific student (Weekly Approval)
  const handleApproveAllForStudent = (studentId: string) => {
    const updatedStudents = students.map(s => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        logs: s.logs.map(l => ({ ...l, isVerified: true }))
      };
    });
    onUpdateStudents(updatedStudents);
  };

  // Helper: Add Custom Task (Individual)
  const handleAddCustomTask = () => {
    if (!selectedStudent || !newTaskTitle) return;
    
    const newTask: CustomTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      targetDescription: newTaskDesc || "Genel",
      type: TaskType.NAMAZ 
    };

    const updatedStudents = students.map(s => {
      if (s.id !== selectedStudent.id) return s;
      return { ...s, customTasks: [...s.customTasks, newTask] };
    });

    onUpdateStudents(updatedStudents);
    setNewTaskTitle("");
    setNewTaskDesc("");
  };

  // Helper: Remove Custom Task (Individual)
  const handleRemoveCustomTask = (taskId: string) => {
    if (!selectedStudent) return;
    const updatedStudents = students.map(s => {
      if (s.id !== selectedStudent.id) return s;
      return { ...s, customTasks: s.customTasks.filter(t => t.id !== taskId) };
    });
    onUpdateStudents(updatedStudents);
  };

  // Helper: Add Task to ALL Students
  const handleAddGroupTask = () => {
    if (!groupTaskTitle) return;

    const updatedStudents = students.map(s => {
      if (s.customTasks.some(t => t.title === groupTaskTitle)) return s;
      const newTask: CustomTask = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: groupTaskTitle,
        targetDescription: groupTaskDesc || "Grup Vazifesi",
        type: groupTaskType
      };
      return { ...s, customTasks: [...s.customTasks, newTask] };
    });

    onUpdateStudents(updatedStudents);
    setGroupTaskTitle("");
    setGroupTaskDesc("");
  };

  // Helper: Remove Task from ALL Students
  const handleRemoveGroupTask = (taskTitle: string) => {
    if (!confirm(`"${taskTitle}" vazifesini tüm öğrencilerden silmek istediğinize emin misiniz?`)) return;
    const updatedStudents = students.map(s => ({
      ...s,
      customTasks: s.customTasks.filter(t => t.title !== taskTitle)
    }));
    onUpdateStudents(updatedStudents);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Aggregated Stats
  const groupTaskStats = students.reduce((acc, student) => {
    student.customTasks.forEach(task => {
      if (!acc[task.title]) {
        acc[task.title] = { count: 0, type: task.type, desc: task.targetDescription };
      }
      acc[task.title].count += 1;
    });
    return acc;
  }, {} as Record<string, { count: number, type: TaskType, desc: string }>);

  const totalReads = students.reduce((acc, s) => acc + s.logs.length, 0);
  const avgStreak = Math.round(students.reduce((acc, s) => acc + s.streak, 0) / (students.length || 1));
  const activeToday = students.filter(s => s.logs.some(l => l.date === today)).length;
  const chartData = students.map(s => ({ name: s.name.split(' ')[0], xp: s.totalXp }));

  // Collect Students who have pending logs
  const studentsWithPendingLogs = students.filter(s => s.logs.some(l => !l.isVerified)).map(s => ({
      ...s,
      pendingCount: s.logs.filter(l => !l.isVerified).length
  })).sort((a,b) => b.pendingCount - a.pendingCount);

  // Define Pending and History Logs for the Modal
  const pendingLogs = selectedStudent ? selectedStudent.logs.filter(l => !l.isVerified).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const historyLogs = selectedStudent ? selectedStudent.logs.filter(l => l.isVerified).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15) : [];

  // RENDER HELPERS
  const renderDashboardContent = () => (
      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
              <header className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-800">Mentör Paneli</h1>
                  <p className="text-slate-500">Grubunuzun genel durumuna hızlı bir bakış.</p>
              </header>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Bugün Aktif</p>
                        <p className="text-3xl font-bold text-slate-800">{activeToday} <span className="text-base text-slate-400 font-normal">/ {students.length}</span></p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                        <Calendar className="text-green-600 w-6 h-6" />
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Ortalama Seri</p>
                        <p className="text-3xl font-bold text-slate-800">{avgStreak} <span className="text-base text-slate-400 font-normal">Gün</span></p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                        <TrendingUp className="text-orange-600 w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Toplam Etkileşim</p>
                        <p className="text-3xl font-bold text-slate-800">{totalReads}</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Users className="text-indigo-600 w-6 h-6" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Pending Verifications (GROUPED BY STUDENT) */}
                  <div className="lg:col-span-2">
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                  <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                                  Onay Bekleyen Aktiviteler
                              </h3>
                              {studentsWithPendingLogs.length > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{studentsWithPendingLogs.reduce((acc, s) => acc + s.pendingCount, 0)} Aktivite</span>}
                          </div>
                          
                          <div className="flex-1 p-0 overflow-y-auto max-h-[500px]">
                              {studentsWithPendingLogs.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                      <CheckCircle2 className="w-16 h-16 mb-3 text-green-200" />
                                      <p className="font-medium">Harika! Tüm aktiviteler onaylanmış.</p>
                                      <p className="text-sm opacity-60">Şu an onay bekleyen öğrenci yok.</p>
                                  </div>
                              ) : (
                                  <div className="divide-y divide-slate-50">
                                      {studentsWithPendingLogs.map((s) => (
                                          <div key={s.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                              
                                              {/* Student Info */}
                                              <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleOpenStudent(s)}>
                                                  <div className="relative">
                                                      <img src={s.avatarUrl} className="w-12 h-12 rounded-full bg-slate-100 object-cover border border-slate-200" />
                                                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                          {s.pendingCount}
                                                      </div>
                                                  </div>
                                                  <div>
                                                      <p className="font-bold text-slate-800">{s.name}</p>
                                                      <p className="text-xs text-slate-500 flex items-center gap-1">
                                                          <Clock className="w-3 h-3" /> 
                                                          Son aktivite: {s.logs[0]?.date || 'Bilinmiyor'}
                                                      </p>
                                                  </div>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex items-center gap-3">
                                                  <button 
                                                    onClick={() => handleOpenStudent(s)}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                                                  >
                                                      İncele
                                                  </button>
                                                  <button 
                                                    onClick={() => handleApproveAllForStudent(s.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-100 cursor-pointer"
                                                  >
                                                      <CheckCheck className="w-4 h-4" />
                                                      Tümünü Onayla
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                          
                          {studentsWithPendingLogs.length > 0 && (
                             <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
                                Tüm aktiviteleri tek tek incelemek için öğrenci profiline gidin.
                             </div>
                          )}
                      </div>
                  </div>

                  {/* Right Column: Mini Leaderboard & Risk */}
                  <div className="space-y-6">
                      
                      {/* Top Students */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Medal className="w-5 h-5 text-yellow-500" />
                              Haftanın Liderleri
                          </h3>
                          <div className="space-y-4">
                              {[...students].sort((a,b) => b.totalXp - a.totalXp).slice(0, 3).map((s, i) => (
                                  <div key={s.id} className="flex items-center gap-3">
                                      <div className="font-bold text-slate-300 w-4">{i+1}</div>
                                      <img src={s.avatarUrl} className="w-10 h-10 rounded-full border border-slate-100 object-cover" />
                                      <div className="flex-1">
                                          <p className="text-sm font-bold text-slate-700">{s.name}</p>
                                          <p className="text-xs text-slate-400">{s.totalXp} XP</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* At Risk Students */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              İlgi Bekleyenler
                          </h3>
                          <p className="text-xs text-slate-400 mb-3">Son 2 gündür aktivite girmeyenler</p>
                          <div className="flex flex-wrap gap-2">
                              {students.filter(s => {
                                  if(s.logs.length === 0) return true;
                                  const lastLog = new Date(s.logs[0].date);
                                  const diffTime = Math.abs(new Date().getTime() - lastLog.getTime());
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                                  return diffDays > 2;
                              }).length === 0 ? (
                                  <p className="text-sm text-green-600 font-medium">Herkes aktif durumda!</p>
                              ) : (
                                  students.filter(s => {
                                    if(s.logs.length === 0) return true;
                                    const lastLog = new Date(s.logs[0].date);
                                    const diffTime = Math.abs(new Date().getTime() - lastLog.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                                    return diffDays > 2;
                                  }).slice(0,5).map(s => (
                                      <div key={s.id} className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100">
                                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                          {s.name.split(' ')[0]}
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
  );

  const renderTrackingContent = () => (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      
      {/* HEADER SECTION */}
      <header className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
              <Users className="text-indigo-600 w-8 h-8"/>
              <h2 className="text-3xl font-bold text-slate-800">Talebe Takibi</h2>
          </div>
          <p className="text-slate-500">{groupName} Grubu Detaylı Takip Listesi</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            {/* Invite Code Card */}
            <div 
                onClick={handleCopyCode}
                className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-3 px-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition-all group w-full sm:w-auto"
            >
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> Grup Davet Kodu
                    </p>
                    <p className="text-xl font-mono font-bold text-white tracking-widest">{groupCode}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                    {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-300" />}
                </div>
            </div>

            <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all whitespace-nowrap"
            >
                <Layers className="w-5 h-5" />
                <span className="font-bold">Grup Vazifeleri</span>
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="İsim ile ara..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0">
                        <tr>
                            <th className="p-4">İsim</th>
                            <th className="p-4 text-center">Seri</th>
                            <th className="p-4 text-center">Toplam XP</th>
                            <th className="p-4 text-right">Bugün</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => {
                            const isLoggedToday = s.logs.some(l => l.date === today);
                            const isStreakRisk = !isLoggedToday && s.streak > 0;
                            const rank = getRank(s.totalXp);
                            
                            return (
                                <tr 
                                  key={s.id} 
                                  onClick={() => handleOpenStudent(s)}
                                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                >
                                    <td className="p-4 flex items-center gap-3">
                                        <img 
                                          src={s.avatarUrl} 
                                          className={`w-10 h-10 rounded-full border-2 object-cover ${getStreakStyle(s.streak)}`} 
                                        />
                                        <div>
                                            <span className="font-medium text-slate-700 block group-hover:text-indigo-600 transition-colors">{s.name}</span>
                                            <span className={`text-[10px] font-bold ${rank.color}`}>{rank.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                                                {s.streak} 🔥
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-mono text-slate-600">
                                        {s.totalXp}
                                    </td>
                                    <td className="p-4 text-right">
                                        {isLoggedToday ? (
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Tamam
                                            </span>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full mb-1">
                                                  Bekleniyor
                                              </span>
                                              {isStreakRisk && (
                                                <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse">
                                                  <AlertCircle className="w-3 h-3" /> Risk
                                                </span>
                                              )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Group Comparison Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-6">Grup XP Grafiği</h3>
            <div className="h-64 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                        <Bar dataKey="xp" fill="#6366f1" radius={[4,4,0,0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {view === 'dashboard' ? renderDashboardContent() : renderTrackingContent()}

      {/* Group Task Management Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                  <div className="flex items-center gap-3">
                     <div className="bg-white p-2 rounded-lg shadow-sm">
                       <Layers className="w-6 h-6 text-indigo-600" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-800">Grup Vazife Yönetimi</h2>
                        <p className="text-slate-500 text-sm">Tüm öğrenciler için ortak çetele oluştur</p>
                     </div>
                  </div>
                  <button onClick={() => setIsGroupModalOpen(false)} className="p-2 hover:bg-indigo-100 rounded-full transition-colors">
                     <X className="w-6 h-6 text-slate-500" />
                  </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[80vh]">
                 
                 {/* Add New Section */}
                 <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                       <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                       Yeni Ortak Vazife Ekle
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input 
                           type="text" 
                           placeholder="Vazife Başlığı (Örn: Haftalık Risale)" 
                           className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           value={groupTaskTitle}
                           onChange={(e) => setGroupTaskTitle(e.target.value)}
                        />
                        <input 
                           type="text" 
                           placeholder="Hedef (Örn: 20 Sayfa)" 
                           className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           value={groupTaskDesc}
                           onChange={(e) => setGroupTaskDesc(e.target.value)}
                        />
                        <select 
                           className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           value={groupTaskType}
                           onChange={(e) => setGroupTaskType(e.target.value as TaskType)}
                        >
                            {Object.entries(TASK_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button 
                           onClick={handleAddGroupTask}
                           disabled={!groupTaskTitle}
                           className="bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                           Tüm Gruba Ata
                        </button>
                    </div>
                    <p className="text-xs text-slate-400">
                       Not: Bu vazife, grubunuzdaki {students.length} öğrencinin tamamına eklenecektir.
                    </p>
                 </div>

                 {/* Existing Tasks List */}
                 <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Mevcut Ortak Vazifeler</h3>
                    <div className="space-y-3">
                       {Object.keys(groupTaskStats).length === 0 ? (
                           <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                               Henüz ortak atanmış bir vazife bulunmuyor.
                           </div>
                       ) : (
                           Object.entries(groupTaskStats).map(([title, val]) => {
                               const stats = val as { count: number, type: TaskType, desc: string };
                               return (
                               <div key={title} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                   <div className="flex items-center gap-3">
                                       <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                                           {TASK_ICONS[stats.type]}
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-slate-700">{title}</h4>
                                           <p className="text-xs text-slate-500">
                                               {stats.desc} • {stats.count} / {students.length} Öğrencide var
                                           </p>
                                       </div>
                                   </div>
                                   <button 
                                      onClick={() => handleRemoveGroupTask(title)}
                                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                      <span className="text-xs font-bold hidden sm:inline">Gruptan Sil</span>
                                   </button>
                               </div>
                           )})
                       )}
                    </div>
                 </div>

              </div>
           </div>
        </div>
      )}

      {/* Student Management Modal (Existing) */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-4">
                     <img 
                       src={selectedStudent.avatarUrl} 
                       className={`w-16 h-16 rounded-full border-4 object-cover ${getStreakStyle(selectedStudent.streak)}`} 
                     />
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.name}</h2>
                        <p className="text-slate-500 text-sm">Öğrenci Profili ve Vazifeleri</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                     <X className="w-6 h-6 text-slate-500" />
                  </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   
                   {/* Left Column: Log Verification */}
                   <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                                Aktivite Onayı
                             </h3>
                             {pendingLogs.length > 0 && (
                                 <button 
                                    onClick={() => handleApproveAllForStudent(selectedStudent.id)}
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                 >
                                    Tümünü Onayla
                                 </button>
                             )}
                         </div>
                         
                         <div className="space-y-4">
                            {/* PENDING SECTION */}
                            {pendingLogs.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                        <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Onay Bekleyenler ({pendingLogs.length})</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {pendingLogs.map(log => (
                                            <div key={log.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                                        {TASK_ICONS[log.type]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{log.details || TASK_LABELS[log.type]}</p>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {log.value} {log.type === TaskType.ZIKIR || log.type === TaskType.NAMAZ ? 'Adet' : 'Sayfa'} • {log.date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input 
                                                      type="checkbox" 
                                                      checked={log.isVerified || false} 
                                                      onChange={() => handleToggleVerification(selectedStudent.id, log.id)}
                                                      className="sr-only peer" 
                                                    />
                                                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* HISTORY SECTION */}
                            {historyLogs.length > 0 && (
                                <div className={pendingLogs.length > 0 ? "pt-4 border-t border-slate-100" : ""}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <History className="w-3 h-3 text-slate-400" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geçmiş Aktiviteler</h4>
                                    </div>
                                    <div className="space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                                        {historyLogs.map(log => (
                                            <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 grayscale">
                                                        {TASK_ICONS[log.type]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-600 text-sm">{log.details || TASK_LABELS[log.type]}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {log.value} {log.type === TaskType.ZIKIR || log.type === TaskType.NAMAZ ? 'Adet' : 'Sayfa'} • {log.date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                                                    <Check className="w-3 h-3 mr-1" /> Onaylı
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {pendingLogs.length === 0 && historyLogs.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <p>Henüz aktivite kaydı bulunmuyor.</p>
                                </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Right Column: Custom Assignments */}
                   <div className="space-y-6">
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                              <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                              Özel Vazife Ata
                           </h3>
                           
                           <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                               <p className="text-xs text-indigo-700 mb-3">
                                   Bu öğrenciye özel bir takip çizelgesi oluşturabilirsiniz (Örn: Teheccüd, 5 Vakit Namaz, Riyazüs Salihin).
                               </p>
                               <div className="flex gap-2 flex-col sm:flex-row">
                                   <input 
                                     type="text" 
                                     placeholder="Vazife Adı (Örn: Teheccüd)" 
                                     value={newTaskTitle}
                                     onChange={(e) => setNewTaskTitle(e.target.value)}
                                     className="flex-1 p-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                   />
                                   <input 
                                     type="text" 
                                     placeholder="Hedef (Örn: 2 Rekat)" 
                                     value={newTaskDesc}
                                     onChange={(e) => setNewTaskDesc(e.target.value)}
                                     className="w-full sm:w-32 p-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                   />
                                   <button 
                                     onClick={handleAddCustomTask}
                                     disabled={!newTaskTitle}
                                     className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                   >
                                       Ekle
                                   </button>
                               </div>
                           </div>

                           <div className="space-y-2">
                               {selectedStudent.customTasks.length === 0 ? (
                                   <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                       Özel vazife bulunmuyor.
                                   </div>
                               ) : (
                                   selectedStudent.customTasks.map(task => (
                                       <div key={task.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 group">
                                           <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                   <CheckCircle2 className="w-4 h-4" />
                                               </div>
                                               <div>
                                                   <p className="font-bold text-slate-700 text-sm">{task.title}</p>
                                                   <p className="text-xs text-slate-500">{task.targetDescription}</p>
                                               </div>
                                           </div>
                                           <button 
                                             onClick={() => handleRemoveCustomTask(task.id)}
                                             className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                           >
                                               <Trash2 className="w-4 h-4" />
                                           </button>
                                       </div>
                                   ))
                               )}
                           </div>
                       </div>
                   </div>

                </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default MentorView;