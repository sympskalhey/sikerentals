// src/lib/formatCurrency.ts
export function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-MV', {
      style: 'currency',
      currency: 'MVR',
      minimumFractionDigits: 2
    }).format(value);
  }
  