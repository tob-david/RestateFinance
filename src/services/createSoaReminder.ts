import { CustomerModel, StatementOfAccountModel } from "../utils/types/soa";
import { insertReminderDetail, insertReminder } from "../database/queries";

export const createSoaReminder = async (
  customer: CustomerModel,
  timePeriod: string,
  branchCode: string,
  soaList: StatementOfAccountModel[]
): Promise<string> => {
  console.log(
    `Creating SOA reminder for ${customer.code}, branch: ${branchCode}`
  );

  // Insert reminder and get ID
  const reminderId = await insertReminder(
    customer.code,
    timePeriod,
    branchCode
  );

  // Insert details for each SOA item
  for (const soa of soaList) {
    await insertReminderDetail(soa.debitAndCreditNoteNo, reminderId, "N");
  }

  console.log(
    `Created reminder ${reminderId} with ${soaList.length} details for ${customer.code}`
  );

  return reminderId;
};
