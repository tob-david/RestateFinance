import { findReminderByCustomerAndPeriod } from "../database/queries";
import {
  IProcessReminderResult,
  ISoaReminderRecord,
  ISoaProcessingItem,
  ICustomerModel,
  IBranchModel,
} from "../utils/types/soa";
import { SoaProcessingType } from "../utils/types";
import { generateReminderLetter } from "./generateReminderLetter";

export const processReminderLetter = async (
  customer: ICustomerModel,
  branches: IBranchModel[],
  item: ISoaProcessingItem
): Promise<IProcessReminderResult> => {
  console.log(
    `Starting reminder letter processing for ${customer.code}, Type: ${
      SoaProcessingType[item.processingType]
    }`
  );

  // Step 1: Get existing reminders from database
  const reminders = (await findReminderByCustomerAndPeriod(
    customer.code,
    item.timePeriod
  )) as ISoaReminderRecord[];

  if (!reminders || reminders.length === 0) {
    console.log(`Skipping ${customer.code}: No previous reminder records`);
    return { processed: false, remindersSent: 0, dcNotesPaid: [] };
  }

  const allDcNotesPaid: string[] = [];
  console.log(`Processing ${allDcNotesPaid}`);

  let remindersSent = 0;
  console.log(`Processing reminders sent ${remindersSent}`);

  // Step 2: Loop through each reminder
  for (const reminder of reminders) {
    const result = await generateReminderLetter(
      customer,
      branches,
      reminder,
      item
    );

    if (result) {
      if (result.sent) remindersSent++;
      if (result.dcNotesPaid?.length > 0) {
        allDcNotesPaid.push(...result.dcNotesPaid);
      }
    }
  }
  return { processed: true, remindersSent, dcNotesPaid: allDcNotesPaid };
};
