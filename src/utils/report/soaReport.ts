import { readFileSync } from "fs";
import { join } from "path";

import { generateExcel } from "./excelGenerator";
import { generatePdfFromHtml } from "./pdfGenerator";
import { renderTemplate } from "./templateEngine";
import { ExcelColumn, SoaFileResult } from "../types/report";
import { CONTENT_TYPES } from "./constants";

const TEMPLATES_DIR = join(__dirname, "templates");

/**
 * Load HTML template from file
 */
function loadTemplate(name: string): string {
  return readFileSync(join(TEMPLATES_DIR, `${name}.html`), "utf-8");
}

/**
 * Generate SOA Excel report
 */
export async function generateSoaExcel(
  customerId: string,
  toDate: number,
  branch: string,
  classOfBusiness: string
): Promise<SoaFileResult> {
  const dateStr = new Date(toDate * 1000).toISOString().split("T")[0];
  const fileName = `SOA_${customerId}_${dateStr}.xlsx`;

  // Define SOA columns
  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 5 },
    { header: "Policy No", key: "policyNo", width: 20 },
    { header: "Insured Name", key: "insuredName", width: 30 },
    { header: "Period", key: "period", width: 25 },
    { header: "Premium", key: "premium", width: 15 },
    { header: "Outstanding", key: "outstanding", width: 15 },
    { header: "Due Date", key: "dueDate", width: 12 },
    { header: "Days Overdue", key: "daysOverdue", width: 12 },
  ];

  // TODO: Fetch actual SOA data from database
  // For now, generate placeholder structure
  const rows: Record<string, any>[] = [];

  const buffer = generateExcel([
    {
      sheetName: "Statement of Account",
      columns,
      rows,
    },
  ]);

  return {
    fileName,
    contentType: CONTENT_TYPES.XLSX,
    bytes: buffer,
  };
}

/**
 * Generate Collection PDF report
 */
export async function generateCollectionPdf(
  customerId: string,
  customerName: string,
  statementDate: string,
  virtualAccount: string
): Promise<SoaFileResult> {
  const fileName = `Collection_${customerId}_${statementDate}.pdf`;

  const template = loadTemplate("collectionPdf");
  const html = await renderTemplate(template, {
    customerId,
    customerName,
    statementDate,
    virtualAccount: virtualAccount || "N/A",
  });

  const buffer = await generatePdfFromHtml(html, {
    format: "A4",
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
  });

  return {
    fileName,
    contentType: CONTENT_TYPES.PDF,
    bytes: buffer,
  };
}
