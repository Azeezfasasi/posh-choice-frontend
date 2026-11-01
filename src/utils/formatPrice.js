// "₦12,500" or "₦12,500.50": no trailing .00 on whole amounts
export const formatNaira = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
