import { WorkflowContext } from "@restatedev/restate-sdk";
import * as restate from "@restatedev/restate-sdk";
import { createHash, randomUUID } from "crypto";

import {
  incrementProcessedAndCheckComplete,
  findReminderByCustomerAndPeriod,
  findJobByBatchAndCustomer,
  incrementFailedCount,
  updateBatchStatus,
  findAllBranches,
  updateJobStatus,
  insertJob,
} from "../database/queries";

import { processReminderLetter } from "../services/processReminderLetter";
import { shouldProcessReminder } from "../services/shouldProcessReminder";
import { isMultiBranchCustomer } from "../services/multiBranchCustomer";
import { downloadSoaFiles } from "../utils/storage/fileOperations";
import { createSoaReminder } from "../services/createSoaReminder";
import { getAllBranches } from "../services/getAllBranches";
import { getCustomerInfo } from "../services/getCustomer";
import { sendSoaEmail } from "../services/sendSoaEmail";
import { singleBranch } from "../services/singleBranch";

import {
  IStatementOfAccountModel,
  ISoaProcessingItem,
  SoaProcessingType,
  IGetSoaJob,
} from "../utils/types";

export const soaProcessingWorkflow = restate.workflow({
  name: "SoaProcessingWorkflow",
  handlers: {
    run: async (ctx: WorkflowContext, params: ISoaProcessingItem) => {
      const {
        customerId,
        batchId,
        timePeriod,
        processingDate,
        classOfBusiness,
        branch,
        toDate,
        maxRetries,
        processingType,
        testMode,
        skipAgingFilter,
        skipDcNoteCheck,
      } = params;

      ctx.console.log(`Starting SOA for customer: ${customerId}`);

      // Step 1: Get or Create Job
      const { jobId, retryAttempt } = await ctx.run(
        "get-or-create-job",
        async () => {
          const existingJob = (await findJobByBatchAndCustomer(
            batchId,
            customerId,
          )) as IGetSoaJob | null;

          const newJobId = createHash("md5")
            .update(batchId + customerId)
            .digest("hex")
            .toString()
            .toUpperCase();

          const retry = existingJob?.retry_attempt || 0;

          if (!existingJob) {
            await insertJob(newJobId, batchId, customerId);
          }

          return { jobId: newJobId, retryAttempt: retry };
        },
      );

      // Create processing item with jobId
      const processingItem: ISoaProcessingItem = {
        customerId,
        timePeriod,
        processingDate,
        batchId,
        jobId,
        classOfBusiness,
        branch,
        toDate,
        maxRetries,
        processingType,
        testMode,
        skipAgingFilter,
        skipDcNoteCheck,
      };

      // Step 2: Process SOA with retry logic
      let currentRetryAttempt = retryAttempt;
      let success = false;

      while (currentRetryAttempt <= maxRetries && !success) {
        try {
          // Update status to Processing
          await ctx.run("update-processing", async () => {
            await updateJobStatus(jobId, "Processing");
          });

          // Get customer info: displays code, fullname, actingcode and email
          const customerData = await ctx.run("get-customer", async () => {
            return await getCustomerInfo(jobId, customerId);
          });

          if (!customerData) {
            throw new Error(`Customer ${customerId} not found`);
          }

          // Check SOA history to decide: new SOA or Reminder Letter
          const existingReminders = await ctx.run(
            "check-soa-history",
            async () => {
              return await findReminderByCustomerAndPeriod(
                customerData.code,
                processingItem.timePeriod,
              );
            },
          );

          /*
          If processingType == SOA:
            - Not found data in SOA_REMINDER → create New SOA
            - Found data in SOA_REMINDER → create Reminder Letter
            If processingType !== SOA → always create Reminder Letter
          */
          const hasExistingReminders = existingReminders.length > 0;
          const shouldDoReminder = shouldProcessReminder(
            hasExistingReminders,
            processingItem.processingType,
          );

          if (shouldDoReminder) {
            // ========== PROCESS REMINDER LETTER ==========

            // Displays branch code and name
            const branchesForReminder = await ctx.run(
              "get-branches-for-reminder",
              async () => await findAllBranches(),
            );

            /*
            So the processReminderLetter function has parameters:
            customerData (code, fullName, actingCode, email)
            branchesForReminder (office_code, name)
            processingItem (customerId, timePeriod, processingDate, batchId, jobId, classOfBusiness, branch, toDate, maxRetries, processingType, testMode, skipAgingFilter, skipDcNoteCheck)
            */
            await ctx.run("process-reminder", async () => {
              return await processReminderLetter({
                customer: customerData,
                branches: branchesForReminder,
                item: processingItem,
              });
            });
          } else {
            // ========== PROCESS NEW SOA ==========
            if (isMultiBranchCustomer(customerData.actingCode)) {
              // Multi-branch processing
              const branches = await ctx.run(
                "get-branches",
                async () => await getAllBranches(),
              );

              ctx.console.log(`Processing ${branches.length} branches`);

              for (const branchItem of branches) {
                const branchResult = await ctx.run(
                  `Branch-${branchItem.office_code}`,
                  async () => {
                    return await singleBranch(
                      branchItem.office_code,
                      customerData,
                      processingItem,
                    );
                  },
                );

                if (branchResult.soaData && branchResult.soaData.length > 0) {
                  await ctx.run(
                    `create-reminder-${branchItem.office_code}`,
                    async () => {
                      return await createSoaReminder(
                        customerData,
                        processingItem.timePeriod,
                        branchItem.office_code,
                        branchResult.soaData as IStatementOfAccountModel[],
                      );
                    },
                  );
                }
              }
            } else {
              // Single branch processing
              const singleResult = await ctx.run("single-branch", async () => {
                return await singleBranch(
                  processingItem.branch,
                  customerData,
                  processingItem,
                );
              });

              if (singleResult.soaData && singleResult.soaData.length > 0) {
                await ctx.run("create-reminder", async () => {
                  return await createSoaReminder(
                    customerData,
                    processingItem.timePeriod,
                    processingItem.branch,
                    singleResult.soaData as IStatementOfAccountModel[],
                  );
                });
              }
            }

            // Send Email - ONLY for NEW SOA
            await ctx.run("send-email", async () => {
              const uniqueId = randomUUID().replace(/-/g, "");

              const excelFileName = `Outstanding-SOA--${customerId}-${uniqueId}.xlsx`;
              const pdfFileName = `Collection_Letter_${customerId}.pdf`;

              try {
                const { excelBuffer, pdfBuffer } = await downloadSoaFiles(
                  customerId,
                  excelFileName,
                  pdfFileName,
                );

                const excelFile = {
                  fileName: excelFileName,
                  bytes: excelBuffer,
                  contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                };

                const pdfFile = {
                  fileName: pdfFileName,
                  bytes: pdfBuffer,
                  contentType: "application/pdf",
                };

                const customerEmail = "gerardus.david@tob-ins.com";
                await sendSoaEmail(
                  customerData,
                  customerEmail,
                  excelFile,
                  pdfFile,
                  processingItem.testMode,
                  jobId,
                );

                return { sent: true };
              } catch (error: any) {
                return { sent: false, reason: error.message };
              }
            });

            // ========== REMINDER LOOP (RL1, RL2, RL3) ==========
            // 🔥 ctx.sleep WORKS here because this is a WORKFLOW!
            const reminderInterval = processingItem.testMode
              ? 2 * 60 * 1000 // 2 minutes for testing
              : 14 * 24 * 60 * 60 * 1000; // 2 weeks for production

            const maxReminders = 3;
            let currentReminderCount = 0;

            ctx.console.log(
              `Starting reminder schedule, interval: ${
                processingItem.testMode ? "2 minutes" : "2 weeks"
              }`,
            );

            while (currentReminderCount < maxReminders) {
              ctx.console.log(`Waiting for RL${currentReminderCount + 1}...`);

              // 🔥 Durable sleep - workflow survives restarts!
              await ctx.sleep(reminderInterval);

              // Check if still has outstanding
              const outstandingReminders = await ctx.run(
                `check-payment-rl${currentReminderCount + 1}`,
                async () => {
                  return await findReminderByCustomerAndPeriod(
                    customerData.code,
                    processingItem.timePeriod,
                  );
                },
              );

              if (!outstandingReminders || outstandingReminders.length === 0) {
                ctx.console.log("All SOA paid, stopping reminders");
                break;
              }

              currentReminderCount++;

              const reminderType =
                currentReminderCount === 1
                  ? SoaProcessingType.RL1
                  : currentReminderCount === 2
                    ? SoaProcessingType.RL2
                    : SoaProcessingType.RL3;

              ctx.console.log(`Processing RL${currentReminderCount}`);

              const branchesForReminder = await ctx.run(
                `get-branches-for-reminder-rl${currentReminderCount}`,
                async () => await findAllBranches(),
              );

              const reminderProcessingItem: ISoaProcessingItem = {
                ...processingItem,
                processingType: reminderType,
              };

              await ctx.run(
                `send-reminder-rl${currentReminderCount}`,
                async () => {
                  return await processReminderLetter({
                    customer: customerData,
                    branches: branchesForReminder,
                    item: reminderProcessingItem,
                  });
                },
              );

              ctx.console.log(`RL${currentReminderCount} completed`);
            }

            ctx.console.log(
              `Reminder schedule completed, sent ${currentReminderCount} reminders`,
            );
          }

          // Mark as Completed
          await ctx.run("customer-completed", async () => {
            await updateJobStatus(jobId, "Completed");
          });

          await ctx.run("batch-completed", async () => {
            const { isComplete, status } =
              await incrementProcessedAndCheckComplete(batchId);
            if (isComplete) {
              await updateBatchStatus(batchId, status);

              ctx.console.log(
                `Batch ${batchId} completed with status ${status}`,
              );
            }
          });

          success = true;
          ctx.console.log(`Completed: ${customerId}`);
        } catch (error: any) {
          currentRetryAttempt++;

          if (currentRetryAttempt <= maxRetries) {
            await ctx.run(`mark-retrying-${currentRetryAttempt}`, async () => {
              await updateJobStatus(
                jobId,
                "Retrying",
                error.message,
                currentRetryAttempt,
              );
            });

            ctx.console.log(`Retrying (${currentRetryAttempt}/${maxRetries})`);
            await ctx.sleep(1000 * currentRetryAttempt);
          } else {
            await ctx.run("mark-failed", async () => {
              await updateJobStatus(
                jobId,
                "Failed",
                `Failed after ${maxRetries} attempts: ${error.message}`,
              );
              await incrementFailedCount(batchId);
            });

            ctx.console.log(`❌ Failed after ${maxRetries} retries`);
            return { customerId, status: "failed", error: error.message };
          }
        }
      }

      return { customerId, status: "completed", jobId };
    },
  },
});

export type SoaProcessingWorkflow = typeof soaProcessingWorkflow;
