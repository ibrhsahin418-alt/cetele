import React from 'react';
import { Student } from '../types';
import { Snowflake, Coins, Shirt, Sparkles, Check, Backpack, PackageOpen } from 'lucide-react';

interface ShopProps {
  student: Student;
  onUpdateStudent: (updatedStudent: Student) => void;
}

const Shop: React.FC<ShopProps> = ({ student, onUpdateStudent }) => {
  const ITEMS = [
    {
      id: 'streak_freeze',
      name: 'Seri Dondurucu',
      description: 'Bir gün ödev yapamazsan serin bozulmaz. Otomatik kullanılır.',
      cost: 1000,
      icon: <Snowflake className="w-8 h-8 text-cyan-500" />,
      bg: 'bg-cyan-50',
      type: 'consumable'
    },
    {
      id: 'avatar_king',
      name: 'Kral Avatarı',
      description: 'Profilin için özel kral tacı avatarı.',
      cost: 5000,
      icon: <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=King&clothing=graphicShirt" className="w-10 h-10 rounded-full" />,
      bg: 'bg-yellow-50',
      newAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=King&clothing=graphicShirt",
      type: 'avatar'
    },
    {
      id: 'avatar_ninja',
      name: 'Ninja Avatarı',
      description: 'Gizli ve hızlı. Ninja kostümlü avatar.',
      cost: 2500,
      icon: <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja&clothing=blazerAndShirt" className="w-10 h-10 rounded-full" />,
      bg: 'bg-slate-50',
      newAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja&clothing=blazerAndShirt",
      type: 'avatar'
    },
    {
      id: 'avatar_mystery',
      name: 'Gizemli Avatar',
      description: 'Efsanevi statüsü. Sadece en zengin ve sadık talebeler için.',
      cost: 10000,
      icon: <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mystery&top=hat&accessories=sunglasses&clothing=blazerAndShirt&skinColor=pale" className="w-10 h-10 rounded-full" />,
      bg: 'bg-violet-50',
      newAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mystery&top=hat&accessories=sunglasses&clothing=blazerAndShirt&skinColor=pale",
      type: 'avatar'
    }
  ];

  const handleBuy = (item: any) => {
    if (student.coins < item.cost) {
      alert("Yetersiz altın!");
      return;
    }

    let updatedStudent = { ...student, coins: student.coins - item.cost };

    if (item.type === 'consumable') {
      const existingItem = updatedStudent.inventory.find(i => i.type === 'STREAK_FREEZE');
      if (existingItem) {
        updatedStudent.inventory = updatedStudent.inventory.map(i => 
          i.type === 'STREAK_FREEZE' ? { ...i, count: i.count + 1 } : i
        );
      } else {
        updatedStudent.inventory = [...updatedStudent.inventory, { id: Date.now().toString(), type: 'STREAK_FREEZE', count: 1 }];
      }
    } else if (item.type === 'avatar') {
       updatedStudent.avatarUrl = item.newAvatarUrl;
    }

    onUpdateStudent(updatedStudent);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-3xl font-bold text-slate-800">Pazar Yeri</h2>
              <p className="text-slate-500">Kazandığın altınları burada harcayabilirsin.</p>
           </div>
           <div className="flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl border border-yellow-200">
             <Coins className="w-5 h-5 mr-2 fill-yellow-500" />
             <span className="font-bold text-lg">{student.coins}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ITEMS.map(item => {
           // Basic check if user owns avatar (comparing URL)
           const isOwned = item.type === 'avatar' && student.avatarUrl === item.newAvatarUrl;

           return (
            <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-50 ${item.bg}`}></div>
              
              <div className="relative z-10 flex flex-col h-full">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${item.bg}`}>
                    {item.icon}
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-800 mb-1">{item.name}</h3>
                 <p className="text-sm text-slate-500 mb-6 flex-1">{item.description}</p>
                 
                 {isOwned ? (
                    <button disabled className="w-full py-3 bg-green-100 text-green-700 font-bold rounded-xl flex items-center justify-center cursor-default">
                       <Check className="w-5 h-5 mr-2" /> Kullanılıyor
                    </button>
                 ) : (
                    <button 
                      onClick={() => handleBuy(item)}
                      disabled={student.coins < item.cost}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      {item.cost} <Coins className="w-4 h-4 ml-1 fill-white/50" />
                    </button>
                 )}
              </div>
            </div>
           );
        })}
      </div>
      
      {/* Dedicated Inventory Section */}
      <div className="mt-16">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-2xl">
                <Backpack className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-800">Çantam</h3>
                <p className="text-slate-500 text-sm">Sahip olduğun eşyalar ve güçlendirmeler</p>
            </div>
        </div>

        <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-200/60 shadow-inner min-h-[200px]">
           {student.inventory.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-60">
               <PackageOpen className="w-16 h-16 mb-4" />
               <p className="font-medium text-lg">Çantan bomboş...</p>
               <p className="text-sm">Marketten alışveriş yaparak burayı doldurabilirsin.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {student.inventory.map(inv => (
                 <div key={inv.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:scale-105 transition-transform">
                    {/* Quantity Badge */}
                    <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                       x{inv.count}
                    </div>
                    
                    {/* Item Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl flex items-center justify-center mb-3 mt-2 shadow-inner">
                       {inv.type === 'STREAK_FREEZE' && <Snowflake className="w-8 h-8 text-cyan-500 drop-shadow-sm" />}
                    </div>
                    
                    {/* Item Info */}
                    <h4 className="font-bold text-slate-700 text-sm mb-1">
                       {inv.type === 'STREAK_FREEZE' ? 'Seri Dondurucu' : inv.type}
                    </h4>
                    <p className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                        Otomatik Kullanılır
                    </p>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Shop;