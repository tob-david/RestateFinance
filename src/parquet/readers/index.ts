import { tableFromIPC } from "apache-arrow";
import * as path from "path";
import * as fs from "fs";

import { ISoaReadOptions } from "../../utils/types/parquet";
import { IStatementOfAccountModel } from "../../utils/types";
import { readParquet } from "../../utils/parquet";

/**
 * Read SOA data from Parquet file
 * Parameters match fetchSoaFromProcedure for consistency
 */
export async function readSoaParquet(
  officeCode: string,
  classOfBusiness: string,
  accountCode: string,
  accountName: string | null,
  toDate: Date,
  userCode: string,
): Promise<IStatementOfAccountModel[]> {
  // Use accountName (customer full name) for filename if provided
  const sanitizedName = accountCode.replace(/[<>:"/\\|?*]/g, "_").trim();
  const fileName = `soa_${sanitizedName}.parquet`;
  const filePath = path.join(process.cwd(), "data", fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`Parquet file not found: ${filePath}`);
    return [];
  }

  const buffer = fs.readFileSync(filePath);
  const table = readParquet(new Uint8Array(buffer));

  let rows = tableToArray(table) as IStatementOfAccountModel[];

  // Apply filters (same logic as Oracle procedure)
  rows = rows.filter((row) => {
    // Filter by office code
    if (officeCode !== "ALL" && row.officeCode !== officeCode) {
      return false;
    }

    // Filter by class of business
    if (classOfBusiness !== "ALL" && row.classOfBusiness !== classOfBusiness) {
      return false;
    }

    return true;
  });

  return rows;
}

function tableToArray(table: any): any[] {
  // 1. Convert parquet-wasm Table → IPC Stream
  const ipcStream = table.intoIPCStream();

  // 2. Convert IPC Stream → Apache Arrow Table
  const arrowTable = tableFromIPC(ipcStream);

  // 3. Convert Arrow Table → Array of objects
  return arrowTable.toArray().map((row: any) => row.toJSON());
}
