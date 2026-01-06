// import {
//   findAllBranches,
//   findJobByBatchAndCustomer,
//   findReminderByCustomerAndPeriod,
//   incrementFailedCount,
//   incrementProcessedCount,
//   insertJob,
//   updateJobStatus,
// } from "../database/queries";
// import { createSoaReminder } from "../services/createSoaReminder";
// import { getAllBranches } from "../services/getAllBranches";
// import { getCustomerInfo } from "../services/getCustomer";
// import { isMultiBranchCustomer } from "../services/multiBranchCustomer";
// import { processReminderLetter } from "../services/processReminderLetter";
// import { sendSoaEmail } from "../services/sendSoaEmail";
// import { shouldProcessReminder } from "../services/shouldProcessReminder";
// import { singleBranch } from "../services/singleBranch";
// import { downloadSoaFiles } from "../utils/storage/fileOperations";
// import {
//   IAccountRow,
//   IGetSoaJob,
//   ISoaProcessingItem,
//   IStatementOfAccountModel,
//   SoaProcessingType,
// } from "../utils/types";
// import * as restate from "@restatedev/restate-sdk";
// import { createHash } from "crypto";

// export const soaProcessHandler = restate.service({
//   name: "SoaProcessHandler",
//   handlers: {
//     processCustomer: async (
//       ctx: restate.Context,
//       params: ISoaProcessingItem
//     ) => {
//       const {
//         customerId,
//         batchId,
//         timePeriod,
//         processingDate,
//         classOfBusiness,
//         branch,
//         toDate,
//         maxRetries,
//         processingType,
//         testMode,
//         skipAgingFilter,
//         skipDcNoteCheck,
//       } = params;

//       // Step 3a: Get or Create Job
//       const { jobId, retryAttempt } = await ctx.run(
//         `getOrCreateJob-${customerId}`,
//         async () => {
//           const existingJob = (await findJobByBatchAndCustomer(
//             batchId,
//             customerId
//           )) as IGetSoaJob | null;

//           const newJobId = createHash("md5")
//             .update(batchId + customerId)
//             .digest("hex")
//             .toString()
//             .toUpperCase();

//           const retry = existingJob?.retry_attempt ?? 0;

//           if (!existingJob) {
//             await insertJob(newJobId, batchId, customerId);
//           }

//           return { jobId: newJobId, retryAttempt: retry };
//         }
//       );

//       // Step 3b: Create Processing Item
//       const processingItem: ISoaProcessingItem = {
//         customerId,
//         timePeriod,
//         processingDate,
//         batchId,
//         jobId,
//         classOfBusiness,
//         branch,
//         toDate,
//         maxRetries,
//         processingType,
//         testMode,
//         skipAgingFilter,
//         skipDcNoteCheck,
//       };

//       // Step 3c: Process SOA dengan retry logic
//       let currentRetryAttempt = retryAttempt;
//       let success = false;

//       while (currentRetryAttempt <= maxRetries && !success) {
//         try {
//           // Update status to Processing
//           await ctx.run(
//             `UpdateProcessing-${customerId}-${currentRetryAttempt}`,
//             async () => {
//               await updateJobStatus(jobId, "Processing");
//             }
//           );

//           // Get customer info with checkpoint
//           const customerData = await ctx.run(
//             `GetCustomer-${customerId}`,
//             async () => {
//               return await getCustomerInfo(jobId, customerId);
//             }
//           );

//           if (!customerData) {
//             throw new Error(`Customer ${customerId} not found`);
//           }

//           //========= Checksoa history to dicide: new SOA or Reminder Letter
//           const existingReminders = await ctx.run(
//             `CheckSoaHistory-${customerId}`,
//             async () => {
//               const reminders = await findReminderByCustomerAndPeriod(
//                 customerData.code,
//                 processingItem.timePeriod
//               );
//               console.log(
//                 `Found ${reminders.length} existing reminders for ${customerId}`
//               );
//               return reminders;
//             }
//           );

//           const hasExistingReminders = existingReminders.length > 0;
//           const shouldDoReminder = shouldProcessReminder(
//             hasExistingReminders,
//             processingItem.processingType
//           );

//           ctx.console.log(
//             `Decision for ${customerId}: ${
//               shouldDoReminder ? "REMINDER LETTER" : "NEW SOA"
//             } (hasReminders=${hasExistingReminders}, type=${
//               SoaProcessingType[processingItem.processingType]
//             })`
//           );

//           if (shouldDoReminder) {
//             // ========== PROCESS REMINDER LETTER ==========
//             const branchesForReminder = await ctx.run(
//               `GetBranchesForReminder-${customerId}`,
//               async () => {
//                 return await findAllBranches();
//               }
//             );

