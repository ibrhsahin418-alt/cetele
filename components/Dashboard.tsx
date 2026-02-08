
import React, { useState, useEffect } from 'react';
import { Student, TaskType, LogEntry } from '../types';
import { TASK_ICONS, TASK_LABELS, XP_RATES, getStreakStyle, getRank } from '../constants';
// Added missing Sparkles icon to the import list
import { Flame, Star, Plus, CheckCircle2, Bot, Activity, Coins, Zap, Calendar as CalendarIcon, X, ArrowRight, TrendingUp, Award, BookOpen, Target, Sparkles } from 'lucide-react';
import { getDailyMotivation } from '../services/geminiService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import confetti from 'canvas-confetti';

interface DashboardProps {
  student: Student;
  onUpdateStudent: (updatedStudent: Student) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ student, onUpdateStudent }) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [inputValue, setInputValue] = useState<number>(0);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [customTaskName, setCustomTaskName] = useState<string>(""); 

  const todayDate = new Date();
  const today = todayDate.toISOString().split('T')[0];
  
  const isWeekend = todayDate.getDay() === 0 || todayDate.getDay() === 6;
  const xpMultiplier = isWeekend ? 2 : 1;

  const currentRank = getRank(student.totalXp);
  const streakFreezeCount = student.inventory.find(i => i.type === 'STREAK_FREEZE')?.count || 0;

  // Active Rewards check
  const activeRewards = student.activeRewards?.filter(r => new Date(r.expiresAt) > new Date()) || [];
  const hasRainbowName = activeRewards.some(r => r.id === 'RAINBOW_NAME');
  const hasNeonFrame = activeRewards.some(r => r.id === 'NEON_FRAME');
  const hasGoldGlow = activeRewards.some(r => r.id === 'GOLD_GLOW');

  const getAvatarStyle = () => {
     if (hasGoldGlow) return "border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9)]";
     if (hasNeonFrame) return "border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]";
     return getStreakStyle(student.streak);
  };

  useEffect(() => {
    const loadMotivation = async () => {
      setIsLoadingAi(true);
      const msg = await getDailyMotivation(student.name, student.logs);
      setAiMessage(msg);
      setIsLoadingAi(false);
    };
    loadMotivation();
  }, [student.name]); 

  const checkDailyCompletion = (logs: LogEntry[]): boolean => {
    if (student.customTasks.length === 0) {
        return logs.some(l => l.date === today);
    }
    const todaysLogDetails = logs
        .filter(l => l.date === today && l.details)
        .map(l => l.details);
    return student.customTasks.every(task => todaysLogDetails.includes(task.title));
  };

  const handleLogTask = async () => {
    if (!selectedTask || inputValue <= 0) return;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      date: today,
      type: selectedTask,
      value: inputValue,
      details: customTaskName || undefined, 
      isVerified: false 
    };

    const baseXp = Math.floor(inputValue * (XP_RATES[selectedTask] || 1));
    const xpGained = baseXp * xpMultiplier;
    const newLogs = [newLog, ...student.logs];
    
    const wasCompletedBefore = checkDailyCompletion(student.logs);
    const isCompletedNow = checkDailyCompletion(newLogs);
    
    let newStreak = student.streak;
    let newActiveRewards = [...(student.activeRewards || [])];
    
    if (!wasCompletedBefore && isCompletedNow) {
        newStreak = student.streak + 1;
        confetti({
            particleCount: 300,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
            startVelocity: 45,
        });
    } else {
        confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            disableForReducedMotion: true
        });
    }

    const updatedStudent: Student = {
      ...student,
      streak: newStreak,
      totalXp: student.totalXp + xpGained,
      coins: student.coins + xpGained,
      logs: newLogs,
      activeRewards: newActiveRewards
    };

    onUpdateStudent(updatedStudent);
    setShowLogModal(false);
    setInputValue(0);
    setSelectedTask(null);
    setCustomTaskName("");

    setIsLoadingAi(true);
    const msg = await getDailyMotivation(updatedStudent.name, updatedStudent.logs);
    setAiMessage(msg);
    setIsLoadingAi(false);
  };

  const isDailyGoalMet = checkDailyCompletion(student.logs);

  const chartData = [
    { name: 'Pzt', xp: 120 },
    { name: 'Sal', xp: 200 },
    { name: 'Çar', xp: 150 },
    { name: 'Per', xp: 280 },
    { name: 'Cum', xp: 190 },
    { name: 'Cmt', xp: 350 },
    { name: 'Paz', xp: student.logs.filter(l => l.date === today).reduce((acc, curr) => acc + (curr.value * (XP_RATES[curr.type] || 1)), 0) },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto pb-24 md:pb-8">
      
      {/* Header Profile Section */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img 
            src={student.avatarUrl} 
            alt={student.name}
            className={`w-24 h-24 md:w-32 md:h-32 rounded-full object-cover transition-all duration-500 ${getAvatarStyle()}`}
          />
          <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-full shadow-lg border-4 border-white">
            <Flame className="w-5 h-5 fill-white" />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className={`text-3xl md:text-4xl font-black text-slate-800 tracking-tight ${hasRainbowName ? 'text-rainbow' : ''}`}>
            Selam, {student.name.split(' ')[0]}!
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-3">
             <div className={`px-4 py-1.5 rounded-full border-2 ${currentRank.color} ${currentRank.border} bg-white flex items-center gap-2 font-bold text-sm shadow-sm`}>
                {currentRank.icon} {currentRank.name}
             </div>
             <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-2 font-bold text-sm">
                <Target className="w-4 h-4" /> Seviye {student.level}
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-3xl text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-2 text-yellow-600 mb-1">
                 <Coins className="w-5 h-5 fill-yellow-500" />
                 <span className="font-black text-xl">{student.coins}</span>
              </div>
              <p className="text-[10px] font-bold text-yellow-700/50 uppercase">Atlas Altını</p>
           </div>
           <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-2 text-indigo-600 mb-1">
                 <Star className="w-5 h-5 fill-indigo-400" />
                 <span className="font-black text-xl">{student.totalXp}</span>
              </div>
              <p className="text-[10px] font-bold text-indigo-700/50 uppercase">Toplam XP</p>
           </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: AI & Streak */}
        <div className="space-y-6">
           {/* Streak Card */}
           <div className={`p-8 rounded-[2.5rem] border-4 transition-all overflow-hidden relative group ${isDailyGoalMet ? 'bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-200' : 'bg-white border-slate-100 text-slate-800 shadow-sm'}`}>
              <div className="relative z-10">
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDailyGoalMet ? 'text-orange-100' : 'text-slate-400'}`}>İstikrar Serisi</p>
                <div className="flex items-end gap-3">
                   <span className="text-6xl font-black leading-none">{student.streak}</span>
                   <span className="text-xl font-bold mb-1 opacity-80">GÜN</span>
                </div>
                <p className={`mt-4 text-sm font-medium leading-relaxed ${isDailyGoalMet ? 'text-orange-50' : 'text-slate-500'}`}>
                  {isDailyGoalMet ? 'Harika! Bugünün vazifelerini tamamladın.' : 'Bugünkü hedeflerini tamamla ve serini devam ettir!'}
                </p>
              </div>
              <Flame className={`absolute -right-10 -bottom-10 w-48 h-48 opacity-10 transition-transform group-hover:scale-110 ${isDailyGoalMet ? 'fill-white' : 'fill-slate-400'}`} />
           </div>

           {/* AI Coach */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-indigo-100 relative overflow-hidden shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-indigo-500 rounded-xl">
                    <Bot className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Rehber Mesajı</span>
              </div>
              <p className="text-lg font-medium leading-relaxed italic">
                 {isLoadingAi ? <span className="animate-pulse">Düşünüyor...</span> : `"${aiMessage}"`}
              </p>
              <div className="mt-6 pt-6 border-t border-indigo-800/50 flex items-center justify-between text-xs font-bold text-indigo-400">
                 <span>Yapay Zeka Destekli Koç</span>
                 <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
           </div>
        </div>

        {/* Middle: Custom Tasks & Quick Logs */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Custom Tasks Area */}
            {student.customTasks.length > 0 && (
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                       <Award className="w-6 h-6 text-indigo-600" />
                       Özel Vazifeler
                    </h3>
                    <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold">
                       {student.customTasks.filter(t => student.logs.some(l => l.date === today && l.details === t.title)).length} / {student.customTasks.length} Tamamlandı
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {student.customTasks.map(task => {
                        const isDone = student.logs.some(l => l.date === today && l.details === task.title);
                        return (
                           <button 
                             key={task.id}
                             onClick={() => { setSelectedTask(task.type); setCustomTaskName(task.title); setShowLogModal(true); }}
                             className={`p-5 rounded-3xl border-2 text-left transition-all flex items-center justify-between group ${isDone ? 'bg-green-50 border-green-200 shadow-inner' : 'bg-white border-slate-50 hover:border-indigo-200 hover:shadow-md'}`}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDone ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {isDone ? <CheckCircle2 className="w-6 h-6" /> : TASK_ICONS[task.type]}
                                 </div>
                                 <div>
                                    <p className={`font-black ${isDone ? 'text-green-800' : 'text-slate-800'}`}>{task.title}</p>
                                    <p className="text-xs font-bold text-slate-400">{task.targetDescription}</p>
                                 </div>
                              </div>
                              {!isDone && <ArrowRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />}
                           </button>
                        );
                     })}
                  </div>
               </div>
            )}

            {/* Quick Actions (General Tasks) */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-orange-500" />
                      Günlük Çetele
                   </h3>
                   {isWeekend && <span className="text-[10px] font-black bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full animate-bounce">2X XP AKTİF</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.keys(TASK_LABELS).map((key) => {
                    const type = key as TaskType;
                    const isDone = student.logs.some(l => l.date === today && l.type === type);
                    return (
                      <button
                        key={type}
                        onClick={() => { setSelectedTask(type); setCustomTaskName(""); setShowLogModal(true); }}
                        className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all group ${isDone ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-lg'}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform ${isDone ? 'bg-white text-green-500' : 'bg-white text-slate-400 group-hover:scale-110 shadow-sm'}`}>
                          {isDone ? <CheckCircle2 className="w-8 h-8" /> : TASK_ICONS[type]}
                        </div>
                        <span className={`text-xs font-black tracking-tight ${isDone ? 'text-green-700' : 'text-slate-600'}`}>{TASK_LABELS[type]}</span>
                      </button>
                    )
                  })}
                </div>
            </div>
        </div>
      </div>

      {/* Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-800">Performans Analizi</h3>
                   <p className="text-xs font-bold text-slate-400">Haftalık kazanılan toplam tecrübe puanı (XP)</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl">
                   <Activity className="w-6 h-6 text-indigo-600" />
                </div>
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="xp" radius={[8, 8, 8, 8]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#6366f1' : '#e2e8f0'} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Badges & Items Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-500" />
                Rozetler
             </h3>
             <div className="flex flex-wrap gap-2">
                {student.badges.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Henüz rozet kazanılmadı.</p>
                ) : (
                  student.badges.map((badge, idx) => (
                    <div key={idx} className="bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-yellow-200">
                      {badge}
                    </div>
                  ))
                )}
             </div>
             
             <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Aktif Envanter</h4>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                         <Zap className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-black text-slate-700">Seri Dondurucu</p>
                         <p className="text-[10px] text-slate-400 font-bold">{streakFreezeCount} Adet Mevcut</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
      </div>

      {/* Log Entry Modal */}
      {showLogModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowLogModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
               <X className="w-6 h-6 text-slate-400" />
            </button>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-4 shadow-inner">
                {TASK_ICONS[selectedTask]}
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                {customTaskName || TASK_LABELS[selectedTask]}
              </h3>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Veri Girişi</p>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                 <input 
                  type="number" 
                  min="0"
                  value={inputValue} 
                  onChange={(e) => setInputValue(parseInt(e.target.value) || 0)}
                  className="w-full text-6xl font-black text-center bg-transparent focus:outline-none text-indigo-600 mb-2"
                  placeholder="0"
                  autoFocus
                />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">
                  {selectedTask === TaskType.ZIKIR || selectedTask === TaskType.NAMAZ ? 'Adet' : 'Sayfa'}
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 20].map(val => (
                   <button key={val} onClick={() => setInputValue(val)} className="py-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl text-sm font-black transition-all">
                     +{val}
                   </button>
                ))}
              </div>

              <button 
                onClick={handleLogTask}
                disabled={inputValue <= 0}
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                KAYDET VE DEVAM ET <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
