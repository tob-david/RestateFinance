// Browser Management
export { getBrowser, closeBrowser } from "./browserManager";

// Template Engine
export { renderTemplate } from "./templateEngine";

// PDF Generation
export { generatePdf, generatePdfFromHtml } from "./pdfGenerator";

// Excel Generation
export { generateExcel, generateSimpleExcel } from "./excelGenerator";

// Report Generation (Unified Interface)
export { generateReport } from "./reportGenerator";

// SOA Reports
export { generateSoaExcel, generateCollectionPdf } from "./soaReport";

// SOA Email Template
export { generateSoaEmailHtml, type SoaEmailData } from "./soaEmail";

// Reminder Email Templates
export {
  generateReminderEmailHtml,
  generateRL1EmailHtml,
  generateRL2EmailHtml,
  generateRL3EmailHtml,
  getReminderEmailSubject,
  type ReminderEmailData,
} from "./reminderEmail";

// Utilities & Constants
export { CONTENT_TYPES, bufferToBase64, getContentType } from "./constants";
