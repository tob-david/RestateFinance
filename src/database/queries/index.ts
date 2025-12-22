// Customer Queries
export {
  findAllAccounts,
  findCustomerById,
  findCustomerEmails,
} from "./customerQuery";

// Branch Queries
export { findAllBranches } from "./branchQuery";

// Batch Queries
export {
  insertBatch,
  findBatchStatus,
  updateBatchStatus,
  incrementProcessedCount,
  incrementFailedCount,
} from "./batchQuery";

// Job Queries
export {
  insertJob,
  findJobByBatchAndCustomer,
  updateJobStatus,
  insertPhase,
  completePhase,
} from "./jobQuery";

// SOA Queries
export { fetchSoaFromProcedure } from "./soaQuery";

// Reminder Queries
export {
  findReminderByCustomerAndPeriod,
  insertReminder,
  insertReminderDetail,
  findDcNoteIdsByCustomer,
} from "./reminderQuery";

// Letter Queries
export {
  insertReminderLetter,
  findLatestLetter,
  getNextLetterSequence,
} from "./letterQuery";
