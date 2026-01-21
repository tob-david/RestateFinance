export interface IOracleStreamOptions {
  procedureName: string;
  binds: Record<string, any>;
}

export interface ISoaPipelineResult {
  success: boolean;
  duration: string;
}

export interface IPartitionedFile {
  accountCode?: string;
  rowCount: number;
  filePath: string;
}
