export interface IOracleStreamOptions {
  procedureName: string;
  binds: Record<string, any>;
}

export interface ISoaPipelineResult {
  success: boolean;
  duration: string;
}

export interface IPartitionedFile {
  distributionCode?: string;
  rowCount: number;
  filePath: string;
}
