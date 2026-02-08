
import React, { useState } from 'react';
import { Rocket, Compass, Sparkles, Trophy, Star, ArrowRight, User, Lock, ArrowLeft, Loader2, KeyRound, Type } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onLogin: (role: UserRole, username?: string) => void;
  onRegister: (name: string, username: string, code: string, role: UserRole) => Promise<boolean>;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.STUDENT); 
  
  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState(''); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setIsRegistering(false);
    setErrorMsg('');
    setUsername('');
    setPassword('');
    setFullName('');
    setCode('');
    setRegisterRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setIsRegistering(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    if (!isRegistering) {
        setRegisterRole(selectedRole || UserRole.STUDENT);
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    if (isRegistering && (!fullName || !code)) return;

    setIsLoading(true);
    setErrorMsg('');

    // Simulate API delay
    setTimeout(async () => {
      if (isRegistering) {
          const success = await onRegister(fullName, username, code, registerRole);
          if (!success) {
              setErrorMsg(registerRole === UserRole.MENTOR ? 'Geçersiz kayıt kodu!' : 'Grup kodu hatalı veya geçersiz!');
              setIsLoading(false);
          }
      } else {
          setIsLoading(false);
          if (selectedRole) {
            onLogin(selectedRole, username);
          }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 text-yellow-400 opacity-20 animate-pulse">
        <Star size={64} />
      </div>
      <div className="absolute bottom-20 right-20 text-indigo-400 opacity-20 animate-bounce">
        <Trophy size={80} />
      </div>

      <div className="max-w-5xl w-full z-10 flex flex-col items-center">
        
        {/* Header / Hero */}
        <div className={`text-center mb-12 animate-fade-in-up transition-all duration-500 ${selectedRole ? 'scale-75 mb-6' : ''}`}>
          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-6 shadow-2xl border border-white/20">
            <Compass className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Genç Atlas</h1>
          </div>
          {!selectedRole && (
            <p className="text-indigo-200 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Manevi gelişim yolculuğuna hoş geldin! Günlük hedeflerini tamamla, serini bozma ve liderlik tablosunda yüksel.
            </p>
          )}
        </div>

        {/* LOGIN / REGISTER FORM MODE */}
        {selectedRole ? (
          <div className="w-full max-w-md animate-fade-in-up">
            <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl`}>
              
              <button 
                onClick={handleBack}
                className="flex items-center text-indigo-200 hover:text-white mb-6 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Geri Dön
              </button>

              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg ${selectedRole === UserRole.STUDENT ? 'bg-orange-500 shadow-orange-500/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}>
                  {selectedRole === UserRole.STUDENT ? <Rocket className="text-white w-8 h-8" /> : <Compass className="text-white w-8 h-8" />}
                </div>
                
                <h2 className="text-2xl font-bold text-white">
                  {isRegistering ? (registerRole === UserRole.MENTOR ? 'Yeni Mentör Kaydı' : 'Yeni Talebe Kaydı') : 
                   (selectedRole === UserRole.STUDENT ? 'Talebe Girişi' : 'Mentör Girişi')}
                </h2>
                
                <p className="text-indigo-200 text-sm mt-2">
                    {isRegistering 
                        ? (registerRole === UserRole.MENTOR ? 'Sistem kodunla kaydol ve grubunu kur.' : 'Mentöründen aldığın kod ile gruba katıl.') 
                        : 'Devam etmek için bilgilerinizi giriniz.'}
                </p>
              </div>

              {/* Toggle Register Type (Only when registering) */}
              {isRegistering && (
                  <div className="flex bg-white/10 p-1 rounded-xl mb-6">
                      <button 
                         type="button"
                         onClick={() => setRegisterRole(UserRole.STUDENT)}
                         className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${registerRole === UserRole.STUDENT ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-300 hover:text-white'}`}
                      >
                          Talebe
                      </button>
                      <button 
                         type="button"
                         onClick={() => setRegisterRole(UserRole.MENTOR)}
                         className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${registerRole === UserRole.MENTOR ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-300 hover:text-white'}`}
                      >
                          Mentör
                      </button>
                  </div>
              )}

              {errorMsg && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center font-bold animate-pulse">
                      {errorMsg}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {isRegistering && (
                    <>
                        <div>
                        <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2 ml-1">Ad Soyad</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Type className="h-5 w-5 text-indigo-300" />
                            </div>
                            <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-indigo-300/30 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                            placeholder="Adınız Soyadınız"
                            />
                        </div>
                        </div>

                        <div>
                        <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2 ml-1 text-yellow-300">
                            {registerRole === UserRole.MENTOR ? 'Kayıt Kodu' : 'Grup Katılım Kodu'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyRound className="h-5 w-5 text-yellow-400" />
                            </div>
                            <input
                            type="text"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-yellow-400/50 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all uppercase tracking-widest font-bold"
                            placeholder="KOD"
                            />
                        </div>
                        </div>
                    </>
                )}

                <div>
                  <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2 ml-1">Kullanıcı Adı</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-indigo-300" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-indigo-300/30 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      placeholder="kullaniciadi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2 ml-1">Şifre</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-indigo-300" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-indigo-300/30 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 
                    ${selectedRole === UserRole.STUDENT 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-500/30' 
                      : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-indigo-500/30'}`}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {isRegistering ? 'Kaydı Tamamla' : 'Giriş Yap'} <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center pt-4 border-t border-white/10">
                  <p className="text-indigo-200 text-sm">
                      {isRegistering ? 'Zaten hesabın var mı?' : 'Henüz hesabın yok mu?'}
                      <button 
                        onClick={toggleMode}
                        className="ml-2 text-yellow-300 hover:text-yellow-200 font-bold underline decoration-dotted underline-offset-4"
                      >
                          {isRegistering ? 'Giriş Yap' : 'Kayıt Ol'}
                      </button>
                  </p>
              </div>

            </div>
          </div>
        ) : (
          /* SELECTION CARDS MODE */
          <div className="w-full max-w-2xl animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Student Login Card */}
                <button 
                onClick={() => handleRoleSelect(UserRole.STUDENT)}
                className="group relative bg-white rounded-3xl p-8 text-left transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] duration-300 overflow-hidden"
                >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform">
                    <Rocket className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">Talebe</h2>
                    <p className="text-sm text-slate-500 mb-6">Maceraya başla! Çetelenini doldur, XP kazan ve serini bozma.</p>
                    
                    <div className="flex items-center text-sm text-orange-600 font-bold">
                    Giriş / Kayıt <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
                </button>

                {/* Mentor Login Card */}
                <button 
                onClick={() => handleRoleSelect(UserRole.MENTOR)}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-left transition-all hover:bg-white/10 hover:border-white/30 duration-300"
                >
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-900/50">
                    <Compass className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Mentör</h2>
                    <p className="text-sm text-indigo-200 mb-6">Talebelerini takip et, vazifeler ata ve onlara rehberlik yap.</p>
                    
                    <div className="flex items-center text-sm text-indigo-300 font-bold group-hover:text-white transition-colors">
                    Panel'e Git <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
                </button>

              </div>
          </div>
        )}

        {/* Footer Features */}
        {!selectedRole && (
          <div className="mt-16 grid grid-cols-3 gap-4 md:gap-12 text-center text-white/60 animate-fade-in">
            <div className="flex flex-col items-center">
              <Sparkles className="mb-2" />
              <span className="text-sm font-medium">Oyunlaştırılmış Takip</span>
            </div>
            <div className="flex flex-col items-center">
              <Trophy className="mb-2" />
              <span className="text-sm font-medium">Liderlik Yarışı</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="mb-2" />
              <span className="text-sm font-medium">AI Destekli Koçluk</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LandingPage;
