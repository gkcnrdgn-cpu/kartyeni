
import React, { useState, useEffect } from 'react';
import { CreditCard, SpendingCategory } from '../types';
import { Button } from './Button';

interface SpendingFormProps {
  card: CreditCard | null;
  onSubmit: (amount: number, description: string, category: SpendingCategory) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const CATEGORIES: SpendingCategory[] = [
  'Tedarikçi', 
  'Vergi/Resmi Harç', 
  'Personel', 
  'Lojistik/Ulaşım', 
  'Ofis/Kira', 
  'Pazarlama', 
  'Yazılım/SaaS', 
  'Diğer'
];

export const SpendingForm: React.FC<SpendingFormProps> = ({ card, onSubmit, onCancel, isOpen }) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<SpendingCategory>('Tedarikçi');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setDescription('');
      setCategory('Tedarikçi');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !card) return null;

  const remainingLimit = card.totalLimit - card.usedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Harcama tutarı 0\'dan büyük olmalıdır.');
      return;
    }

    if (!description.trim()) {
      setError('Tedarikçi adı veya harcama açıklaması girilmelidir.');
      return;
    }

    if (amount > remainingLimit) {
      const confirmExceed = confirm(`Kurumsal kredi limiti aşılıyor. Onaylıyor musunuz?`);
      if (!confirmExceed) return;
    }

    onSubmit(amount, description, category);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Ticari Harcama Kaydı</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{card.cardName} | Kurumsal Kart</p>
          </div>
          <Button variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10">
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="bg-emerald-50 p-4 rounded-2xl flex justify-between items-center border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Kullanılabilir Kredi:</span>
            <span className="text-sm font-black text-emerald-800">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(remainingLimit)}
            </span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fatura / İşlem Tutarı (₺)</label>
            <input
              type="number"
              autoFocus
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="w-full px-5 py-4 text-3xl font-black border-none bg-slate-50 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Gider Kategorisi</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as SpendingCategory)}
              className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-700"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Açıklama (Tedarikçi/Proje)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: ABC Lojistik Ödemesi..."
              className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 rounded-2xl py-4 border-none bg-slate-100 text-slate-500 font-black">İptal</Button>
            <Button type="submit" variant="primary" className="flex-1 rounded-2xl py-4 border-none bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200">
              İşlemi Onayla
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
