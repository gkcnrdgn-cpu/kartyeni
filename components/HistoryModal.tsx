
import React, { useState, useMemo } from 'react';
import { CreditCard, Transaction, SpendingCategory } from '../types';
import { Button } from './Button';
import { exportToCSV } from '../utils/csvExport';

interface HistoryModalProps {
  card: CreditCard | null;
  cards: CreditCard[];
  transactions: Transaction[];
  onClose: () => void;
  isOpen: boolean;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORIES: (SpendingCategory | 'Hepsi')[] = [
  'Hepsi', 
  'Tedarikçi', 
  'Vergi/Resmi Harç', 
  'Personel', 
  'Lojistik/Ulaşım', 
  'Ofis/Kira', 
  'Pazarlama', 
  'Yazılım/SaaS', 
  'Diğer'
];

export const HistoryModal: React.FC<HistoryModalProps> = ({ card, cards, transactions, onClose, isOpen, onDeleteTransaction }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<SpendingCategory | 'Hepsi'>('Hepsi');

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (card) {
      list = list.filter(t => t.cardId === card.id);
    }
    
    return list
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'Hepsi' || t.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, card, search, filterCategory]);

  if (!isOpen) return null;

  const categoryIcons: Record<string, string> = {
    'Tedarikçi': '🏢', 
    'Vergi/Resmi Harç': '⚖️', 
    'Personel': '👥', 
    'Lojistik/Ulaşım': '🚛', 
    'Ofis/Kira': '🏠', 
    'Pazarlama': '📢', 
    'Yazılım/SaaS': '💻', 
    'Diğer': '📦'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{card ? `${card.cardName} Geçmişi` : 'Tüm İşlemler'}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {filteredTransactions.length} Kayıt Bulundu
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportToCSV(filteredTransactions, cards)} className="py-2 px-4 rounded-xl text-[10px] uppercase tracking-widest">
              Excel'e Aktar ↓
            </Button>
            <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10">✕</Button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
            <input 
              type="text" 
              placeholder="İşlemlerde ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            />
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-4 py-3 bg-white rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="group flex items-center justify-between p-4 rounded-[1.5rem] border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${t.type === 'spending' ? 'bg-orange-50' : 'bg-emerald-50'}`}>
                      {t.type === 'spending' ? (categoryIcons[t.category || 'Diğer'] || '🛍️') : '💰'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{t.description}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          {new Date(t.date).toLocaleDateString('tr-TR')}
                        </span>
                        {!card && (
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-md font-black text-slate-500">
                            {cards.find(c => c.id === t.cardId)?.cardName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-base font-black ${t.type === 'spending' ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {t.type === 'spending' ? '-' : '+'}{new Intl.NumberFormat('tr-TR').format(t.amount)} ₺
                    </span>
                    <button onClick={() => onDeleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-300 hover:text-red-500 transition-all">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
              <div className="text-4xl opacity-20">📭</div>
              <p className="text-[10px] font-black uppercase tracking-widest">Sonuç Bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
