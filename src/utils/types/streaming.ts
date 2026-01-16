export interface IOracleStreamOptions {
  procedureName: string;
  binds: Record<string, any>;
}

export interface ISoaPipelineResult {
  success: boolean;
  rowCount: number;
  localPath: string;
  duration: string;
}
