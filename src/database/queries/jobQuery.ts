import { executeQuery } from "../config";

/**
 * Insert a new job
 */
export const insertJob = async (
  jobId: string,
  batchId: string,
  customerId: string
) => {
  const sql = `
    INSERT INTO SOA_PROCESSING_JOBS
    (JOB_ID, BATCH_ID, CUSTOMER_ID, STATUS, RETRY_ATTEMPT, STARTED_AT)
    VALUES (hextoraw(:jobId), hextoraw(:batchId), :customerId, 'Queued', 0, SYSDATE)
  `;

  await executeQuery(sql, { jobId, batchId, customerId }, { autoCommit: true });

  return jobId;
};

/**
 * Find job by batch ID and customer ID
 */
export const findJobByBatchAndCustomer = async (
  batchId: string,
  customerId: string
) => {
  const sql = `
    SELECT RAWTOHEX(JOB_ID) AS JOB_ID,
           RETRY_ATTEMPT
    FROM SOA_PROCESSING_JOBS
    WHERE BATCH_ID = hextoraw(:batchId)
      AND CUSTOMER_ID = :customerId
  `;

  const result = await executeQuery(sql, { batchId, customerId });
  return result.rows?.[0] ?? null;
};

/**
 * Update job status
 */
export const updateJobStatus = async (
  jobId: string,
  status: string,
  errorMessage?: string,
  retryAttempt?: number
) => {
  const sql = `
    UPDATE SOA_PROCESSING_JOBS
    SET STATUS = :status,
        ERROR_MESSAGE = :err,
        RETRY_ATTEMPT = NVL(:retry, RETRY_ATTEMPT),
        COMPLETED_AT = CASE WHEN :status IN ('Completed', 'Failed') THEN SYSDATE END
    WHERE JOB_ID = hextoraw(:jobId)
  `;

  await executeQuery(
    sql,
    {
      jobId,
      status,
      err: errorMessage ?? null,
      retry: retryAttempt ?? null,
    },
    { autoCommit: true }
  );
};

/**
 * Insert a job phase
 */
export const insertPhase = async (jobId: string, phase: string) => {
  const sql = `
    INSERT INTO SOA_PROCESSING_JOB_DETAILS
    (DETAIL_ID, JOB_ID, PHASE, STARTED_AT)
    VALUES (SYS_GUID(), hextoraw(:jobId), :phase, SYSDATE)
  `;

  await executeQuery(sql, { jobId, phase }, { autoCommit: true });
};

/**
 * Complete a job phase
 */
export const completePhase = async (
  jobId: string,
  phase: string,
  errorMessage?: string
) => {
  const sql = `
    UPDATE SOA_PROCESSING_JOB_DETAILS
    SET COMPLETED_AT = SYSDATE,
        ERROR_MESSAGE = :errorMessage
    WHERE JOB_ID = hextoraw(:jobId)
      AND PHASE = :phase
      AND COMPLETED_AT IS NULL
  `;

  await executeQuery(
    sql,
    { jobId, phase, errorMessage: errorMessage ?? null },
    { autoCommit: true }
  );
};
