export type ReportFormat = "pdf" | "xlsx" | "html";

export interface ReportOptions {
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
}

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelSheetData {
  sheetName: string;
  columns: ExcelColumn[];
  rows: Record<string, any>[];
}

export interface GenerateReportParams {
  template: string;
  data: Record<string, any>;
  format: ReportFormat;
  filename: string;
  options?: ReportOptions;
  excelColumns?: ExcelColumn[];
  excelDataKey?: string;
}

export interface ReportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export interface SoaFileResult {
  fileName: string;
  contentType: string;
  bytes: Buffer;
}
