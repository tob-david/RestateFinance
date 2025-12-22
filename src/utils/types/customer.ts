export interface IGetSoaJob {
  JOB_ID: string;
  BATCH_ID: number;
  CUSTOMER_ID: string;
  STATUS: string;
  RETRY_ATTEMPT: number;
  ERROR_MESSAGE: string;
  STARTED_AT: Date;
  COMPLETED_AT: Date;
}

export interface IGetSoaBatchStatus {
  BATCH_ID: string;
  STATUS: string;
  TOTAL_CUSTOMERS: number;
  PROCESSED_CUSTOMERS: number;
  FAILED_CUSTOMERS: number;
  CREATED_AT: Date;
  COMPLETED_AT: Date;
  ERROR_DETAILS: string;
}
