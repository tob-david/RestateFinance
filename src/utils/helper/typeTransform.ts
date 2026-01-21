type OracleDate = Date | string | number | null | undefined;
type OracleNumber = number | string | null | undefined;
type OracleString = string | number | null | undefined;

export function parseNumber(value: OracleNumber): number {
  if (value === null || value === undefined) return 0;

  const num = parseFloat(value.toString());
  return isNaN(num) ? 0 : num;
}

export function parseString(value: OracleString): string {
  if (value === null || value === undefined) return "";

  return value.toString().trim();
}

export function parseDate(value: OracleDate): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;

  return new Date(value);
}
