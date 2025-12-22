export const formatUUID = (uuid: string) => {
  return uuid.replace(/-/g, "").toUpperCase();
};

export const uuidToRaw = (uuid: string) => {
  return Buffer.from(uuid.replace(/-/g, ""), "hex");
};
