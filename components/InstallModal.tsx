
import React, { useState } from 'react';
import { Button } from './Button';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>('cloud');
  const [localIp, setLocalIp] = useState('');

  if (!isOpen) return null;

  const port = window.location.port ? `:${window.location.port}` : '';
  const currentUrl = localIp ? `http://${localIp}${port}` : window.location.origin;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-b from-blue-50 to-white">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Telefonda Aç</h2>
          <p className="text-sm text-gray-500 font-medium">Uygulamaya her yerden erişin</p>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-100 mx-8 mt-6 rounded-2xl">
          <button 
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'cloud' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Bulut (En Kolay & Kalıcı)
          </button>
          <button 
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'local' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Yerel Ağ (Geçici)
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'cloud' ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-[10px]">!</span>
                  Kalıcı Çözüm: Vercel ile Yayınlayın
                </h3>
                <ol className="space-y-4 text-sm text-blue-800">
                  <li className="flex gap-3">
                    <span className="font-black opacity-30 italic text-xl -mt-1">01</span>
                    <p><b>Vercel.com</b> adresine gidin ve ücretsiz bir hesap açın.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-black opacity-30 italic text-xl -mt-1">02</span>
                    <p>Bu projenin dosyalarını bir klasöre koyup Vercel ekranına <b>sürükleyip bırakın.</b></p>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-black opacity-30 italic text-xl -mt-1">03</span>
                    <p>Size verilen <b>.vercel.app</b> linkini telefonunuzda açın ve <b>"Ana Ekrana Ekle"</b> deyin.</p>
                  </li>
                </ol>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-[11px] text-gray-500 italic">
                  Bu yöntemle verileriniz kaybolmaz ve internet olan her yerden kartlarınızı takip edebilirsiniz.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">
                  PC IP Adresinizi Girin (Örn: 192.168.1.15)
                </label>
                <input 
                  type="text" 
                  placeholder="0.0.0.0" 
                  value={localIp}
                  onChange={(e) => setLocalIp(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl text-center font-mono text-xl font-bold text-blue-600 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 relative">
                {!localIp && (
                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-3xl text-center p-6">
                    <p className="text-xs font-bold text-gray-500">IP adresinizi yazdığınızda QR kod görünecektir.</p>
                  </div>
                )}
                <img 
                  src={qrCodeUrl} 
                  alt="QR Kod" 
                  className="w-40 h-40 mb-3 rounded-xl bg-white p-2 shadow-sm"
                />
                <p className="text-[10px] text-gray-400 font-mono italic">{currentUrl}</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-[11px] text-orange-700 text-center font-medium leading-relaxed">
                  <b>Dikkat:</b> Bu yöntem sadece bilgisayarınız ve telefonunuz <b>aynı Wi-Fi</b> üzerindeyse çalışır.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50">
          <Button onClick={onClose} className="w-full py-4 rounded-2xl font-black bg-gray-900 hover:bg-black border-none text-sm uppercase tracking-widest">
            Anladım
          </Button>
        </div>
      </div>
    </div>
  );
};
