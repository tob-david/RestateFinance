import { v4 as uuidv4 } from "uuid";
import { executeQuery } from "../config";
import { formatUUID } from "../../utils/formater";

/**
 * Insert a reminder letter record
 */
export const insertReminderLetter = async (
  reminderId: string,
  type: string,
  letterNo: string,
  referenceId: string | null,
  sentDate: Date
): Promise<string> => {
  const id = formatUUID(uuidv4());

  const sql = `
    INSERT INTO SOA_REMINDER_LETTER (ID, REMINDER_ID, TYPE, LETTER_NO, REFERENCE_ID, SENT_DATE)
    VALUES (hextoraw(:id), hextoraw(:reminderId), :type, :letterNo, 
            ${referenceId ? "hextoraw(:referenceId)" : "NULL"}, :sentDate)
  `;

  const binds: Record<string, any> = {
    id,
    reminderId,
    type,
    letterNo,
    sentDate,
  };

  if (referenceId) {
    binds.referenceId = referenceId;
  }

  await executeQuery(sql, binds, { autoCommit: true });

  return id;
};

/**
 * Find the latest reminder letter for a reminder
 */
export const findLatestLetter = async (
  reminderId: string
): Promise<{ TYPE: string; SENT_DATE: Date; LETTER_NO: string } | null> => {
  const sql = `
    SELECT TYPE, SENT_DATE, LETTER_NO FROM (
      SELECT TYPE, SENT_DATE, LETTER_NO
      FROM SOA_REMINDER_LETTER
      WHERE REMINDER_ID = hextoraw(:reminderId)
      ORDER BY SENT_DATE DESC
    ) WHERE ROWNUM = 1
  `;

  const result = await executeQuery(sql, { reminderId });
  return (result.rows?.[0] as any) ?? null;
};

/**
 * Get next letter sequence number
 */
export const getNextLetterSequence = async (
  type: string,
  year: number,
  month: number
): Promise<number> => {
  const sql = `
    SELECT COUNT(*) + 1 AS NEXT_NO
    FROM SOA_REMINDER_LETTER
    WHERE TYPE = :type
      AND EXTRACT(YEAR FROM SENT_DATE) = :year
      AND EXTRACT(MONTH FROM SENT_DATE) = :month
  `;

  const result = await executeQuery(sql, { type, year, month });
  return (result.rows?.[0] as any)?.NEXT_NO ?? 1;
};
