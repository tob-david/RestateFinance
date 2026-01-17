export const CONTENT_TYPES = {
  PDF: "application/pdf",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  XLS: "application/vnd.ms-excel",
  HTML: "text/html",
  CSV: "text/csv",
  OCTET_STREAM: "application/octet-stream",
} as const;

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

export function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return CONTENT_TYPES.PDF;
    case "xlsx":
      return CONTENT_TYPES.XLSX;
    case "xls":
      return CONTENT_TYPES.XLS;
    case "html":
      return CONTENT_TYPES.HTML;
    case "csv":
      return CONTENT_TYPES.CSV;
    default:
      return CONTENT_TYPES.OCTET_STREAM;
  }
}
