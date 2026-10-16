export function formatEuro(cents: number): string {
  const value = (Number.isFinite(cents) ? cents : 0) / 100;
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatEuroPlain(cents: number): string {
  const value = (Number.isFinite(cents) ? cents : 0) / 100;
  return value.toFixed(2).replace('.', ',');
}

export function parseEuroToCents(input: string | number): number {
  if (typeof input === 'number') return Math.round(input * 100);
  const normalized = String(input).replace(/\s/g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}
