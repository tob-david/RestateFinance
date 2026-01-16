import { writeSoaParquet } from "../../parquet/writers/soaParquetWriter";
import { IStatementOfAccountModel } from "../../utils/types/soa";
import * as path from "path";
/**
 * Collect stream and write to Parquet
 */
// export async function writeStreamToParquet(
//   source: AsyncIterable<IStatementOfAccountModel>,
//   outputPath: string
// ): Promise<{ rowCount: number; filePath: string }> {
//   const rows: IStatementOfAccountModel[] = [];
//   for await (const row of source) {
//     rows.push(row);
//   }
//   await writeSoaParquet(rows, outputPath);
//   return { rowCount: rows.length, filePath: outputPath };
// }

export interface IPartitionedFile {
  accountCode: string;
  rowCount: number;
  filePath: string;
}

export async function writeStreamToParquet(
  source: AsyncIterable<IStatementOfAccountModel>,
  outputDirectory: string
): Promise<{ rowCount: number; filePath: string }> {
  const dataByAccount = new Map<string, IStatementOfAccountModel[]>();

  for await (const row of source) {
    const accountCode = row.customerCode || "UNKNOWN";
    if (!dataByAccount.has(accountCode)) {
      dataByAccount.set(accountCode, []);
    }
    dataByAccount.get(accountCode)!.push(row);
  }

  const files: IPartitionedFile[] = [];
  let totalRowCount = 0;

  for (const [accountCode, rows] of dataByAccount) {
    const fileName = `soa_${accountCode}.parquet`;
    const filePath = path.join(outputDirectory, fileName);

    await writeSoaParquet(rows, filePath);

    files.push({
      accountCode,
      rowCount: rows.length,
      filePath,
    });

    totalRowCount += rows.length;
    console.log(`Wrote ${rows.length} rows for account ${accountCode}`);
  }

  return { rowCount: totalRowCount, filePath: outputDirectory };
}
