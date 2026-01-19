import { v4 as uuidv4 } from "uuid";
import { formatUUID } from "../../utils/formater";
import { executeQuery } from "../config";

// Find reminder by customer code and time period
export const findReminderByCustomerAndPeriod = async (
  customerCode: string,
  timePeriod: string
) => {
  const sql = `SELECT ID as id, CM_CODE as customerCode, TIME_PERIOD as timePeriod, OFFICE_ID as officeId FROM SOA_REMINDER WHERE CM_CODE = :customerCode AND TIME_PERIOD = :timePeriod`;
  const result = await executeQuery(sql, { customerCode, timePeriod });
  return result.rows ?? [];
};

/**
 * Insert a new reminder and return its ID
 */
export const insertReminder = async (
  cmCode: string,
  timePeriod: string,
  officeId: string
): Promise<string> => {
  // Generate UUID in JavaScript to avoid RETURNING INTO binding issues
  const id = formatUUID(uuidv4());

  const sql = `
    INSERT INTO SOA_REMINDER (ID, CM_CODE, TIME_PERIOD, OFFICE_ID)
    VALUES (hextoraw(:id), :cmCode, :timePeriod, :officeId)
  `;

  await executeQuery(
    sql,
    {
      id,
      cmCode,
      timePeriod,
      officeId: officeId || null,
    },
    { autoCommit: true }
  );

  return id;
};

/**
 * Insert reminder detail
 */
export const insertReminderDetail = async (
  dcNoteId: string,
  reminderId: string,
  isPaid: string = "N"
): Promise<void> => {
  const sql = `
    INSERT INTO SOA_REMINDER_DETAIL (DC_NOTE_ID, REMINDER_ID, IS_PAID)
    VALUES (:dcNoteId, hextoraw(:reminderId), :isPaid)
  `;

  await executeQuery(
    sql,
    { dcNoteId, reminderId, isPaid },
    { autoCommit: true }
  );
};

/**
 * Find DC Note IDs by customer code
 */
export const findDcNoteIdsByCustomer = async (
  cmCode: string
): Promise<string[]> => {
  const sql = `
    SELECT srd.DC_NOTE_ID 
    FROM SOA_REMINDER_DETAIL srd
    LEFT JOIN SOA_REMINDER sr ON srd.REMINDER_ID = sr.ID 
    WHERE sr.CM_CODE = :cmCode
  `;

  const result = await executeQuery(sql, { cmCode });
  return (result.rows as any[])?.map((r) => r.DC_NOTE_ID).filter(Boolean) ?? [];
};
