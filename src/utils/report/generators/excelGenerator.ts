import * as XLSX from "xlsx";
import { IExcelSheetData } from "../../types";
import { NUMBER_FORMATS } from "../constants";

export function excelGenerate(sheets: IExcelSheetData[]): Buffer {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const headers = sheet.columns.map((col) => col.header);
    const dataRows = sheet.rows.map((row) =>
      sheet.columns.map((col) => row[col.key] ?? ""),
    );

    const worksheetData = [headers, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    for (let rowIdx = 1; rowIdx < worksheetData.length; rowIdx++) {
      for (let colIdx = 0; colIdx < sheet.columns.length; colIdx++) {
        const col = sheet.columns[colIdx];
        if (col.format && NUMBER_FORMATS[col.format]) {
          const cellAddress = XLSX.utils.encode_cell({
            r: rowIdx,
            c: colIdx,
          });
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].z = NUMBER_FORMATS[col.format];
          }
        }
      }
    }

    worksheet["!cols"] = sheet.columns.map((col) => ({
      wch: col.width ?? 15,
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
  }

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buffer);
}
