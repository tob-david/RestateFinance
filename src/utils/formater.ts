import { SoaProcessingType } from "./types";

export const formatUUID = (uuid: string) => {
  return uuid.replace(/-/g, "").toUpperCase();
};

export const uuidToRaw = (uuid: string) => {
  return Buffer.from(uuid.replace(/-/g, ""), "hex");
};

export const formatDuration = (durationMs: number) => {
  const date = new Date(durationMs);
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
};

export const formatTimePeriod = (date: Date) => {
  return date.toISOString().slice(0, 7);
};

export const formatDateToUnixTimestamp = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

export const parseProcessingType = (type: string) => {
  return SoaProcessingType[type as keyof typeof SoaProcessingType];
};
