import { IStatementOfAccountModel, ISoaParquetFilter } from "../../utils/types";
import { readParquet } from "../../utils/parquet";
import * as fs from "fs";
import { tableFromIPC } from "apache-arrow";

export async function readSoaParquet(
  filePath: string,
  filter?: ISoaParquetFilter
): Promise<IStatementOfAccountModel[]> {
  const buffer = fs.readFileSync(filePath);
  const table = readParquet(new Uint8Array(buffer));

  const rows = tableToArray(table) as IStatementOfAccountModel[];

  return rows.filter((row) => {
    if (filter?.customerCode && row.customerCode !== filter.customerCode)
      return false;
    if (filter?.officeCode && row.officeCode !== filter.officeCode)
      return false;
    if (filter?.minAging && parseInt(row.aging) < filter.minAging) return false;
    return true;
  });
}

function tableToArray(table: any): any[] {
  // 1. Convert parquet-wasm Table → IPC Stream
  const ipcStream = table.intoIPCStream();

  // 2. Convert IPC Stream → Apache Arrow Table
  const arrowTable = tableFromIPC(ipcStream);

  // 3. Convert Arrow Table → Array of objects
  return arrowTable.toArray().map((row: any) => row.toJSON());
}
