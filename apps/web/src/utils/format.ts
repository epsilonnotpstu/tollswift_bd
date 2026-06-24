export const formatBDT = (amountPaisa: number, bn = false) => {
  const amount = amountPaisa / 100;
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `৳ ${bn ? toBengaliDigits(formatted) : formatted}`;
};

export const toBengaliDigits = (value: string | number) => {
  const map: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯'
  };
  return String(value).replace(/[0-9]/g, (digit) => map[digit]);
};

export const formatDateTime = (value?: string) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

