const formatter = new Intl.NumberFormat("ru-KG", {
  style: "currency",
  currency: "KGS",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return formatter.format(value);
}
