import {
  findDcNoteIdsByCustomer,
  fetchSoaFromProcedure,
  completePhase,
  insertPhase,
} from "../database/queries";

import {
  IStatementOfAccountModel,
  SoaProcessingPhase,
  ICustomerModel,
} from "../utils/types/soa";

import { uploadFile } from "../utils/storage";
import { generateSoaExcel } from "../utils/report/generators";
import { generateCollectionPdf } from "../utils/report/soa/soaReport";
import { readSoaParquet } from "../parquet/readers";

export const generateSoa = async (
  branchCode: string,
  customer: ICustomerModel,
  classOfBusiness: string,
  dateNow: Date,
  toDate: number,
  jobId: string,
  testMode: boolean,
  skipAgingFilter: boolean = false,
  skipDcNoteCheck: boolean = false,
): Promise<IStatementOfAccountModel[] | null> => {
  console.log(
    `GenerateSOA started for ${customer.code}, Branch: ${branchCode}, COB: ${classOfBusiness}`,
  );

  // ========== Phase: Get SOA Data ==========
  await insertPhase(jobId, SoaProcessingPhase.GetSoa);
  console.log(`Getting SOA data for ${customer.code}`);
  const fullName = customer.fullName.replace(/\s+/g, "");

  const toDateObj = new Date(toDate * 1000);
  let soaList = await readSoaParquet(fullName);

  // const toDateObj = new Date(toDate * 1000);
  // const accountName = ["DID", "AGS"].includes(customer.actingCode)
  //   ? customer.fullName
  //   : null;

  // let soaList = await fetchSoaFromProcedure(
  //   branchCode,
  //   classOfBusiness,
  //   customer.code,
  //   accountName,
  //   toDateObj,
  //   "adm",
  // );

  // Filter by aging >= 60 days (skip if skipAgingFilter is true)
  if (!skipAgingFilter) {
    soaList = soaList.filter((soa) => parseInt(soa.aging) >= 60);
    console.log(
      `Filtered to ${soaList.length} SOA records with aging >= 60 days`,
    );
  } else {
    console.log(
      `Skip aging filter enabled - keeping all ${soaList.length} records`,
    );
  }

  await completePhase(jobId, SoaProcessingPhase.GetSoa);

  if (soaList.length === 0) {
    console.log(`Skipping ${customer.code}: No SOA records found`);
    return null;
  }

  // Extract DC notes
  const dcNotes = soaList
    .flatMap((soa) => soa.debitAndCreditNoteNo?.split(",") || [])
    .filter((note, idx, arr) => arr.indexOf(note) === idx);

  console.log(`Extracted ${dcNotes.length} unique DC notes`);

  // Get existing DC notes from previous reminders
  const existingDcNotes = await findDcNoteIdsByCustomer(customer.code);
  console.log(`Found ${existingDcNotes.length} DC notes in previous reminders`);

  // Filter out already processed DC notes (skip if skipDcNoteCheck is true)
  let newDcNotes: string[];
  if (!skipDcNoteCheck) {
    newDcNotes = dcNotes.filter(
      (note) =>
        !existingDcNotes.some(
          (existing) => existing.toLowerCase() === note.toLowerCase(),
        ),
    );

    if (newDcNotes.length === 0) {
      console.log(`Skipping ${customer.code}: All DC notes already processed`);
      return null;
    }
    console.log(`Processing ${newDcNotes.length} new DC notes (filtered)`);
  } else {
    newDcNotes = dcNotes;
    console.log(
      `Skip DC note check enabled - processing all ${newDcNotes.length} DC notes`,
    );
  }

  // Filter soaList to only include new DC notes
  soaList = soaList.filter((soa) =>
    newDcNotes.includes(soa.debitAndCreditNoteNo),
  );

  if (soaList.length === 0) {
    console.log(
      `Skipping ${customer.code}: No matching SOA records after filter`,
    );
    return null;
  }

  // Phase complete - data ready for file generation
  console.log(`SOA data ready for ${customer.code}: ${soaList.length} records`);

  // ========== Phase: Generate Files ==========
  await insertPhase(jobId, SoaProcessingPhase.GeneratingFiles);
  console.log(`Generating Excel and PDF files for ${customer.code}`);

  const dateStr = toDateObj.toISOString().split("T")[0];

  // Generate Excel file
  const excelFile = await generateSoaExcel({
    soaData: soaList,
    customerId: customer.code,
  });
  console.log(`Generated Excel: ${excelFile.fileName}`);

  // Generate PDF file
  const pdfFile = await generateCollectionPdf(
    customer.code,
    customer.fullName,
    dateStr,
    customer.virtualAccount || "-",
  );
  console.log(`Generated PDF: ${pdfFile.fileName}`);

  await completePhase(jobId, SoaProcessingPhase.GeneratingFiles);

  // ========== Phase: Upload to Azure ==========
  await insertPhase(jobId, SoaProcessingPhase.UploadingToAzure);
  console.log(`Uploading files to Azure for ${customer.code}`);

  const excelUploadResult = await uploadFile(excelFile, customer.code, "excel");
  console.log(`Excel uploaded: ${excelUploadResult.blobName}`);

  const pdfUploadResult = await uploadFile(pdfFile, customer.code, "pdf");
  console.log(`PDF uploaded: ${pdfUploadResult.blobName}`);

  await completePhase(jobId, SoaProcessingPhase.UploadingToAzure);
  console.log(`Files uploaded successfully for ${customer.code}`);

  // Return SOA data for reminder creation

  return soaList;
};
