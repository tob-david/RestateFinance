import { IStatementOfAccountModel } from "../../utils/types/soa";
import { IPartitionedFile } from "../../utils/types/streaming";
import { writeSoaParquet } from "../../parquet";
import * as path from "path";

export async function writeToParquet(
  source: AsyncIterable<IStatementOfAccountModel>,
) {
  const datasAccount = new Map<string, IStatementOfAccountModel[]>();

  for await (const row of source) {
    const accountCode = row.customerCode;

    if (!datasAccount.has(accountCode)) {
      datasAccount.set(accountCode, []);
    }

    datasAccount.get(accountCode)!.push(row);
  }

  const files: IPartitionedFile[] = [];
  let totalRowCount = 0;

  for (const [accountCode, rows] of datasAccount) {
    const sanitizedName = accountCode?.replace(/[<>:"/\\|?*]/g, "_").trim();
    const fileName = `soa_${sanitizedName}.parquet`;
    const localPath = path.join(process.cwd(), "data");
    const filePath = path.join(localPath, fileName);

    await writeSoaParquet(rows, filePath);

    files.push({
      accountCode,
      rowCount: rows.length,
      filePath,
    });

    totalRowCount += rows.length;
    console.log(`Wrote ${rows.length} rows for account ${accountCode}`);
  }
}
