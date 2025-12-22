/**
 * Azure Blob Storage Types
 */

export interface StorageFileData {
  fileName: string;
  bytes: Buffer;
  contentType: string;
}

export interface UploadResult {
  url: string;
  blobName: string;
  success: boolean;
}
