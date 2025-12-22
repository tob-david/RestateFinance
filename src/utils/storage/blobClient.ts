/**
 * Azure Blob Storage Client
 * Singleton client for Azure Blob Storage operations
 */

import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

let containerClient: ContainerClient | null = null;

/**
 * Get required environment variable or throw error
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get or create singleton Azure Blob container client
 */
export function getContainerClient(): ContainerClient {
  if (containerClient) return containerClient;

  const connectionString = getRequiredEnv("AZURE_STORAGE_CONNECTION_STRING");
  const containerName = getRequiredEnv("AZURE_STORAGE_CONTAINER_NAME");

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(containerName);

  return containerClient;
}
