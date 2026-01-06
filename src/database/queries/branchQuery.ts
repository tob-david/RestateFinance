import { executeQuery } from "../config";
import { IBranchModel } from "../../utils/types/soa";

/**
 * Find all branches
 */
export const findAllBranches = async (): Promise<IBranchModel[]> => {
  const sQuery = `SELECT OFFICE_CODE AS "code", CONTACT_PERSON AS "name" FROM MASTER_BRANCH`;
  const result = await executeQuery(sQuery);
  return (result.rows as IBranchModel[]) ?? [];
};
