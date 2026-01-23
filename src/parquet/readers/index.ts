import { tableFromIPC } from "apache-arrow";
import * as path from "path";
import * as fs from "fs";

import { IStatementOfAccountModel } from "../../utils/types";
import { readParquet } from "../../utils/parquet";

export async function readSoaParquet(
  accountName: string,
): Promise<IStatementOfAccountModel[]> {
  const formatedName = accountName.replace(/\s+/g, "");
  const fileName = `soa_${formatedName}.parquet`;
  const filePath = path.join(process.cwd(), "data", fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`Parquet file not found: ${filePath}`);
    return [];
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const table = readParquet(new Uint8Array(buffer));
    let rows = tableToArray(table) as IStatementOfAccountModel[];

    console.log(`[Parquet] Read ${rows.length} raw rows from file`);

    return rows;
  } catch (error: any) {
    console.error(`[Parquet] Read error:`, error.message);
    throw error;
  }
}

function tableToArray(table: any): any[] {
  const ipcStream = table.intoIPCStream();

  const arrowTable = tableFromIPC(ipcStream);

  return arrowTable.toArray().map((row: any) => row.toJSON());
}
