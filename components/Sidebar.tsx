
import React from 'react';
import { Home, Trophy, User, Users, LogOut, ShoppingBag, Settings, Map } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentUserRole: UserRole;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUserRole, currentView, setCurrentView, onLogout }) => {
  const isStudent = currentUserRole === UserRole.STUDENT;

  const NavItem = ({ view, icon: Icon, label }: { view: string; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col md:flex-row items-center p-3 rounded-xl transition-all ${
        currentView === view
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon className={`w-6 h-6 md:mr-3 ${currentView === view ? 'text-white' : ''}`} />
      <span className="text-xs md:text-base font-medium mt-1 md:mt-0">{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-50 pb-safe">
        <NavItem view="dashboard" icon={Home} label="Ana Sayfa" />
        
        {isStudent && <NavItem view="leaderboard" icon={Trophy} label="Sıralama" />}
        {!isStudent && <NavItem view="mentor" icon={Users} label="Talebeler" />}
        <NavItem view="settings" icon={Settings} label="Ayarlar" />
        <button onClick={onLogout} className="flex flex-col items-center p-3 text-slate-400">
           <LogOut className="w-6 h-6" />
           <span className="text-xs mt-1">Çıkış</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Users className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Genç Atlas</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view="dashboard" icon={Home} label="Ana Sayfa" />

          {isStudent && <NavItem view="leaderboard" icon={Trophy} label="Liderlik Tablosu" />}
          {isStudent && <NavItem view="market" icon={ShoppingBag} label="Pazar Yeri" />}
          {!isStudent && <NavItem view="mentor" icon={Users} label="Talebe Takibi" />}
        </nav>
        
        <div className="pt-4">
             <NavItem view="settings" icon={Settings} label="Ayarlar" />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="flex items-center w-full p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