//             await ctx.run(`ProcessReminder-${customerId}`, async () => {
//               const result = await processReminderLetter(
//                 customerData,
//                 branchesForReminder,
//                 processingItem
//               );
//               console.log(
//                 `Reminder processing result for ${customerId}: sent=${result.remindersSent}, dcNotesPaid=${result.dcNotesPaid.length}`
//               );
//               return result;
//             });
//           } else {
//             // ========== PROCESS NEW SOA ==========
//             if (isMultiBranchCustomer(customerData.actingCode)) {
//               // Multi-branch: Get branches and process each with checkpoint
//               const branches = await ctx.run(
//                 `GetBranches-${customerId}`,
//                 async () => {
//                   return await getAllBranches();
//                 }
//               );

//               ctx.console.log(
//                 `Processing ${branches.length} branches for ${customerId}`
//               );

//               // Process each branch with separate checkpoint
//               for (const branch of branches) {
//                 const branchResult = await ctx.run(
//                   `Branch-${customerId}-${branch.code}`,
//                   async () => {
//                     const result = await singleBranch(
//                       branch.code,
//                       customerData,
//                       processingItem
//                     );
//                     console.log(
//                       `Branch ${branch.code}: processed=${result.processed}, records=${result.recordCount}`
//                     );
//                     return result;
//                   }
//                 );

//                 // Create reminder in separate checkpoint if SOA data exists
//                 if (branchResult.soaData && branchResult.soaData.length > 0) {
//                   await ctx.run(
//                     `CreateReminder-${customerId}-${branch.code}`,
//                     async () => {
//                       const reminderId = await createSoaReminder(
//                         customerData,
//                         processingItem.timePeriod,
//                         branch.code,
//                         branchResult.soaData as IStatementOfAccountModel[]
//                       );
//                       console.log(
//                         `Created reminder ${reminderId} for ${customerId} branch ${branch.code}`
//                       );
//                       return reminderId;
//                     }
//                   );
//                 }
//               }
//             } else {
//               // Single branch: process directly
//               const singleResult = await ctx.run(
//                 `SingleBranch-${customerId}`,
//                 async () => {
//                   const result = await singleBranch(
//                     processingItem.branch,
//                     customerData,
//                     processingItem
//                   );
//                   console.log(
//                     `Single branch: processed=${result.processed}, records=${result.recordCount}`
//                   );
//                   return result;
//                 }
//               );

//               // Create reminder in separate checkpoint if SOA data exists
//               if (singleResult.soaData && singleResult.soaData.length > 0) {
//                 await ctx.run(`CreateReminder-${customerId}`, async () => {
//                   const reminderId = await createSoaReminder(
//                     customerData,
//                     processingItem.timePeriod,
//                     processingItem.branch,
//                     singleResult.soaData as IStatementOfAccountModel[]
//                   );
//                   console.log(
//                     `Created reminder ${reminderId} for ${customerId}`
//                   );
//                   return reminderId;
//                 });
//               }
//             }

//             // ✅ SendEmail - ONLY for NEW SOA (not for reminder letters)
//             await ctx.run(`SendEmail-${customerId}`, async () => {
//               const dateStr = new Date().toISOString().split("T")[0];
//               const excelFileName = `SOA_${customerId}_${dateStr}.xlsx`;
//               const pdfFileName = `Collection_${customerId}_${dateStr}.pdf`;

//               try {
//                 // Download files from Azure
//                 const { excelBuffer, pdfBuffer } = await downloadSoaFiles(
//                   customerId,
//                   excelFileName,
//                   pdfFileName
//                 );

//                 // Create FileData objects for email attachment
//                 const excelFile = {
//                   fileName: excelFileName,
//                   bytes: excelBuffer,
//                   contentType:
//                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//                 };

//                 const pdfFile = {
//                   fileName: pdfFileName,
//                   bytes: pdfBuffer,
//                   contentType: "application/pdf",
//                 };

//                 // Send email with dummy email for testing
//                 const customerEmail = "gerardus.david@tob-ins.com";
//                 await sendSoaEmail(
//                   customerData,
//                   customerEmail,
//                   excelFile,
//                   pdfFile,
//                   processingItem.testMode,
//                   jobId
//                 );

//                 console.log(`SOA Email sent for ${customerId}`);
//                 return { sent: true };
//               } catch (error: any) {
//                 console.log(
//                   `No files to send for ${customerId}, skipping email: ${error.message}`
//                 );
//                 return { sent: false, reason: error.message };
//               }
//             });

