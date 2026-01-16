/**
 * Parquet schema definition for SOA data
 */
export const soaParquetSchema = {
  branch: { type: "UTF8" },
  dcNoteNo: { type: "UTF8" },
  debitAndCreditNoteNo: { type: "UTF8" },
  classOfBusiness: { type: "UTF8" },
  insuredName: { type: "UTF8" },
  customerCode: { type: "UTF8" },
  officeCode: { type: "UTF8" },
  aging: { type: "INT32" },
  netPremium: { type: "DOUBLE" },
  netPremiumIdr: { type: "DOUBLE" },
  policyNo: { type: "UTF8" },
} as const;

export type SoaParquetRow = {
  [K in keyof typeof soaParquetSchema]: K extends "aging"
    ? number
    : K extends "netPremium" | "netPremiumIdr"
    ? number
    : string;
};
