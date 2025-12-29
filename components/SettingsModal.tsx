
import React, { useRef } from 'react';
import { Button } from './Button';
import { CreditCard, Transaction, Firm } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
  currentData: {
    cards: CreditCard[];
    transactions: Transaction[];
    firms: Firm[];
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onImport, currentData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `firma_asistan_yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('Yedek dosyası indirildi.');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.cards) {
          if (confirm('Veriler silinecek ve yedek yüklenecek. Onaylıyor musunuz?')) {
            onImport(json);
          }
        }
      } catch (err) {
        alert('Geçersiz dosya.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase">Ayarlar</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Veri Yönetimi</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-gray-400">✕</button>
        </div>
        
        <div className="p-8 space-y-6">
          <Button onClick={handleExport} variant="accent" className="w-full py-4 rounded-2xl font-black text-[10px] uppercase bg-indigo-600">
            Verileri Yedekle (Dışa Aktar)
          </Button>
          <Button onClick={handleImportClick} variant="secondary" className="w-full py-4 rounded-2xl font-black text-[10px] uppercase border-indigo-100 text-indigo-600">
            Yedek Yükle (İçe Aktar)
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          <Button variant="secondary" onClick={onClose} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase bg-slate-900 text-white border-none">
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
};
