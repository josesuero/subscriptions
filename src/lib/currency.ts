export const formatCurrency = (valueCents: number, currency: string = "EUR") => {
  const value = valueCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
};
