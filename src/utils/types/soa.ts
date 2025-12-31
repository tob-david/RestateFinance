import { IAccountRow } from "./customer";

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

export interface ISoaProcessingItem {
  customerId: string;
  timePeriod: string;
  processingDate: string;
  batchId: string;
  jobId?: string;
  classOfBusiness: string;
  branch: string;
  toDate: number;
  maxRetries: number;
  processingType: SoaProcessingType;
  testMode: boolean;
  skipAgingFilter?: boolean;
  skipDcNoteCheck?: boolean;
}

export interface ICustomerModel {
  code: string;
  fullName: string;
  actingCode: string;
  email?: string;
}

export interface IBranchModel {
  code: string;
  name: string;
}

export interface ISoaReminderModel {
  id?: string;
  cmCode?: string;
  timePeriod?: string;
  officeId?: string;
}

export interface ISoaReminderLetterModel {
  id?: string;
  reminderId: string;
  type: string;
  letterNo: string;
  referenceId?: string;
  sentDate: Date;
}

export interface IStatementOfAccountModel {
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

export interface IFileData {
  fileName: string;
  bytes: Buffer;
  contentType: string;
  isInline?: boolean;
  contentId?: string;
}

export interface IEmailTemplateModel {
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

export interface ISoaReminderRecord {
  ID: string;
  CM_CODE: string;
  TIME_PERIOD: string;
  OFFICE_ID: string;
}

export interface IProcessReminderResult {
  processed: boolean;
  remindersSent: number;
  dcNotesPaid: string[];
}

export interface IGenerateReminderResult {
  sent: boolean;
  dcNotesPaid: string[];
  letterNo?: string;
}
