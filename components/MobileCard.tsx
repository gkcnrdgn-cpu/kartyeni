
import React from 'react';
import { CreditCard } from '../types';
import { Button } from './Button';

interface MobileCardProps {
  card: CreditCard;
  onSpend: () => void;
  onPay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onHistory: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({ card, onSpend, onPay, onEdit, onDelete, onHistory }) => {
  const usagePercent = Math.min((card.usedAmount / card.totalLimit) * 100, 100);
  const remaining = card.totalLimit - card.usedAmount;
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const getDaysUntilDue = (day: number) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let dueDate = new Date(currentYear, currentMonth, day);
    if (today.getDate() > day) dueDate = new Date(currentYear, currentMonth + 1, day);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDue(card.dueDay);
  const isCritical = daysLeft <= 5 && card.usedAmount > 0;

  return (
    <div className={`relative bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 mb-6 transition-all hover:shadow-xl group overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      {/* Kart Üst Bilgisi */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {card.bank}
            </span>
            {isCritical && (
              <span className="text-[9px] font-black text-white bg-red-500 px-2.5 py-1 rounded-lg uppercase animate-pulse">
                ACİL ÖDEME
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{card.cardName}</h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">✏️</button>
          <button onClick={onDelete} className="p-2.5 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-colors">🗑️</button>
        </div>
      </div>

      {/* Rakamlar */}
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">GÜNCEL BORÇ</p>
            <p className="text-3xl font-black text-slate-900">{formatCurrency(card.usedAmount)}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">MEVCUT LİMİT</p>
            <p className={`text-xl font-black ${remaining < 0 ? 'text-red-600' : 'text-emerald-500'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Progres Bar */}
        <div className="space-y-2">
          <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${usagePercent > 85 ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Kullanım: %{usagePercent.toFixed(0)}</span>
            <span className={`flex items-center gap-1.5 font-black ${isCritical ? 'text-red-500' : ''}`}>
               ⏰ {daysLeft === 0 ? 'SON GÜN!' : `${daysLeft} GÜN KALDI`}
            </span>
          </div>
        </div>
      </div>

      {/* Hızlı Aksiyonlar */}
      <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
        <Button onClick={onSpend} variant="secondary" className="rounded-2xl py-4 bg-slate-50 border-none text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all">💸 Harca</Button>
        <Button onClick={onPay} variant="secondary" className="rounded-2xl py-4 bg-slate-50 border-none text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all">💳 Öde</Button>
        <Button onClick={onHistory} variant="secondary" className="rounded-2xl py-4 bg-slate-50 border-none text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all">🕒 Geçmiş</Button>
      </div>
    </div>
  );
};
