// import { getBrowser } from "./browserManager";
import { renderTemplate } from "./templateEngine";
import { IReportOptions } from "../types/report";
import puppeteer from "puppeteer";

/**
 * Generate PDF from HTML string
 */
export async function generatePdfFromHtml(
  html: string,
  options?: IReportOptions
): Promise<Buffer> {
  // const browser = await getBrowser();
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  let page;

  try {
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: options?.format ?? "A4",
      landscape: options?.landscape ?? false,
      margin: options?.margin ?? {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      printBackground: true,
      displayHeaderFooter: options?.displayHeaderFooter ?? false,
      headerTemplate: options?.headerTemplate,
      footerTemplate: options?.footerTemplate,
    });

    return Buffer.from(pdfBuffer);
  } catch (error: any) {
    console.error("PDF generation failed:", error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (page) await page.close();
  }
}

/**
 * Generate PDF from template and data
 */
export async function generatePdf(
  template: string,
  data: Record<string, any>,
  options?: IReportOptions
): Promise<Buffer> {
  const html = await renderTemplate(template, data);
  return generatePdfFromHtml(html, options);
}
