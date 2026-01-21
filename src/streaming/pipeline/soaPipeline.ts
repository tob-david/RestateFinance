import { transformSoaStream } from "../transform";
import { writeToParquet } from "../write";
import { streamSoaData } from "../read";

import { ISoaPipelineResult } from "../../utils/types/streaming";
import { formatDuration } from "../../utils/formater";

// Run complete SOA pipeline: Oracle → Transform → Parquet by account code → save to local file

export async function generateSoaPipeline(
  asAtDate: Date,
  accountName: string,
): Promise<ISoaPipelineResult> {
  const startTime = Date.now();
  console.log(`Starting SOA pipeline`);

  // Create pipeline: Reader → Transformer
  const oracleStream = streamSoaData(asAtDate, accountName); // get all data from package
  const transformedStream = transformSoaStream(oracleStream); // transform data to SOA model

  // Write to Parquet
  await writeToParquet(transformedStream); // write to parquet file by account code

  const endTime = Date.now();
  const duration = formatDuration(endTime - startTime);

  console.log(`Pipeline completed in ${duration}`);

  return {
    success: true,
    duration,
  };
}
