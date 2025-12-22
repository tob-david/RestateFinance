export const multiBranchCodes = ["DIC", "DIP", "DIG", "DID"];
export const defaultUserCode = "adm";

export enum SoaProcessingPhase {
  RetrievingCustomerData = "RetrievingCustomerData",
  CheckingSoaHistory = "CheckingSoaHistory",
  GetSoa = "GetSoa",
  GeneratingFiles = "GeneratingFiles",
  UploadingToAzure = "UploadingToAzure",
  SendingEmail = "SendingEmail",
}

export enum SoaProcessingType {
  SOA = 1,
  RL1 = 2,
  RL2 = 3,
  RL3 = 4,
}

export interface SoaProcessingItem {
  customerId: string;
  timePeriod: string;
  processingDate: string;
  batchId: string;
  jobId: string;
  classOfBusiness: string;
  branch: string;
  toDate: number;
  maxRetries: number;
  processingType: SoaProcessingType;
  testMode: boolean;
  skipAgingFilter?: boolean;
  skipDcNoteCheck?: boolean;
}

export interface CustomerModel {
  code: string;
  fullName: string;
  actingCode: string;
  email?: string;
}

export interface BranchModel {
  code: string;
  name: string;
}

export interface SoaReminderModel {
  id?: string;
  cmCode?: string;
  timePeriod?: string;
  officeId?: string;
}

export interface SoaReminderLetterModel {
  id?: string;
  reminderId: string;
  type: string;
  letterNo: string;
  referenceId?: string;
  sentDate: Date;
}

export interface StatementOfAccountModel {
  dcNoteNo: string;
  debitAndCreditNoteNo: string;
  aging: string;
  netPremium: number;
  netPremiumIdr: number;
  policyNo?: string;
  insuredName?: string;
  classOfBusiness?: string;
  branch?: string;
}

export interface FileData {
  fileName: string;
  bytes: Buffer;
  contentType: string;
  isInline?: boolean;
  contentId?: string;
}

export interface EmailTemplateModel {
  name: string;
  asAtDate: Date;
  virtualNumber?: string;
  letterNo?: string;
  letterNoReff?: string;
  totalPremium?: number;
  reminderCount?: string;
  sendDate?: Date;
  sentDate?: Date;
  branch?: string;
}

export interface SoaReminderRecord {
  ID: string;
  CM_CODE: string;
  TIME_PERIOD: string;
  OFFICE_ID: string;
}

export interface ProcessReminderResult {
  processed: boolean;
  remindersSent: number;
  dcNotesPaid: string[];
}

export interface GenerateReminderResult {
  sent: boolean;
  dcNotesPaid: string[];
  letterNo?: string;
}
