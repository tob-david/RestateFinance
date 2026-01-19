import { readFileSync } from "fs";
import { join } from "path";

import { generatePdfFromHtml } from "../generators/pdfGenerator";
import { renderTemplate } from "../core/templateEngine";

import { ISoaFileResult } from "../../types/report";
import { CONTENT_TYPES } from "../constants";

const TEMPLATES_DIR = join(__dirname, "../templates");

function loadTemplate(name: string): string {
  return readFileSync(join(TEMPLATES_DIR, `${name}.html`), "utf-8");
}

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatIndonesianDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `Jakarta, ${day} ${month} ${year}`;
}

export async function generateCollectionPdf(
  customerId: string,
  customerName: string,
  statementDate: string,
  virtualAccount: string,
): Promise<ISoaFileResult> {
  const fileName = `Collection_Letter_${customerId}.pdf`;

  const template = loadTemplate("collectionPdf");
  const html = await renderTemplate(template, {
    customerId,
    customerName,
    statementDate,
    virtualAccount: virtualAccount || "-",
    letterDate: formatIndonesianDate(new Date()),
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
