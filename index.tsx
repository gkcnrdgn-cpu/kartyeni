
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { CreditCard, Transaction, SpendingCategory, Firm } from './types';
import { GoogleGenAI } from '@google/genai';
import { exportToCSV } from './utils/csvExport';
import { SettingsModal } from './components/SettingsModal';

const STORAGE_KEY_CARDS = 'firmaasistan_v12_cards';
const STORAGE_KEY_TX = 'firmaasistan_v12_tx';
const STORAGE_KEY_FIRMS = 'firmaasistan_v12_firms';

const storage = {
  saveCards: (data: CreditCard[]) => localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(data)),
  loadCards: (): CreditCard[] => JSON.parse(localStorage.getItem(STORAGE_KEY_CARDS) || '[]'),
  saveTx: (data: Transaction[]) => localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(data)),
  loadTx: (): Transaction[] => JSON.parse(localStorage.getItem(STORAGE_KEY_TX) || '[]'),
  saveFirms: (data: Firm[]) => localStorage.setItem(STORAGE_KEY_FIRMS, JSON.stringify(data)),
  loadFirms: (): Firm[] => JSON.parse(localStorage.getItem(STORAGE_KEY_FIRMS) || '[]'),
  importAll: (data: { cards: CreditCard[], transactions: Transaction[], firms: Firm[] }) => {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(data.cards));
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(data.transactions));
    localStorage.setItem(STORAGE_KEY_FIRMS, JSON.stringify(data.firms));
    window.location.reload();
  }
};

const CATEGORIES: SpendingCategory[] = [
  'Tedarikçi', 'Vergi/Resmi Harç', 'Personel', 'Lojistik/Ulaşım', 'Ofis/Kira', 'Pazarlama', 'Yazılım/SaaS', 'Diğer'
];

const getDaysUntil = (dueDay: number) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let dueDate = new Date(currentYear, currentMonth, dueDay);
  if (currentDay > dueDay) dueDate = new Date(currentYear, currentMonth + 1, dueDay);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const MainVisualButton = ({ title, value, icon, color, onClick, subtext, trend }: any) => (
  <button 
    onClick={onClick}
    className={`relative overflow-hidden w-full p-6 rounded-[2.5rem] text-left transition-all active:scale-[0.96] shadow-xl ${color} border border-white/10 group`}
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-white/80 backdrop-blur-sm">
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60 mb-1">{title}</h3>
      <p className="text-2xl font-black tracking-tighter leading-none">{value}</p>
      {subtext && <p className="text-[10px] font-bold opacity-40 mt-3 flex items-center gap-1.5">{subtext} ➔</p>}
    </div>
    <div className="absolute -right-6 -bottom-6 text-white/5 text-9xl font-black select-none pointer-events-none transform -rotate-12 group-hover:rotate-0 transition-transform duration-700">
      {icon}
    </div>
  </button>
);

