/**
 * SOA Email Logic
 * Functions for generating SOA email
 */

import { readFileSync } from "fs";
import { join } from "path";
import { renderTemplate } from "../core/templateEngine";

const TEMPLATES_DIR = join(__dirname, "templates");

// ========== Types ==========

export interface ISoaEmailData {
  customerName: string;
  asAtDate: Date;
  virtualAccount: string;
}

// ========== Helpers ==========

/**
 * Format date to Indonesian format
 */
function formatDateIndonesian(date: Date): string {
  const months = [
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
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Load HTML template from file
 */
function loadTemplate(name: string): string {
  return readFileSync(join(TEMPLATES_DIR, `${name}.html`), "utf-8");
}

// ========== Template Generator ==========

/**
 * Generate HTML for SOA email
 */
export async function generateSoaEmailHtml(
  data: ISoaEmailData,
): Promise<string> {
  const template = loadTemplate("soaEmail");
  return renderTemplate(template, {
    customerName: data.customerName,
    virtualAccount: data.virtualAccount,
    formattedDate: formatDateIndonesian(data.asAtDate),
  });
}
