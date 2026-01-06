import { generateSoa } from "./generateSoa";

import {
  IStatementOfAccountModel,
  ISoaProcessingItem,
  ICustomerModel,
} from "../utils/types/soa";

export const singleBranch = async (
  branchCode: string,
  customer: ICustomerModel,
  item: ISoaProcessingItem
): Promise<{
  processed: boolean;
  recordCount: number;
  soaData?: IStatementOfAccountModel[];
}> => {
  const dateNow = new Date(item.processingDate);

  console.log(`Processing branch ${branchCode} for customer ${customer.code}`);

  const result = await generateSoa(
    branchCode,
    customer,
    item.classOfBusiness,
    dateNow,
    item.toDate,
    item.jobId || "",
    item.testMode,
    item.skipAgingFilter ?? false,
    item.skipDcNoteCheck ?? false
  );

  // Return SOA data for reminder creation in separate checkpoint
  if (result && result.length > 0) {
    console.log(
      `SOA generated for ${customer.code} branch ${branchCode}: ${result.length} records`
    );

    return {
      processed: true,
      recordCount: result.length,
      soaData: result,
    };
  }

  return {
    processed: result !== null,
    recordCount: result?.length ?? 0,
  };
};
