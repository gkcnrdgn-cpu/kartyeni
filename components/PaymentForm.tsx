
import React, { useState, useEffect } from 'react';
import { CreditCard } from '../types';
import { Button } from './Button';

interface PaymentFormProps {
  card: CreditCard | null;
  onSubmit: (amount: number, description: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ card, onSubmit, onCancel, isOpen }) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('Borç Ödemesi');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(card?.usedAmount || 0);
      setDescription('Borç Ödemesi');
      setError(null);
    }
  }, [isOpen, card]);

  if (!isOpen || !card) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Ödeme tutarı 0\'dan büyük olmalıdır.');
      return;
    }

    if (!description.trim()) {
      setError('Lütfen bir açıklama girin.');
      return;
    }

    onSubmit(amount, description);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Ödeme Yap</h2>
            <p className="text-xs text-gray-500 font-medium">{card.cardName} - Borç Kapatma</p>
          </div>
          {/* Fixed: removed size="sm" as it's not supported by ButtonProps */}
          <Button variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-emerald-700 font-medium">Güncel Borç:</span>
            <span className="text-sm font-bold text-emerald-800">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(card.usedAmount)}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ödeme Tutarı (₺)</label>
            <input
              type="number"
              autoFocus
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Açıklama</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700">
              Ödemeyi Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
