// src/shared/lib/format.ts
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}
