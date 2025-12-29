
export const storage = {
  saveCards: (cards: any) => localStorage.setItem('kartasistan_cards_v5', JSON.stringify(cards)),
  loadCards: () => JSON.parse(localStorage.getItem('kartasistan_cards_v5') || '[]'),
  saveTransactions: (txs: any) => localStorage.setItem('kartasistan_tx_v5', JSON.stringify(txs)),
  loadTransactions: () => JSON.parse(localStorage.getItem('kartasistan_tx_v5') || '[]'),
};
