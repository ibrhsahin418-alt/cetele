
import React from 'react';
import { Wrench } from 'lucide-react';

const InspirationView: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
        <div className="bg-slate-200 p-6 rounded-full mb-4">
            <Wrench className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Özellik Devre Dışı</h2>
        <p className="max-w-md">Bu bölüm şu anda bakım aşamasındadır veya kaldırılmıştır.</p>
    </div>
  );
};

export default InspirationView;
