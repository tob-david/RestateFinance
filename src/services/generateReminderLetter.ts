import {
  findDcNoteIdsByCustomer,
  fetchSoaFromProcedure,
  insertReminderLetter,
  findCustomerEmails,
  findLatestLetter,
  completePhase,
  insertPhase,
} from "../database/queries";

import { sendReminderEmail } from "./sendReminderEmail";

import { generateLetterNo } from "../utils/report/generators/letterNoGenerator";
import { uploadFile } from "../utils/storage";
import {
  IGenerateReminderResult,
  SoaProcessingPhase,
  ISoaProcessingItem,
  SoaProcessingType,
  ISoaReminderRecord,
  ICustomerModel,
  IBranchModel,
} from "../utils/types/soa";
import { generateSoaExcel } from "../utils/report/generators/generateSoaExcel";
import { generateCollectionPdf } from "../utils/report/soa/soaReport";
import { readSoaParquet } from "../parquet";

interface GenerateReminderLetterParams {
  customer: ICustomerModel;
  branches: IBranchModel[];
  reminder: ISoaReminderRecord;
  item: ISoaProcessingItem;
}

export const generateReminderLetter = async (
  params: GenerateReminderLetterParams,
): Promise<IGenerateReminderResult | null> => {
  const { customer, branches, reminder, item } = params;
  const dateNow = new Date();
  const defaultUser = "adm";

  const branchCode = reminder.officeId || "ALL";
  const branchName =
    branchCode !== "ALL"
      ? branches.find((b) => b.office_code === branchCode)?.name || ""
      : "";

  // Step 1: Get latest reminder letter
  const latestLetter = await findLatestLetter(reminder.id);
  const previousType = latestLetter ? parseInt(latestLetter.type) : -1;

  // Step 2: Validate processing type
  const expectedType = item.processingType - 1;

  // Skip conditions
  if (item.processingType === SoaProcessingType.SOA) {
    console.log(
      `Skipping ${customer.code}: Type is SOA but has existing reminders`,
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
  // const toEmail = emails.length > 0 ? emails.join(",") : "finance@tob-ins.com";
  const toEmail = "gerardus.david@tob-ins.com"; // for development

  // Step 4: Get SOA data (Phase: GetSoa)
  await insertPhase(item.jobId!, SoaProcessingPhase.GetSoa);
  const toDateObj = new Date(item.toDate * 1000);
  const fullName = customer.fullName.replace(/\s+/g, "");

  let soaList = await readSoaParquet(fullName);

  // next using parquet file to get soa data
  // const actingCodes = ["DID", "AGS"].includes(customer.actingCode)
  //   ? customer.fullName
  //   : null;

  // const soaList = await fetchSoaFromProcedure(
  //   branchCode,
  //   item.classOfBusiness,
  //   customer.code,
  //   actingCodes,
  //   toDateObj,
  //   defaultUser,
  // );

  await completePhase(item.jobId!, SoaProcessingPhase.GetSoa);
  if (soaList.length === 0) return null;

  // Step 5: Compare DC Notes (Paid vs Unpaid)
  const existingDcNotes = await findDcNoteIdsByCustomer(customer.code);
  const soaDcNotes = soaList.map((s) => s.debitAndCreditNoteNo);

  const dcNotesPaid = existingDcNotes.filter(
    (dc) => !soaDcNotes.some((soa) => soa.toLowerCase() === dc.toLowerCase()),
  );
  // const dcNotesUnpaid = existingDcNotes.filter((dc) =>
  //   soaDcNotes.some((soa) => soa.toLowerCase() === dc.toLowerCase())
  // );

  // Step 6: Generate Letter Number
  const letterNo = await generateLetterNo(reminderCount.toString(), dateNow);
  // Step 7: Insert Reminder Letter record
  await insertReminderLetter(
    reminder.id,
    reminderCount.toString(),
    letterNo,
    latestLetter ? reminder.id : null,
    dateNow,
  );

  // Step 8: Generate Files (Phase: GeneratingFiles)
  await insertPhase(item.jobId!, SoaProcessingPhase.GeneratingFiles);
  const dateToString = dateNow.toISOString().split("T")[0];

  const excelFile = await generateSoaExcel({
    soaData: soaList,
    customerId: customer.code,
  });

  const pdfFile = await generateCollectionPdf(
    customer.code,
    customer.fullName,
    dateToString,
    customer.virtualAccount || "-",
  );
  await completePhase(item.jobId!, SoaProcessingPhase.GeneratingFiles);

  // Step 9: Upload to Azure (Phase: UploadingToAzure)
  await insertPhase(item.jobId!, SoaProcessingPhase.UploadingToAzure);
  const prefix = `RL${reminderCount}_`;
  await uploadFile(
    { ...excelFile, fileName: `${prefix}${excelFile.fileName}` },
    customer.code,
    "excel",
  );

  await uploadFile(
    { ...pdfFile, fileName: `${prefix}${pdfFile.fileName}` },
    customer.code,
    "pdf",
  );

  await completePhase(item.jobId!, SoaProcessingPhase.UploadingToAzure);

  // Step 10: Send Email (Phase: SendingEmail)
  await insertPhase(item.jobId!, SoaProcessingPhase.SendingEmail);
  const emailResult = await sendReminderEmail({
    customer,
    toEmail,
    reminderType: reminderCount.toString(),
    letterNo,
    previousLetterNo: latestLetter?.letterNo,
    excelFile,
    pdfFile,
    testMode: item.testMode,
  });

  await completePhase(item.jobId!, SoaProcessingPhase.SendingEmail);

  return { sent: emailResult, dcNotesPaid, letterNo };
};
