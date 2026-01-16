import { IEmailAttachment, IEmailMessage } from "./email";
import { SoaProcessingType } from "./soa";
import { IOracleStreamOptions } from "./streaming";
import { ISoaParquetFilter } from "./parquet";

import {
  IGenerateReminderResult,
  IProcessReminderResult,
  ISoaProcessingItem,
  ICustomerModel,
  IBranchModel,
  ISoaReminderModel,
  ISoaReminderLetterModel,
  IStatementOfAccountModel,
  IEmailTemplateModel,
  ISoaReminderRecord,
  IFileData,
} from "./soa";

import { IAccountRow, IGetSoaJob, IGetSoaBatchStatus } from "./customer";
import {
  IGenerateReportParams,
  IExcelSheetData,
  IReportOptions,
  ISoaFileResult,
  IReportResult,
  IExcelColumn,
} from "./report";

export type {
  IGenerateReportParams,
  IExcelSheetData,
  IReportOptions,
  ISoaFileResult,
  IReportResult,
  IExcelColumn,
  IEmailAttachment,
  IEmailMessage,
  IGetSoaBatchStatus,
  IAccountRow,
  IGetSoaJob,
  IGenerateReminderResult,
  IProcessReminderResult,
  ISoaProcessingItem,
  ICustomerModel,
  IBranchModel,
  ISoaReminderModel,
  ISoaReminderLetterModel,
  IStatementOfAccountModel,
  IEmailTemplateModel,
  ISoaReminderRecord,
  IFileData,
  IOracleStreamOptions,
  ISoaParquetFilter,
};

export { SoaProcessingType };
