
import React, { useState, useRef } from 'react';
import { Student, Mentor, UserRole, CustomTask, TaskType } from '../types';
import { User, Lock, Camera, Save, KeyRound, Copy, Check, Sparkles, RefreshCw, Palette, Zap, Crown, Upload, Layers, Plus, Trash2 } from 'lucide-react';
import { TASK_ICONS, TASK_LABELS } from '../constants';

interface SettingsProps {
  currentUser: Student | Mentor;
  role: UserRole;
  onUpdateProfile: (updatedUser: Student | Mentor) => void;
  groupCode?: string; // Optional, only for mentor
  onUpdateGroupCode?: (newCode: string) => void; // Optional, only for mentor
  allStudents?: Student[]; // Optional, for bulk actions
  onUpdateAllStudents?: (students: Student[]) => void; // Optional, for bulk actions
}

const Settings: React.FC<SettingsProps> = ({ currentUser, role, onUpdateProfile, groupCode, onUpdateGroupCode, allStudents, onUpdateAllStudents }) => {
  // Common State
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || '');
  const [password, setPassword] = useState(''); // Simulated
  
  // Mentor Bulk Task State
  const [bulkTaskTitle, setBulkTaskTitle] = useState("");
  const [bulkTaskDesc, setBulkTaskDesc] = useState("");
  const [bulkTaskType, setBulkTaskType] = useState<TaskType>(TaskType.NAMAZ);
  
  // Avatar State: We now track the full URL string instead of just a seed
  const [previewAvatar, setPreviewAvatar] = useState(
    currentUser.avatarUrl || 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username || 'default'}`
  );
  
  const [isCopied, setIsCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTaskSuccess, setShowTaskSuccess] = useState(false);
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate some preset options
  const generateAvatars = () => {
    return Array.from({ length: 5 }).map((_, i) => 
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}${i}`
    );
  };
  const avatarOptions = generateAvatars();

  const handleSave = () => {
    const updatedUser = {
        ...currentUser,
        name: name,
        username: username,
        // Password would be handled securely on backend
        avatarUrl: previewAvatar // Save the currently previewed image (whether base64 or url)
    };
    
    onUpdateProfile(updatedUser);
    
    // Show Toast
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setPassword(''); // Clear password field
  };

  const handleCopyCode = () => {
    if (groupCode) {
        navigator.clipboard.writeText(groupCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleGenerateNewCode = () => {
      if (onUpdateGroupCode && confirm("Yeni bir grup kodu oluşturmak istediğinize emin misiniz? Eski kod geçersiz olacaktır.")) {
          const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
          const year = new Date().getFullYear();
          const newCode = `ATLAS${randomPart}${year}`; 
          onUpdateGroupCode(newCode);
          setIsCopied(false); // Reset UI state
      }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the preview to the base64 string result
        if (typeof reader.result === 'string') {
            setPreviewAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleReward = (rewardId: string) => {
      if (role !== UserRole.STUDENT) return;
      
      const student = currentUser as Student;
      // Toggle logic
      const updatedRewards = student.activeRewards.map(r => {
          if (r.id === rewardId) {
              return { ...r, isActive: !r.isActive };
          }
          return r;
      });

      onUpdateProfile({ ...student, activeRewards: updatedRewards });
  };

  // --- MENTOR BULK TASK LOGIC ---
  const handleAddBulkTask = () => {
      if (!allStudents || !onUpdateAllStudents || !bulkTaskTitle) return;

      const updatedStudents = allStudents.map(s => {
          // Prevent duplicates
          if (s.customTasks.some(t => t.title === bulkTaskTitle)) return s;

          const newTask: CustomTask = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              title: bulkTaskTitle,
              targetDescription: bulkTaskDesc || "Genel",
              type: bulkTaskType
          };
          return { ...s, customTasks: [...s.customTasks, newTask] };
      });

      onUpdateAllStudents(updatedStudents);
      setBulkTaskTitle("");
      setBulkTaskDesc("");
      setShowTaskSuccess(true);
      setTimeout(() => setShowTaskSuccess(false), 3000);
  };

  const handleRemoveBulkTask = (taskTitle: string) => {
      if (!allStudents || !onUpdateAllStudents) return;
      if (!confirm(`"${taskTitle}" vazifesini tüm öğrencilerden silmek istediğinize emin misiniz?`)) return;

      const updatedStudents = allStudents.map(s => ({
          ...s,
          customTasks: s.customTasks.filter(t => t.title !== taskTitle)
      }));
      onUpdateAllStudents(updatedStudents);
  };

  // Group existing tasks for display
  const existingGroupTasks = allStudents ? allStudents.reduce((acc, student) => {
      student.customTasks.forEach(task => {
          if (!acc[task.title]) {
              acc[task.title] = { count: 0, type: task.type, desc: task.targetDescription };
          }
          acc[task.title].count += 1;
      });
      return acc;
  }, {} as Record<string, { count: number, type: TaskType, desc: string }>) : {};

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-slate-200 rounded-2xl">
                <User className="w-8 h-8 text-slate-600" />
            </div>
            Ayarlar ve Profil
        </h2>
        <p className="text-slate-500 mt-2">Hesap bilgilerinizi ve görünümünüzü yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: General Profile Settings */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-indigo-500" />
                    Profil Fotoğrafı
                </h3>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
                    {/* Main Avatar Preview */}
                    <div className="relative group shrink-0 mx-auto md:mx-0">
                        <img 
                            src={previewAvatar} 
                            alt="Current Avatar" 
                            className="w-32 h-32 rounded-full border-4 border-indigo-100 shadow-md bg-slate-50 object-cover"
                        />
                        {/* Overlay Button for Click to Upload */}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium text-xs text-center p-2"
                        >
                            <Upload className="w-6 h-6 mb-1 mx-auto" />
                        </button>
                    </div>
                    
                    <div className="flex-1 w-full">
                        {/* Upload Button */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mb-4 flex items-center justify-center w-full md:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Cihazdan Yükle
                        </button>

                        <p className="text-sm text-slate-500 mb-3">Veya hazır avatarlardan seç:</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {avatarOptions.map((url, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setPreviewAvatar(url)}
                                    className={`w-14 h-14 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0 bg-slate-50 p-0.5 overflow-hidden ${previewAvatar === url ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-slate-300'}`}
                                >
                                    <img src={url} className="w-full h-full rounded-full bg-white" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 my-6"></div>

                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-500" />
                    Kişisel Bilgiler
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Ad Soyad</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Kullanıcı Adı</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Yeni Şifre</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Değiştirmek için yeni şifre girin"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                            />
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button 
                            onClick={handleSave}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Değişiklikleri Kaydet
                        </button>
                        
                        {showSuccess && (
                            <span className="text-green-600 font-medium flex items-center animate-fade-in">
                                <Check className="w-5 h-5 mr-1" /> Kaydedildi!
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Role Specific */}
        <div className="space-y-8">
            
            {/* MENTOR: Group Management */}
            {role === UserRole.MENTOR && (
                <>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <KeyRound size={120} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                        <KeyRound className="w-6 h-6 mr-2 text-yellow-400" />
                        Grup Erişimi
                    </h3>
                    <p className="text-slate-300 text-sm mb-6">Öğrencilerin gruba katılması için bu kodu paylaşın.</p>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center mb-4 relative overflow-hidden group">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Grup Kodu</p>
                        <p className="text-4xl font-mono font-bold tracking-wider text-white relative z-10">{groupCode}</p>
                        
                        {/* Decorative glow behind code */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>
                    </div>

                    <button 
                        onClick={handleCopyCode}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors flex items-center justify-center mb-4"
                    >
                        {isCopied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                        {isCopied ? 'Kopyalandı' : 'Kodu Kopyala'}
                    </button>
                    
                    <div className="text-center">
                        <button 
                            onClick={handleGenerateNewCode}
                            className="text-xs text-slate-500 hover:text-white underline decoration-dashed hover:decoration-solid transition-all flex items-center justify-center mx-auto gap-1"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Yeni Kod Oluştur
                        </button>
                    </div>
                </div>

                {/* Bulk Task Management for Mentor */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Layers className="w-5 h-5 mr-2 text-indigo-500" />
                        Toplu Vazife Yönetimi
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Tüm öğrencilere tek seferde ortak bir hedef ekleyin.</p>
                    
                    <div className="space-y-3 mb-6">
                        <input 
                           type="text" 
                           placeholder="Vazife Başlığı (Örn: Haftalık Hatim)" 
                           className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           value={bulkTaskTitle}
                           onChange={(e) => setBulkTaskTitle(e.target.value)}
                        />
                        <input 
                           type="text" 
                           placeholder="Hedef (Örn: 1 Cüz)" 
                           className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           value={bulkTaskDesc}
                           onChange={(e) => setBulkTaskDesc(e.target.value)}
                        />
                        <select 
                           className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           value={bulkTaskType}
                           onChange={(e) => setBulkTaskType(e.target.value as TaskType)}
                        >
                            {Object.entries(TASK_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button 
                           onClick={handleAddBulkTask}
                           disabled={!bulkTaskTitle}
                           className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                           {showTaskSuccess ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5 mr-1" />}
                           {showTaskSuccess ? 'Eklendi!' : 'Tüm Gruba Ekle'}
                        </button>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aktif Ortak Vazifeler</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                           {Object.keys(existingGroupTasks).length === 0 ? (
                               <p className="text-xs text-slate-400 italic">Henüz ortak vazife yok.</p>
                           ) : (
                               Object.entries(existingGroupTasks).map(([title, val]) => {
                                   const stats = val as { count: number, type: TaskType, desc: string };
                                   return (
                                   <div key={title} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                       <div className="flex items-center gap-2 overflow-hidden">
                                           <div className="text-indigo-500 shrink-0 scale-75">
                                               {TASK_ICONS[stats.type]}
                                           </div>
                                           <div className="truncate">
                                               <p className="font-bold text-slate-700 truncate">{title}</p>
                                               <p className="text-[10px] text-slate-400">{stats.desc}</p>
                                           </div>
                                       </div>
                                       <button 
                                          onClick={() => handleRemoveBulkTask(title)}
                                          className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                                          title="Tüm gruptan sil"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                   </div>
                               )})
                           )}
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* STUDENT: Cosmetics */}
            {role === UserRole.STUDENT && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-purple-500" />
                        Görünüm Efektleri
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Kazandığın özel çerçeveleri buradan yönet.</p>

                    <div className="space-y-3">
                        {(currentUser as Student).activeRewards.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm">Henüz aktif bir ödülün yok.</p>
                                <p className="text-xs text-slate-300 mt-1">Seri yaparak kazanabilirsin!</p>
                            </div>
                        ) : (
                            (currentUser as Student).activeRewards.map((reward, idx) => {
                                const isExpired = new Date(reward.expiresAt) < new Date();
                                if (isExpired) return null;

                                let icon = <Sparkles className="w-5 h-5" />;
                                let name = "Özel Efekt";
                                let styleClass = "";
                                
                                if (reward.id === 'GOLD_GLOW') {
                                    icon = <Crown className="w-5 h-5 text-yellow-500" />;
                                    name = "Altın Çerçeve";
                                    styleClass = "border-yellow-400 shadow-yellow-200 bg-yellow-50";
                                } else if (reward.id === 'NEON_FRAME') {
                                    icon = <Zap className="w-5 h-5 text-cyan-500" />;
                                    name = "Neon Çerçeve";
                                    styleClass = "border-cyan-400 shadow-cyan-200 bg-cyan-50";
                                } else if (reward.id === 'RAINBOW_NAME') {
                                    icon = <Palette className="w-5 h-5 text-pink-500" />;
                                    name = "RGB İsim";
                                    styleClass = "border-pink-400 shadow-pink-200 bg-pink-50";
                                }

                                return (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${styleClass} ${reward.isActive ? 'ring-2 ring-offset-2 ring-indigo-500' : 'opacity-60 grayscale'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-full shadow-sm">
                                                {icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{name}</p>
                                                <p className="text-[10px] text-slate-500">
                                                    Bitiş: {new Date(reward.expiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleToggleReward(reward.id)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${reward.isActive ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            {reward.isActive ? 'Aktif' : 'Kullan'}
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
