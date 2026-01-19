import { CONTENT_TYPES } from "../constants";
import {
  IGenerateReportParams,
  IReportResult,
  IExcelColumn,
} from "../../types";
import { excelGenerate } from "./excelGenerator";
import { renderTemplate } from "../core";
import { generatePdf } from ".";

export async function generateReport(
  params: IGenerateReportParams,
): Promise<IReportResult> {
  const {
    template,
    data,
    format,
    filename,
    options,
    excelColumns,
    excelDataKey,
  } = params;

  switch (format) {
    case "pdf": {
      const buffer = await generatePdf(template, data, options);
      return {
        buffer,
        filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
        contentType: CONTENT_TYPES.PDF,
      };
    }

    case "xlsx": {
      const excelData = excelDataKey
        ? (data[excelDataKey] as Record<string, any>[])
        : [data];

      let buffer: Buffer;
      if (excelColumns && excelColumns.length > 0) {
        buffer = excelGenerate([
          {
            sheetName: "Report",
            columns: excelColumns,
            rows: excelData,
          },
        ]);
      } else {
        // Auto-generate columns
        const columns: IExcelColumn[] = Object.keys(excelData[0] || {}).map(
          (key) => ({
            header:
              key.charAt(0).toUpperCase() +
              key.slice(1).replace(/([A-Z])/g, " $1"),
            key: key,
            width: 15,
          }),
        );
        buffer = excelGenerate([
          { sheetName: "Report", columns, rows: excelData },
        ]);
      }

      return {
        buffer,
        filename: filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`,
        contentType: CONTENT_TYPES.XLSX,
      };
    }

    case "html": {
      const html = await renderTemplate(template, data);
      return {
        buffer: Buffer.from(html, "utf-8"),
        filename: filename.endsWith(".html") ? filename : `${filename}.html`,
        contentType: CONTENT_TYPES.HTML,
      };
    }

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
