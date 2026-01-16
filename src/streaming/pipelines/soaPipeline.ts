import * as path from "path";

import { writeStreamToParquet } from "../writers/parquetStreamWriter";
import { transformSoaStream } from "../transformers";
import { streamSoaData } from "../readers";

import { ISoaPipelineResult } from "../../utils/types/streaming";
import { formatDuration } from "../../utils/formater";

// Run complete SOA pipeline: Oracle → Transform → Parquet → save to local file

export async function generateSoaPipeline(
  asAtDate: Date
): Promise<ISoaPipelineResult> {
  // Start timer
  const startTime = Date.now();
  console.log(`Starting SOA pipeline for ${startTime.toString()}`);

  const dateRequest = asAtDate.toISOString().split("T")[0].replace(/-/g, "");
  const fileName = `soa_${dateRequest}.parquet`;
  const localPath = path.join(process.cwd(), "data", fileName);
  console.log(`Generating SOA for ${dateRequest}`);

  // 1. Create pipeline: Reader → Transformer
  const oracleStream = streamSoaData(asAtDate);
  const transformedStream = transformSoaStream(oracleStream);

  // 2. Write to Parquet
  const { rowCount } = await writeStreamToParquet(transformedStream, localPath);
  console.log(`Wrote ${rowCount} rows to ${localPath}`);

  // End timer
  const endTime = Date.now();
  console.log(`Ending SOA pipeline for ${endTime.toString()}`);

  const duration = formatDuration(endTime - startTime);
  console.log(`Pipeline completed in ${duration}`);

  return {
    success: true,
    rowCount,
    localPath,
    duration,
  };
}
