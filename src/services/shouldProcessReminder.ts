import { SoaProcessingType } from "../utils/types/soa";

export const shouldProcessReminder = (
  hasExistingReminders: boolean,
  processingType: SoaProcessingType
): boolean => {
  if (!hasExistingReminders && processingType === SoaProcessingType.SOA) {
    return false;
  }

  return true;
};
