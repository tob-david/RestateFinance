/**
 * Options for reading SOA data from Parquet files
 * Matches the same parameters as Oracle procedure for consistency
 */
export interface ISoaReadOptions {
  officeCode: string; // Branch code (e.g. "ALL" or specific branch)
  classOfBusiness: string; // Class of business (e.g. "ALL" or specific class)
  accountCode: string; // Customer/Distribution code
  accountName: string | null; // Full customer name (for DID/AGS acting codes)
  toDate: Date; // As-at date for the report
  userCode: string; // User ID (typically "adm")
}
