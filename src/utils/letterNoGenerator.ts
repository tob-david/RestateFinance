/**
 * Letter Number Generator
 * Format: XXX/FIN/SOA/RL{type}/{month_roman}/{year}
 * Example: 001/FIN/SOA/RL1/XII/2024
 */

import { getNextLetterSequence } from "../database/queries";

const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

/**
 * Generate letter number for SOA reminder letters
 * @param type - Reminder type: "1", "2", or "3"
 * @param date - Date for the letter (defaults to now)
 * @returns Formatted letter number
 */
export const generateLetterNo = async (
  type: string,
  date: Date = new Date()
): Promise<string> => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  // Get next sequence number from database
  const seqNo = await getNextLetterSequence(type, year, month);

  // Format: XXX/FIN/SOA/RL{type}/{month_roman}/{year}
  const paddedSeq = seqNo.toString().padStart(3, "0");
  const romanMonth = ROMAN_MONTHS[month - 1];

  return `${paddedSeq}/FIN/SOA/RL${type}/${romanMonth}/${year}`;
};

/**
 * Generate simple letter number without database lookup
 * Use this when you already have the sequence number
 */
export const formatLetterNo = (
  seqNo: number,
  type: string,
  date: Date = new Date()
): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const paddedSeq = seqNo.toString().padStart(3, "0");
  const romanMonth = ROMAN_MONTHS[month - 1];

  return `${paddedSeq}/FIN/SOA/RL${type}/${romanMonth}/${year}`;
};
