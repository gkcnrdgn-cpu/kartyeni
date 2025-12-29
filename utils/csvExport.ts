
import { Transaction, CreditCard, Firm } from '../types';

export const exportToCSV = (transactions: Transaction[], cards: CreditCard[], firms: Firm[] = []) => {
  const headers = ['Tarih', 'Kart', 'Firma', 'Açıklama', 'Kategori', 'Tip', 'Tutar'];
  const rows = transactions.map(tx => {
    const card = cards.find(c => c.id === tx.cardId);
    const firm = firms.find(f => f.id === tx.firmId);
    
    let typeStr = 'Harcama';
    if (tx.type === 'payment') typeStr = 'Kart Ödemesi';
    if (tx.type === 'firm_settlement') typeStr = 'Firma Ödemesi';

    return [
      new Date(tx.date).toLocaleDateString('tr-TR'),
      card?.cardName || '-',
      firm?.name || '-',
      tx.description,
      tx.category || '-',
      typeStr,
      tx.amount
    ];
  });

  const csvContent = [headers, ...rows]
    .map(e => e.join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `firma_asistan_rapor_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
