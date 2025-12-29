
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CreditCard, Transaction } from '../types';

interface AIAdvisorProps {
  cards: CreditCard[];
  transactions?: Transaction[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ cards, transactions = [] }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    if (cards.length === 0) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const cardContext = cards.map(c => `${c.cardName}: ${c.usedAmount}/${c.totalLimit}`).join('; ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Şirket mali durumu: ${cardContext}. Bir CFO olarak 20 kelimelik net bir finansal tavsiye ver.`,
      });
      setAdvice(response.text || 'Analiz tamamlandı.');
    } catch (err) {
      setAdvice('Bağlantı kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-200">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${loading ? 'animate-pulse bg-emerald-500' : 'bg-slate-800'}`}>
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h4 className="text-sm font-black tracking-tight">Akıllı CFO Raporu</h4>
          <p className="text-xs text-slate-400 font-medium">
            {advice ? advice : 'Mevcut verilerle bir stratejik analiz oluşturmamı ister misiniz?'}
          </p>
        </div>
      </div>
      <button 
        onClick={getAdvice} 
        disabled={loading || cards.length === 0}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shrink-0"
      >
        {loading ? 'ANALİZ EDİLİYOR...' : 'RAPORU OLUŞTUR'}
      </button>
    </div>
  );
};
