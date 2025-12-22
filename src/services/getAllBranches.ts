import { findAllBranches } from "../database/queries";
import { BranchModel } from "../utils/types/soa";

export const getAllBranches = async (): Promise<BranchModel[]> => {
  return await findAllBranches();
};
