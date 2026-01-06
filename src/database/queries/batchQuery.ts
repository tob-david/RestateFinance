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
           PROCESSED_CUSTOMERS AS processed_customers,
           FAILED_CUSTOMERS AS failed_customers
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

/**
 * Increment processed count and check if batch is complete (Event-Driven Counter)
 * Returns true if this was the last customer to complete
 */
export const incrementProcessedAndCheckComplete = async (
  batchId: string
): Promise<{ isComplete: boolean; status: string }> => {
  // Increment processed count
  await executeQuery(
    `UPDATE SOA_PROCESSING_BATCHES
     SET PROCESSED_CUSTOMERS = PROCESSED_CUSTOMERS + 1
     WHERE BATCH_ID = hextoraw(:batchId)`,
    { batchId },
    { autoCommit: true }
  );

  // Get current status
  const result = await executeQuery(
    `SELECT TOTAL_CUSTOMERS, PROCESSED_CUSTOMERS, FAILED_CUSTOMERS
     FROM SOA_PROCESSING_BATCHES
     WHERE BATCH_ID = hextoraw(:batchId)`,
    { batchId }
  );

  const row = result.rows?.[0] as any;
  if (!row) return { isComplete: false, status: "Unknown" };

  const total = row.TOTAL_CUSTOMERS ?? 0;
  const processed = row.PROCESSED_CUSTOMERS ?? 0;
  const failed = row.FAILED_CUSTOMERS ?? 0;
  const totalDone = processed + failed;

  if (totalDone >= total) {
    // Determine final status
    let status = "Completed";
    if (failed > 0 && processed > 0) {
      status = "Partially Failed";
    } else if (processed === 0) {
      status = "Failed";
    }
    return { isComplete: true, status };
  }

  return { isComplete: false, status: "Processing" };
};

/**
 * Increment failed count and check if batch is complete (Event-Driven Counter)
 * Returns true if this was the last customer to complete
 */
export const incrementFailedAndCheckComplete = async (
  batchId: string
): Promise<{ isComplete: boolean; status: string }> => {
  // Increment failed count
  await executeQuery(
    `UPDATE SOA_PROCESSING_BATCHES
     SET FAILED_CUSTOMERS = FAILED_CUSTOMERS + 1
     WHERE BATCH_ID = hextoraw(:batchId)`,
    { batchId },
    { autoCommit: true }
  );

  // Get current status
  const result = await executeQuery(
    `SELECT TOTAL_CUSTOMERS, PROCESSED_CUSTOMERS, FAILED_CUSTOMERS
     FROM SOA_PROCESSING_BATCHES
     WHERE BATCH_ID = hextoraw(:batchId)`,
    { batchId }
  );

  const row = result.rows?.[0] as any;
  if (!row) return { isComplete: false, status: "Unknown" };

  const total = row.TOTAL_CUSTOMERS ?? 0;
  const processed = row.PROCESSED_CUSTOMERS ?? 0;
  const failed = row.FAILED_CUSTOMERS ?? 0;
  const totalDone = processed + failed;

  if (totalDone >= total) {
    // Determine final status
    let status = "Completed";
    if (failed > 0 && processed > 0) {
      status = "Partially Failed";
    } else if (processed === 0) {
      status = "Failed";
    }
    return { isComplete: true, status };
  }

  return { isComplete: false, status: "Processing" };
};
