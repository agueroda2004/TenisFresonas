const CRC_SYMBOL = "₡";
const CRC_GROUP_SEPARATOR = ",";
const CRC_DECIMAL_SEPARATOR = ".";

function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

function groupThousands(integerPart: string): string {
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, CRC_GROUP_SEPARATOR);
}

export function formatCRC(rawValue: string | number): string {
  const digits = digitsOnly(String(rawValue ?? ""));
  if (!digits) return "";

  const hasLeadingZeros = /^0+/.test(digits);
  const trimmed = hasLeadingZeros ? "0" : digits;

  const [intPartRaw, decPartRaw = ""] = trimmed.split(".");
  const integerFormatted = groupThousands(intPartRaw);

  if (decPartRaw.length > 0) {
    return `${CRC_SYMBOL}${integerFormatted}${CRC_DECIMAL_SEPARATOR}${decPartRaw.slice(0, 2)}`;
  }

  return `${CRC_SYMBOL}${integerFormatted}`;
}

export function sanitizePriceInput(value: string): string {
  return digitsOnly(value).slice(0, 12);
}

export function parseCRCToNumber(formatted: string): number {
  const cleaned = digitsOnly(formatted);
  return cleaned ? Number(cleaned) : 0;
}

export const CRC = {
  symbol: CRC_SYMBOL,
  groupSeparator: CRC_GROUP_SEPARATOR,
  decimalSeparator: CRC_DECIMAL_SEPARATOR,
} as const;