//             // ========== REMINDER LOOP (RL1, RL2, RL3) ==========
//             // Interval: 2 menit untuk testing, 2 minggu untuk production
//             const reminderInterval = processingItem.testMode
//               ? 2 * 60 * 1000 // 2 menit (120000 ms)
//               : 14 * 24 * 60 * 60 * 1000; // 2 minggu (1209600000 ms)

//             const maxReminders = 3; // RL1, RL2, RL3
//             let currentReminderCount = 0;

//             ctx.console.log(
//               `Starting reminder schedule for ${customerId}, interval: ${
//                 processingItem.testMode ? "2 minutes" : "2 weeks"
//               }`
//             );

//             // Loop untuk kirim reminder
//             while (currentReminderCount < maxReminders) {
//               // Tunggu interval sebelum kirim reminder
//               ctx.console.log(
//                 `Waiting ${reminderInterval}ms before RL${
//                   currentReminderCount + 1
//                 } for ${customerId}`
//               );
//               await ctx.sleep(reminderInterval);

//               // Cek apakah masih ada outstanding (belum dibayar)
//               const outstandingReminders = await ctx.run(
//                 `CheckPayment-${customerId}-RL${currentReminderCount + 1}`,
//                 async () => {
//                   return await findReminderByCustomerAndPeriod(
//                     customerData.code,
//                     processingItem.timePeriod
//                   );
//                 }
//               );

//               // Jika sudah dibayar semua, stop reminder loop
//               if (!outstandingReminders || outstandingReminders.length === 0) {
//                 ctx.console.log(
//                   `All SOA paid for ${customerId}, stopping reminders`
//                 );
//                 break;
//               }

//               // Increment reminder count
//               currentReminderCount++;

//               // Tentukan processing type berdasarkan reminder count
//               const reminderType =
//                 currentReminderCount === 1
//                   ? SoaProcessingType.RL1
//                   : currentReminderCount === 2
//                   ? SoaProcessingType.RL2
//                   : SoaProcessingType.RL3;

//               ctx.console.log(
//                 `Processing RL${currentReminderCount} for ${customerId}`
//               );

//               // Get branches untuk reminder
//               const branchesForReminder = await ctx.run(
//                 `GetBranchesForReminder-${customerId}-RL${currentReminderCount}`,
//                 async () => {
//                   return await findAllBranches();
//                 }
//               );

//               // Buat processing item untuk reminder
//               const reminderProcessingItem: ISoaProcessingItem = {
//                 ...processingItem,
//                 processingType: reminderType,
//               };

//               // Proses reminder letter
//               await ctx.run(
//                 `SendReminder-${customerId}-RL${currentReminderCount}`,
//                 async () => {
//                   const result = await processReminderLetter(
//                     customerData,
//                     branchesForReminder,
//                     reminderProcessingItem
//                   );
//                   console.log(
//                     `RL${currentReminderCount} result for ${customerId}: sent=${result.remindersSent}`
//                   );
//                   return result;
//                 }
//               );

//               ctx.console.log(
//                 `RL${currentReminderCount} completed for ${customerId}`
//               );
//             }

//             ctx.console.log(
//               `Reminder schedule completed for ${customerId}, sent ${currentReminderCount} reminders`
//             );
//           }

//           // Mark as Completed
//           await ctx.run(`MarkCompleted-${customerId}`, async () => {
//             await updateJobStatus(jobId, "Completed");
//             await incrementProcessedCount(batchId);
//           });

//           success = true;
//           ctx.console.log(`Completed: ${customerId}`);
//           ctx.console.log("Process SOA End");
//         } catch (error: any) {
//           currentRetryAttempt++;

//           if (currentRetryAttempt <= maxRetries) {
//             // Retry
//             await ctx.run(
//               `MarkRetrying-${customerId}-${currentRetryAttempt}`,
//               async () => {
//                 await updateJobStatus(
//                   jobId,
//                   "Retrying",
//                   error.message,
//                   currentRetryAttempt
//                 );
//               }
//             );

//             ctx.console.log(
//               `Retrying ${customerId} (${currentRetryAttempt}/${maxRetries})`
//             );

//             // Exponential backoff
//             await ctx.sleep(1000 * currentRetryAttempt);
//           } else {
//             // Failed after all retries
//             await ctx.run(`MarkFailed-${customerId}`, async () => {
//               await updateJobStatus(
//                 jobId,
//                 "Failed",
//                 `Failed after ${maxRetries} attempts: ${error.message}`
//               );
//               await incrementFailedCount(batchId);
//             });

//             ctx.console.log(
//               `Failed: ${customerId} after ${maxRetries} retries`
//             );
//           }
//         }
//       }
//     },
//   },
// });

// export type SoaProcessHandler = typeof soaProcessHandler;
