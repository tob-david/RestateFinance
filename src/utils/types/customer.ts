export interface IGetSoaJob {
  job_id: string;
  batch_id: number;
  customer_id: string;
  status: string;
  retry_attempt: number;
  error_message: string;
  started_at: Date;
  completed_at: Date;
}

export interface IGetSoaBatchStatus {
  batch_id: string;
  status: string;
  total_customers: number;
  processed_customers: number;
  failed_customers: number;
  created_at: Date;
  completed_at: Date;
  error_details: string;
}

export interface IAccountRow {
  code: string;
  name: string;
  fullName: string;
  actingCode: string;
}
