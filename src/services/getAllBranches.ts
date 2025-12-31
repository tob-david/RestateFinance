import { findAllBranches } from "../database/queries";
import { IBranchModel } from "../utils/types/soa";

export const getAllBranches = async (): Promise<IBranchModel[]> => {
  return await findAllBranches();
};
