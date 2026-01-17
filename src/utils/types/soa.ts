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
  office_code: string;
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
  // DC Note identification
  debitAndCreditNoteNo: string; // DC_NOTE

  // Branch and Policy info
  branch: string; // BRANCH
  policyNo: string; // POLICY_NO
  policyEndNo: string; // POL_END_NO
  contractNo: string; // CONTRACT_NO
  plateNo: string; // PLAT_NO
  coInFacRefNo: string; // CO_IN_FAC_REF_NO (Batch No)
  fireConjunctionPolicy: string; // FIRE_CONJUNCTION_POL

  // Business classification
  lob: string; // LOB
  sourceOfBusiness: string; // SOB

  // Account and customer info
  accountName: string; // DC_ACCOUNT_FULL_NAME
  insuredName: string; // INSURED_NAME
  distributionName: string; // DISTRIBUTION_NAME
  distributionNameSecond: string; // DISTRIBUTION_NAME2
  qualitateQuaName: string; // QQ_NAME

  // Dates
  endEffDate: Date; // END_EFF_DATE
  endExpDate: Date; // END_EXP_DATE
  postDate: Date; // POST_DATE
  dueDate: Date; // DUE_DATE

  // Aging and currency
  aging: string; // AGING
  currency: string; // CURR
  exchangeRate: number; // EXCH_RATE

  // Endorsement info
  endReason: string; // END_REASON
  actingCode: string; // ACTING_CODE

  // Financial values
  totalSumInsured: number; // TSI
  grossPremium: number; // GP
  discount: number; // DISC
  commission: number; // COMM
  ppn: number; // PPN
  pph21: number; // PPH21
  pph23: number; // PPH23
  cost: number; // COST
  stmp: number; // STMP
  netPremium: number; // NETT_PREMIUM
  netPremiumIdr: number; // Calculated: NetPremium * ExchangeRate

  // Installment info
  installment: string; // INST_NO
  origAmount: number; // ORIG_AMOUNT

  // Legacy fields for compatibility
  dcNoteNo?: string;
  classOfBusiness?: string;
  customerCode?: string;
  officeCode?: string;
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
  id: string;
  customerCode: string;
  timePeriod: string;
  officeId: string;
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
