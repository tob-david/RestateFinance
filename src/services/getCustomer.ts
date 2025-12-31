import { SoaProcessingPhase, ICustomerModel } from "../utils/types/soa";
import {
  findCustomerById,
  completePhase,
  insertPhase,
} from "../database/queries";

export const getCustomerInfo = async (
  jobId: string,
  customerId: string
): Promise<ICustomerModel | null> => {
  await insertPhase(jobId, SoaProcessingPhase.RetrievingCustomerData);
  const customer = await findCustomerById(customerId);
  await completePhase(jobId, SoaProcessingPhase.RetrievingCustomerData);

  return customer;
};
