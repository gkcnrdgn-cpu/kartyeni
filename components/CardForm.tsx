
import React, { useState, useEffect } from 'react';
import { CreditCard, NewCard } from '../types';
import { Button } from './Button';

interface CardFormProps {
  initialData?: CreditCard | null;
  onSubmit: (card: NewCard | CreditCard) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const CardForm: React.FC<CardFormProps> = ({ initialData, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<NewCard>({
    cardName: '',
    bank: '',
    totalLimit: 0,
    usedAmount: 0,
    dueDay: 15,
    statementDay: 5
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        cardName: initialData.cardName,
        bank: initialData.bank,
        totalLimit: initialData.totalLimit,
        usedAmount: initialData.usedAmount,
        dueDay: initialData.dueDay,
        statementDay: initialData.statementDay
      });
    } else {
      setFormData({
        cardName: '',
        bank: '',
        totalLimit: 0,
        usedAmount: 0,
        dueDay: 15,
        statementDay: 5
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.cardName || !formData.bank) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (formData.dueDay < 1 || formData.dueDay > 31 || formData.statementDay < 1 || formData.statementDay > 31) {
      setError('Gün bilgisi 1-31 arasında olmalıdır.');
      return;
    }

    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900">
            {initialData ? 'Kartı Düzenle' : 'Yeni Kart Ekle'}
          </h2>
          {/* Fixed: removed size="sm" as it's not supported by ButtonProps */}
          <Button variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10">
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Kart Adı</label>
              <input type="text" name="cardName" value={formData.cardName} onChange={handleChange} placeholder="Örn: Bonus, Axess..." className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Banka</label>
              <input type="text" name="bank" value={formData.bank} onChange={handleChange} placeholder="Örn: Garanti, Akbank..." className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Limit (₺)</label>
                <input type="number" name="totalLimit" value={formData.totalLimit || ''} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Borç (₺)</label>
                <input type="number" name="usedAmount" value={formData.usedAmount || ''} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Kesim Günü</label>
                <input type="number" name="statementDay" min="1" max="31" value={formData.statementDay} onChange={handleChange} className="w-full px-5 py-3.5 bg-blue-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-blue-600" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Ödeme Günü</label>
                <input type="number" name="dueDay" min="1" max="31" value={formData.dueDay} onChange={handleChange} className="w-full px-5 py-3.5 bg-orange-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-black text-orange-600" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 rounded-2xl py-4 border-none bg-gray-100 text-gray-500 font-black">Vazgeç</Button>
            <Button type="submit" variant="primary" className="flex-1 rounded-2xl py-4 border-none bg-blue-600 text-white font-black shadow-lg shadow-blue-200">
              {initialData ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
