type ReportFormat = "pdf" | "xlsx" | "html";
type FileFormat = "A4" | "Letter" | "Legal";

export interface IReportOptions {
  format?: FileFormat;
  landscape?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
}

export interface IExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface IExcelSheetData {
  sheetName: string;
  columns: IExcelColumn[];
  rows: Record<string, any>[];
}

export interface IGenerateReportParams {
  template: string;
  data: Record<string, any>;
  format: ReportFormat;
  filename: string;
  options?: IReportOptions;
  excelColumns?: IExcelColumn[];
  excelDataKey?: string;
}

export interface IReportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export interface ISoaFileResult {
  fileName: string;
  contentType: string;
  bytes: Buffer;
}
