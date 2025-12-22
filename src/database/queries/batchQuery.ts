import { executeQuery } from "../config";

/**
 * Insert a new batch
 */
export const insertBatch = async (
  batchId: string,
  total: number,
  status: string
) => {
  const sQuery = `
    INSERT INTO SOA_PROCESSING_BATCHES
    (BATCH_ID, STATUS, TOTAL_CUSTOMERS, PROCESSED_CUSTOMERS, FAILED_CUSTOMERS, CREATED_AT)
    VALUES (hextoraw(:batchId), :status, :total, 0, 0, SYSDATE)
  `;

  await executeQuery(sQuery, { batchId, status, total }, { autoCommit: true });
  return batchId;
};

/**
 * Find batch status by batch ID
 */
export const findBatchStatus = async (batchId: string) => {
  const sql = `
    SELECT TOTAL_CUSTOMERS,
           PROCESSED_CUSTOMERS,
           FAILED_CUSTOMERS
    FROM SOA_PROCESSING_BATCHES
    WHERE BATCH_ID = hextoraw(:batchId)
  `;

  const result = await executeQuery(sql, { batchId });
  return result.rows?.[0] ?? null;
};

/**
 * Update batch status
 */
export const updateBatchStatus = async (batchId: string, status: string) => {
  const sql = `
    UPDATE SOA_PROCESSING_BATCHES
    SET STATUS = :status,
        COMPLETED_AT = SYSDATE
    WHERE BATCH_ID = hextoraw(:batchId)
  `;

  await executeQuery(sql, { batchId, status }, { autoCommit: true });
};

/**
 * Increment processed customers count
 */
export const incrementProcessedCount = async (batchId: string) => {
  const sql = `
    UPDATE SOA_PROCESSING_BATCHES
    SET PROCESSED_CUSTOMERS = PROCESSED_CUSTOMERS + 1
    WHERE BATCH_ID = hextoraw(:batchId)
  `;

  await executeQuery(sql, { batchId }, { autoCommit: true });
};

/**
 * Increment failed customers count
 */
export const incrementFailedCount = async (batchId: string) => {
  const sql = `
    UPDATE SOA_PROCESSING_BATCHES
    SET FAILED_CUSTOMERS = FAILED_CUSTOMERS + 1
    WHERE BATCH_ID = hextoraw(:batchId)
  `;

  await executeQuery(sql, { batchId }, { autoCommit: true });
};
