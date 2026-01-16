import * as parquet from "parquet-wasm";

export const {
  readParquet,
  writeParquet,
  ParquetFile,
  Table,
  RecordBatch,
  Schema,
  Compression,
  WriterPropertiesBuilder,
} = parquet;

export { parquet };
