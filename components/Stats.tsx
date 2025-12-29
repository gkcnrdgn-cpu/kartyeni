
import React from 'react';
import { CardStats } from '../types';

interface StatsProps {
  stats: CardStats;
  privacyMode: boolean;
}

export const Stats: React.FC<StatsProps> = ({ stats, privacyMode }) => {
  const formatValue = (val: number) => {
    if (privacyMode) return '••••••';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const usagePercent = stats.totalLimit > 0 ? (stats.totalUsed / stats.totalLimit) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-2 bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Kullanılabilir Limit</p>
            <h3 className="text-4xl font-black tracking-tighter text-emerald-400">{formatValue(stats.totalRemaining)}</h3>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl text-2xl">⚡</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
            <span>Limit Kullanımı</span>
            <span>%{usagePercent.toFixed(1)}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-orange-500' : 'bg-emerald-400'}`} 
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Borç</p>
          <h3 className="text-3xl font-black tracking-tighter text-red-500">{formatValue(stats.totalUsed)}</h3>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-4 italic">Ödeme tarihlerine dikkat edin.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Şirket Kredisi</p>
          <h3 className="text-3xl font-black tracking-tighter text-slate-900">{formatValue(stats.totalLimit)}</h3>
        </div>
        <p className="text-[10px] font-bold text-emerald-500 mt-4 uppercase">Aktif Kredi Gücü</p>
      </div>
    </div>
  );
};
