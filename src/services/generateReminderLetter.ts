import {
  completePhase,
  findCustomerEmails,
  findDcNoteIdsByCustomer,
  findLatestLetter,
  fetchSoaFromProcedure,
  insertPhase,
  insertReminderLetter,
} from "../database/queries";

import { generateCollectionPdf, generateSoaExcel } from "../utils/report";
import { generateLetterNo } from "../utils/report/letterNoGenerator";

import { uploadFile } from "../utils/storage";
import {
  IGenerateReminderResult,
  SoaProcessingPhase,
  ISoaProcessingItem,
  SoaProcessingType,
  ISoaReminderRecord,
  defaultUserCode,
  ICustomerModel,
  IBranchModel,
} from "../utils/types/soa";

import { sendReminderEmail } from "./sendReminderEmail";

export const generateReminderLetter = async (
  customer: ICustomerModel,
  branches: IBranchModel[],
  reminder: ISoaReminderRecord,
  item: ISoaProcessingItem
): Promise<IGenerateReminderResult | null> => {
  const dateNow = new Date();
  const branchCode = reminder.OFFICE_ID || "ALL";
  const branchName =
    branchCode !== "ALL"
      ? branches.find((b) => b.code === branchCode)?.name || ""
      : "";

  // Step 1: Get latest reminder letter
  const latestLetter = await findLatestLetter(reminder.ID);
  const previousType = latestLetter ? parseInt(latestLetter.TYPE) : -1;

  // Step 2: Validate processing type
  const expectedType = item.processingType - 1;

  // Skip conditions
  if (item.processingType === SoaProcessingType.SOA) {
    console.log(
      `Skipping ${customer.code}: Type is SOA but has existing reminders`
    );
    return null;
  }

  if (previousType >= expectedType) {
    console.log(`Skipping ${customer.code}: Already sent type ${previousType}`);
    return null;
  }

  if (expectedType > 3) {
    console.log(`Skipping ${customer.code}: Expected type exceeds max (3)`);
    return null;
  }

  const reminderCount = expectedType;
  console.log(`Processing reminder type ${reminderCount} for ${customer.code}`);

  // Step 3: Get email recipients
  const emails = await findCustomerEmails(customer.code, branchCode);
  //   const toEmail = emails.length > 0 ? emails.join(",") : "finance@tob-ins.com";
  const toEmail = "gerardus.david@tob-ins.com";

  // Step 4: Get SOA data (Phase: GetSoa)
  await insertPhase(item.jobId!, SoaProcessingPhase.GetSoa);
  const toDateObj = new Date(item.toDate * 1000);
  const accountName = ["DID", "AGS"].includes(customer.actingCode)
    ? customer.fullName
    : null;
  const soaList = await fetchSoaFromProcedure(
    branchCode,
    item.classOfBusiness,
    customer.code,
    accountName,
    toDateObj,
    defaultUserCode
  );

  await completePhase(item.jobId!, SoaProcessingPhase.GetSoa);
  if (soaList.length === 0) return null;

  // Step 5: Compare DC Notes (Paid vs Unpaid)
  const existingDcNotes = await findDcNoteIdsByCustomer(customer.code);
  const soaDcNotes = soaList.map((s) => s.debitAndCreditNoteNo);

  const dcNotesPaid = existingDcNotes.filter(
    (dc) => !soaDcNotes.some((soa) => soa.toLowerCase() === dc.toLowerCase())
  );
  const dcNotesUnpaid = existingDcNotes.filter((dc) =>
    soaDcNotes.some((soa) => soa.toLowerCase() === dc.toLowerCase())
  );

  // Step 6: Generate Letter Number
  const letterNo = await generateLetterNo(reminderCount.toString(), dateNow);
  // Step 7: Insert Reminder Letter record
  await insertReminderLetter(
    reminder.ID,
    reminderCount.toString(),
    letterNo,
    latestLetter ? reminder.ID : null,
    dateNow
  );

  // Step 8: Generate Files (Phase: GeneratingFiles)
  await insertPhase(item.jobId!, SoaProcessingPhase.GeneratingFiles);
  const dateStr = dateNow.toISOString().split("T")[0];

  const excelFile = await generateSoaExcel(
    customer.code,
    item.toDate,
    branchCode,
    item.classOfBusiness
  );
  const pdfFile = await generateCollectionPdf(
    customer.code,
    customer.fullName,
    dateStr,
    ""
  );
  await completePhase(item.jobId!, SoaProcessingPhase.GeneratingFiles);

  // Step 9: Upload to Azure (Phase: UploadingToAzure)
  await insertPhase(item.jobId!, SoaProcessingPhase.UploadingToAzure);
  const prefix = `RL${reminderCount}_`;
  await uploadFile(
    { ...excelFile, fileName: `${prefix}${excelFile.fileName}` },
    customer.code,
    "excel"
  );

  await uploadFile(
    { ...pdfFile, fileName: `${prefix}${pdfFile.fileName}` },
    customer.code,
    "pdf"
  );

  await completePhase(item.jobId!, SoaProcessingPhase.UploadingToAzure);

  // Step 10: Send Email (Phase: SendingEmail)
  await insertPhase(item.jobId!, SoaProcessingPhase.SendingEmail);
  const emailResult = await sendReminderEmail({
    customer,
    toEmail,
    reminderType: reminderCount.toString(),
    letterNo,
    previousLetterNo: latestLetter?.LETTER_NO,
    excelFile,
    pdfFile,
    testMode: item.testMode,
  });

  await completePhase(item.jobId!, SoaProcessingPhase.SendingEmail);
  return { sent: emailResult, dcNotesPaid, letterNo };
};
