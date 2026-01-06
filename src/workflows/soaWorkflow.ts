import { WorkflowContext } from "@restatedev/restate-sdk";
import * as restate from "@restatedev/restate-sdk";
import { v4 as uuidv4 } from "uuid";

import {
  soaProcessingWorkflow,
  SoaProcessingWorkflow,
} from "./soaProcessingWorkflow";

import { documentTypes } from "../utils/schema/SoaAutomationSchema";
import { SoaProcessingType } from "../utils/types";
import { formatUUID } from "../utils/formater";
import { IAccountRow } from "../utils/types";

import {
  updateBatchStatus,
  findAllAccounts,
  insertBatch,
} from "../database/queries";

export const soaWorkflow = restate.workflow({
  name: "SoaWorkflow",
  handlers: {
    run: async (ctx: WorkflowContext, type: documentTypes) => {
      ctx.console.log("Starting SOA workflow");

      const dateNow = new Date();
      const timePeriod = dateNow.toISOString().slice(0, 7);
      const classOfBusiness = "ALL";
      const branch = "ALL";
      const toDate = Math.floor(dateNow.getTime() / 1000);
      const maxRetries = 3;
      const processingDate = dateNow.toISOString();

      // ========== STEP 1: Get Customers ==========
      const customers = await ctx.run("get-customers", async () => {
        return await findAllAccounts();
      });

      if (!customers?.rows || customers.rows.length === 0) {
        throw new Error("No customers found");
      }

      let customerRows = (customers.rows ?? []) as IAccountRow[];

      // ========== STEP 2: Create Batch ==========
      const batchId = await ctx.run("create-batch", async () => {
        const id = formatUUID(uuidv4());
        await insertBatch(id, customerRows.length, "Queued");
        return id;
      });

      ctx.console.log(
        `Batch created: ${batchId}, Total: ${customerRows.length}`
      );

      // ========== STEP 3: Spawn Child Workflows ==========
      await ctx.run("soa-processing-start", async () => {
        await updateBatchStatus(batchId, "Processing");
      });

      const processingType =
        SoaProcessingType[type.type as keyof typeof SoaProcessingType];

      const totalCustomers = customerRows.length;

      for (const customer of customerRows) {
        const customerId = customer.cm_code;

        ctx
          .workflowSendClient<SoaProcessingWorkflow>(
            soaProcessingWorkflow,
            customerId
          )
          // panggil data disini > table
          .run({
            customerId,
            timePeriod,
            processingDate,
            batchId,
            classOfBusiness,
            branch,
            toDate,
            maxRetries,
            processingType,
            testMode: type.testMode ?? false,
            skipAgingFilter: type.skipAgingFilter ?? false,
            skipDcNoteCheck: type.skipDcNoteCheck ?? false,
          });
      }

      ctx.console.log("Finished SOA workflow");

      return {
        batchId,
        message: "SOA processing started successfully",
        totalCustomers,
        Status: "Queued",
      };
    },
  },
});