const App = () => {
  const [tab, setTab] = useState<'home' | 'cards' | 'history' | 'firms'>('home');
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [privacy, setPrivacy] = useState(false);
  const [modal, setModal] = useState<'card' | 'spend' | 'pay' | 'firm' | 'firm_pay' | 'settings' | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeFirmId, setActiveFirmId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  useEffect(() => {
    setCards(storage.loadCards());
    setTransactions(storage.loadTx());
    setFirms(storage.loadFirms());
  }, []);

  useEffect(() => {
    storage.saveCards(cards);
    storage.saveTx(transactions);
    storage.saveFirms(firms);
  }, [cards, transactions, firms]);

  const stats = useMemo(() => {
    const totalLimit = cards.reduce((a, b) => a + b.totalLimit, 0);
    const totalUsed = cards.reduce((a, b) => a + b.usedAmount, 0);
    const totalFirmDebt = firms.reduce((a, b) => a + b.totalDebt, 0);
    const alerts = cards
      .filter(c => c.usedAmount > 0)
      .map(c => ({ ...c, daysLeft: getDaysUntil(c.dueDay) }))
      .filter(c => c.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
    return { totalLimit, totalUsed, remaining: totalLimit - totalUsed, totalFirmDebt, alerts };
  }, [cards, transactions, firms]);

  const format = (v: number) => privacy ? '••••' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

  const deleteTransaction = (id: string) => {
    if (!confirm('İşlemi silmek bakiyeleri de güncelleyecektir. Emin misiniz?')) return;
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.cardId) {
        let cardAmt = 0;
        if (tx.type === 'spending' || tx.type === 'firm_settlement') cardAmt = -tx.amount;
        else if (tx.type === 'payment') cardAmt = tx.amount;
        setCards(prev => prev.map(c => c.id === tx.cardId ? { ...c, usedAmount: Math.max(0, c.usedAmount + cardAmt) } : c));
    }

    if (tx.firmId) {
        let firmAmt = 0;
        if (tx.type === 'spending') firmAmt = -tx.amount;
        else if (tx.type === 'firm_settlement') firmAmt = tx.amount;
        setFirms(prev => prev.map(f => f.id === tx.firmId ? { ...f, totalDebt: Math.max(0, f.totalDebt + firmAmt) } : f));
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getAIAdvice = async () => {
    if (cards.length === 0) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const context = cards.map(c => `${c.cardName}: ${c.usedAmount}/${c.totalLimit}`).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Finansal analiz: Kart borcu ${stats.totalUsed} TL, Firma borcu ${stats.totalFirmDebt} TL. Kartlar: ${context}. CFO gibi 15 kelimelik net strateji ver.`,
      });
      setAiAdvice(response.text);
    } catch (e) {
      setAiAdvice("Finansal durumunuz şu an stabil görünüyor.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#F8F9FD] flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      <header className="px-6 pt-12 pb-6 flex justify-between items-end bg-[#F8F9FD]/80 backdrop-blur-md sticky top-0 z-40 safe-area-top border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm tracking-tighter">FA</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Firma Asistan</h1>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Akıllı Mobil Muhasebe</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModal('settings')} className="w-11 h-11 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm active:scale-90 transition-all">⚙️</button>
          <button onClick={() => setPrivacy(!privacy)} className="w-11 h-11 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm active:scale-90 transition-all">{privacy ? '🔒' : '🔓'}</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-32 space-y-8 overscroll-contain">
        {tab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {stats.alerts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  Kritik Bildirimler
                </h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 snap-x">
                  {stats.alerts.map(alert => (
                    <div 
                      key={alert.id} 
                      onClick={() => { setActiveCardId(alert.id); setModal('pay'); }}
                      className={`shrink-0 w-[280px] p-6 rounded-[2.5rem] border snap-center transition-all active:scale-95 cursor-pointer shadow-sm ${alert.daysLeft <= 3 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${alert.daysLeft <= 3 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                          {alert.daysLeft === 0 ? 'BUGÜN SON GÜN!' : alert.daysLeft === 1 ? 'YARIN ÖDEME' : `${alert.daysLeft} GÜN KALDI`}
                        </span>
                        <span className="text-xl">💳</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mb-1">{alert.cardName}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Borç: <span className="text-red-600 font-black">{format(alert.usedAmount)}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl transition-all"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Toplam Limit Gücü</p>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8">{format(stats.remaining)}</h2>
               <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden mb-6 border border-slate-100">
                  <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${cards.length > 0 ? (stats.remaining / stats.totalLimit) * 100 : 0}%` }}></div>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <div className="flex flex-col">
                    <span className="text-slate-400">Kart Borcu</span>
                    <span className="text-slate-900 mt-1">{format(stats.totalUsed)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-400">Cari Borç</span>
                    <span className="text-indigo-600 mt-1">{format(stats.totalFirmDebt)}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <MainVisualButton title="Cari Hesaplar" value={format(stats.totalFirmDebt)} icon="🏢" color="bg-indigo-600 text-white" subtext="Firma Borç Takibi" trend={`${firms.length} Firma`} onClick={() => setTab('firms')} />
               <MainVisualButton title="Kartlarım" value={format(stats.totalUsed)} icon="💳" color="bg-slate-900 text-white" subtext="Limit Kontrol" onClick={() => setTab('cards')} />
               <MainVisualButton title="AI Rapor" value={aiLoading ? "..." : "Analiz"} icon="✨" color="bg-emerald-500 text-white" subtext="CFO Önerisi" onClick={getAIAdvice} />
            </div>

            {aiAdvice && (
              <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm animate-in zoom-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-lg">🤖</span>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Akıllı Tavsiye</span>
                </div>
                <p className="text-xs font-bold text-slate-700 leading-relaxed italic">"{aiAdvice}"</p>
                <button onClick={() => setAiAdvice(null)} className="mt-4 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-emerald-100 active:scale-95 transition-all">Anladım</button>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Son Hareketler</h3>
                <button onClick={() => setTab('history')} className="text-[10px] font-black text-indigo-600 px-4 py-2 bg-indigo-50 rounded-full active:scale-90 transition-all uppercase tracking-widest">Tümü</button>
              </div>
              <div className="space-y-3">
                {transactions.slice(-5).reverse().map(t => (
                  <div key={t.id} className="bg-white p-5 rounded-[2rem] flex justify-between items-center shadow-sm border border-slate-50 transition-all active:bg-slate-50 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                        {t.type === 'spending' ? '💸' : t.type === 'firm_settlement' ? '🤝' : '💰'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 mb-1 leading-none">{t.description}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {t.type === 'firm_settlement' ? 'Cari Ödeme (Kart)' : (t.category || 'Genel')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                        <p className={`text-xs font-black ${t.type === 'spending' || t.type === 'firm_settlement' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {t.type === 'spending' || t.type === 'firm_settlement' ? '-' : '+'}{format(t.amount)}
                        </p>
                        <button onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-200">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(tab === 'firms' || tab === 'cards' || tab === 'history') && (
           <div className="animate-in slide-in-from-bottom-8 duration-500 pb-12">
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {tab === 'firms' ? 'Cari Hesaplar' : tab === 'cards' ? 'Kartlarım' : 'İşlem Geçmişi'}
                </h2>
                {tab !== 'history' && (
                  <button onClick={() => setModal(tab === 'firms' ? 'firm' : 'card')} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl active:scale-90 transition-all">+</button>
                )}
              </div>
              <div className="space-y-5">
                {tab === 'firms' && firms.map(f => (
                  <div key={f.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-lg relative">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tedarikçi</p>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">{f.name}</h4>
                        </div>
                        <button onClick={() => { if(confirm('Silsin mi?')) setFirms(firms.filter(fi => fi.id !== f.id)); }} className="w-9 h-9 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center text-xs">🗑️</button>
                    </div>
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cari Borç</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{format(f.totalDebt)}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setActiveFirmId(f.id); setModal('firm_pay'); }} className="flex-1 py-4.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-indigo-100">Ödeme Yap (Kartla)</button>
                        <button onClick={() => { setActiveFirmId(f.id); setModal('spend'); }} className="flex-1 py-4.5 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95">Borç Gir</button>
                    </div>
                  </div>
                ))}
                
                {tab === 'cards' && cards.map(c => (
                  <div key={c.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-lg relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{c.bank}</span>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">{c.cardName}</h4>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingCard(c); setModal('card'); }} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">✏️</button>
                        <button onClick={() => { if(confirm('Silsin mi?')) setCards(cards.filter(card => card.id !== c.id)); }} className="w-10 h-10 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center">🗑️</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kart Borcu</p>
                        <p className="text-xl font-black text-red-500">{format(c.usedAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Limit</p>
                        <p className="text-xl font-black text-slate-900">{format(c.totalLimit)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setActiveCardId(c.id); setModal('spend'); }} className="flex-1 py-4.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase active:scale-95">Harcama</button>
                      <button onClick={() => { setActiveCardId(c.id); setModal('pay'); }} className="flex-1 py-4.5 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase active:scale-95">Ödeme</button>
                    </div>
                  </div>
                ))}

                {tab === 'history' && transactions.length > 0 ? [...transactions].reverse().map(t => (
                  <div key={t.id} className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-50 group active:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                        {t.type === 'spending' ? '💸' : t.type === 'firm_settlement' ? '🤝' : '💰'}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-none mb-1">{t.description}</h4>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(t.date).toLocaleDateString('tr-TR')} {t.cardId && `• ${cards.find(c => c.id === t.cardId)?.cardName}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className={`text-xs font-black ${t.type === 'spending' || t.type === 'firm_settlement' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {t.type === 'spending' || t.type === 'firm_settlement' ? '-' : '+'}{format(t.amount)}
                      </p>
                      <button onClick={() => deleteTransaction(t.id)} className="p-2 text-red-200 active:text-red-500">🗑️</button>
                    </div>
                  </div>
                )) : (tab === 'history' && <div className="py-24 text-center opacity-20 text-[10px] font-black uppercase tracking-widest">Kayıt Bulunmuyor</div>)}
              </div>
           </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto h-24 bg-white/90 backdrop-blur-2xl border-t border-slate-100 flex justify-around items-center z-50 safe-area-bottom px-6 shadow-xl">
        {[
          { id: 'home', icon: '🏠', label: 'Genel' },
          { id: 'firms', icon: '🏢', label: 'Cari' },
          { id: 'cards', icon: '💳', label: 'Kart' },
          { id: 'history', icon: '⚡', label: 'Geçmiş' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setTab(item.id as any)} 
            className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${tab === item.id ? 'text-indigo-600' : 'text-slate-300'}`}
          >
            <div className={`text-2xl transition-transform ${tab === item.id ? 'scale-125' : 'scale-100'}`}>{item.icon}</div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${tab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-0 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg bottom-sheet p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-10"></div>
            
            {modal === 'settings' && <SettingsModal isOpen onClose={() => setModal(null)} onImport={(d) => storage.importAll(d)} currentData={{ cards, transactions, firms }} />}
            
            {modal === 'firm' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  setFirms([...firms, { id: crypto.randomUUID(), name: d.get('name') as string, totalDebt: Number(d.get('debt')) || 0 }]);
                  setModal(null);
                }} className="space-y-6">
                  <h2 className="text-xl font-black text-slate-900 uppercase text-center mb-8">Firma Ekle</h2>
                  <input name="name" placeholder="Firma Adı" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" required />
                  <input name="debt" type="number" placeholder="Mevcut Borç ₺" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" />
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Vazgeç</button>
                    <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Kaydet</button>
                  </div>
                </form>
            )}

            {modal === 'spend' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  const amt = Number(d.get('amount'));
                  const cId = d.get('cardId') as string;
                  const fId = d.get('firmId') as string;
                  if (amt <= 0) return alert('Geçerli tutar girin');
                  if (cId) setCards(p => p.map(c => c.id === cId ? { ...c, usedAmount: c.usedAmount + amt } : c));
                  if (fId) setFirms(p => p.map(f => f.id === fId ? { ...f, totalDebt: f.totalDebt + amt } : f));
                  setTransactions([...transactions, { id: crypto.randomUUID(), cardId: cId || undefined, firmId: fId || undefined, amount: amt, description: d.get('desc') as string, date: new Date().toISOString(), type: 'spending', category: d.get('cat') as SpendingCategory }]);
                  setModal(null);
                }} className="space-y-6">
                  <h2 className="text-xl font-black text-slate-900 uppercase text-center mb-2 tracking-tight">Harcama Kaydı</h2>
                  <input name="amount" type="number" placeholder="0.00 ₺" className="w-full p-6 bg-slate-50 rounded-[2rem] font-black text-3xl text-center text-indigo-600 border-none outline-none" required autoFocus />
                  <input name="desc" placeholder="Harcama Açıklaması" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" required />
                  <div className="grid grid-cols-2 gap-4">
                    <select name="cardId" className="p-4 bg-slate-50 rounded-2xl font-bold text-xs">
                        <option value="">Nakit</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.cardName}</option>)}
                    </select>
                    <select name="firmId" defaultValue={activeFirmId || ""} className="p-4 bg-slate-50 rounded-2xl font-bold text-xs">
                        <option value="">Firma Yok</option>
                        {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Vazgeç</button>
                    <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Onayla</button>
                  </div>
                </form>
            )}

            {modal === 'firm_pay' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  const amt = Number(d.get('amount'));
                  const cId = d.get('cardId') as string;
                  const selectedCard = cards.find(c => c.id === cId);
                  const selectedFirm = firms.find(f => f.id === activeFirmId);
                  
                  if (amt <= 0) return alert('Geçerli tutar girin');
                  if (!cId) return alert('Lütfen ödeme yapılacak kartı seçin');

                  if (activeFirmId) setFirms(p => p.map(f => f.id === activeFirmId ? { ...f, totalDebt: Math.max(0, f.totalDebt - amt) } : f));
                  setCards(p => p.map(c => c.id === cId ? { ...c, usedAmount: c.usedAmount + amt } : c));
                  
                  setTransactions([...transactions, { 
                    id: crypto.randomUUID(), 
                    cardId: cId, 
                    firmId: activeFirmId!, 
                    amount: amt, 
                    description: `${selectedFirm?.name} Ödemesi (${selectedCard?.cardName})`, 
                    date: new Date().toISOString(), 
                    type: 'firm_settlement', 
                    category: 'Tedarikçi' 
                  }]);
                  setModal(null);
                }} className="space-y-6">
                  <h2 className="text-xl font-black text-slate-900 uppercase text-center mb-8 tracking-tight">Cari Borç Kapatma</h2>
                  <input name="amount" type="number" placeholder="0.00 ₺" className="w-full p-6 bg-slate-50 rounded-[2rem] font-black text-3xl text-center text-red-600 border-none outline-none" required autoFocus />
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Ödeme Yapılacak Kart</label>
                    <select name="cardId" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" required>
                        <option value="">Kart Seçin...</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.bank} - {c.cardName}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">İptal</button>
                    <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Ödemeyi Yap</button>
                  </div>
                </form>
            )}

            {modal === 'pay' && (
               <form onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                const amt = Number(d.get('amount'));
                if (amt <= 0) return alert('Geçerli tutar girin');
                setCards(p => p.map(c => c.id === activeCardId ? { ...c, usedAmount: Math.max(0, c.usedAmount - amt) } : c));
                setTransactions([...transactions, { id: crypto.randomUUID(), cardId: activeCardId!, amount: amt, description: 'Kart Borç Ödemesi', date: new Date().toISOString(), type: 'payment' }]);
                setModal(null);
               }} className="space-y-6">
                 <h2 className="text-xl font-black text-slate-900 uppercase text-center mb-8">Kart Borç Ödeme</h2>
                 <input name="amount" type="number" placeholder="Ödeme Tutarı ₺" className="w-full p-6 bg-slate-50 rounded-[2rem] font-black text-3xl text-center text-emerald-600" required autoFocus />
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Vazgeç</button>
                    <button type="submit" className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Ödeme Yap</button>
                 </div>
               </form>
            )}

            {modal === 'card' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  const cardData: CreditCard = {
                    id: editingCard ? editingCard.id : crypto.randomUUID(),
                    cardName: d.get('name') as string,
                    bank: d.get('bank') as string,
                    totalLimit: Number(d.get('limit')),
                    usedAmount: editingCard ? editingCard.usedAmount : (Number(d.get('debt')) || 0),
                    dueDay: Number(d.get('dueDay')),
                    statementDay: 1
                  };
                  if (editingCard) setCards(cards.map(c => c.id === editingCard.id ? cardData : c));
                  else setCards([...cards, cardData]);
                  setModal(null);
                }} className="space-y-6">
                  <h2 className="text-xl font-black text-slate-900 uppercase text-center mb-8">{editingCard ? 'Kartı Düzenle' : 'Kart Ekle'}</h2>
                  <input name="name" defaultValue={editingCard?.cardName} placeholder="Kart Adı" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" required />
                  <input name="bank" defaultValue={editingCard?.bank} placeholder="Banka" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" required />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="limit" type="number" defaultValue={editingCard?.totalLimit} placeholder="Limit ₺" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" required />
                    <input name="dueDay" type="number" min="1" max="31" defaultValue={editingCard?.dueDay || 15} placeholder="Ödeme Günü" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" required />
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Vazgeç</button>
                    <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Kaydet</button>
                  </div>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
