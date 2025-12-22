import { multiBranchCodes } from "../utils/types/soa";

export const isMultiBranchCustomer = (actingCode: string): boolean => {
  return multiBranchCodes.includes(actingCode);
};
