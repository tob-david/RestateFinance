import * as XLSX from "xlsx";
import { IExcelColumn, IExcelSheetData } from "../types/report";

/**
 * Generate Excel workbook from sheet data
 */
export function generateExcel(sheets: IExcelSheetData[]): Buffer {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    // Create header row
    const headers = sheet.columns.map((col) => col.header);

    // Create data rows
    const dataRows = sheet.rows.map((row) =>
      sheet.columns.map((col) => row[col.key] ?? "")
    );

    // Combine headers and data
    const worksheetData = [headers, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet["!cols"] = sheet.columns.map((col) => ({
      wch: col.width ?? 15,
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
  }

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buffer);
}

/**
 * Generate simple Excel from array of objects (auto-detect columns)
 */
export function generateSimpleExcel(
  data: Record<string, any>[],
  sheetName: string = "Sheet1"
): Buffer {
  if (data.length === 0) {
    throw new Error("Data array cannot be empty");
  }

  // Auto-generate columns from first row keys
  const columns: IExcelColumn[] = Object.keys(data[0]).map((key) => ({
    header:
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    key: key,
    width: 15,
  }));

  return generateExcel([{ sheetName, columns, rows: data }]);
}
