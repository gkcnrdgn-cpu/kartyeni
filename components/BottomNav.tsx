
import React from 'react';

interface BottomNavProps {
  activeTab: 'overview' | 'cards' | 'tools';
  setActiveTab: (tab: 'overview' | 'cards' | 'tools') => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onAddClick }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex items-center justify-between z-[60] safe-area-bottom">
      <button 
        onClick={() => setActiveTab('overview')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <svg className="w-6 h-6" fill={activeTab === 'overview' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="text-[10px] font-bold">Genel</span>
      </button>

      <button 
        onClick={onAddClick}
        className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center -mt-8 active:scale-95 transition-transform"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <button 
        onClick={() => setActiveTab('cards')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'cards' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <svg className="w-6 h-6" fill={activeTab === 'cards' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span className="text-[10px] font-bold">Kartlarım</span>
      </button>
    </div>
  );
};
