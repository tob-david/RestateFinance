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
  virtualAccount?: string;
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
  debitAndCreditNoteNo: string;
  branch: string;
  policyNo: string;
  policyEndNo: string;
  contractNo: string;
  plateNo: string;
  coInFacRefNo: string;
  fireConjunctionPolicy: string;
  lob: string;
  sourceOfBusiness: string;
  accountName: string;
  insuredName: string;
  distributionName: string;
  distributionNameSecond: string;
  qualitateQuaName: string;
  endEffDate: Date;
  endExpDate: Date;
  postDate: Date;
  dueDate: Date;
  aging: string;
  currency: string;
  exchangeRate: number;
  endReason: string;
  actingCode: string;
  totalSumInsured: number;
  grossPremium: number;
  discount: number;
  commission: number;
  ppn: number;
  pph21: number;
  pph23: number;
  cost: number;
  stmp: number;
  netPremium: number;
  netPremiumIdr: number;
  installment: string;
  origAmount: number;
  dcNoteNo?: string;
  classOfBusiness?: string;
  customerCode: string;
  officeCode?: string;
  distributionCode?: string;
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

export const multiBranchCodes = ["DIC", "DIP", "DIG", "DID"];

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

export const column = {
  BRANCH: 0,
  POLICY_NO: 1,
  POL_END_NO: 2,
  CONTRACT_NO: 3,
  PLAT_NO: 4,
  CO_IN_FAC_REF_NO: 5,
  FIRE_CONJUNCTION_POL: 6,
  LOB: 7,
  SOB: 8,
  DC_ACCOUNT_FULL_NAME: 9,
  INSURED_NAME: 10,
  DISTRIBUTION_NAME: 11,
  DISTRIBUTION_NAME2: 12,
  QQ_NAME: 13,
  END_EFF_DATE: 14,
  END_EXP_DATE: 15,
  POST_DATE: 16,
  AGING: 17,
  CURR: 18,
  EXCH_RATE: 19,
  END_REASON: 20,
  ACTING_CODE: 21,
  TSI: 22,
  GP: 23,
  DISC: 24,
  COMM: 25,
  PPN: 26,
  PPH21: 27,
  PPH23: 28,
  COST: 29,
  STMP: 30,
  NETT_PREMIUM: 31,
  INST_NO: 32,
  DUE_DATE: 33,
  DC_NOTE: 34,
  ORIG_AMOUNT: 35,
  DISTRIBUTION_CODE: 36,
};
