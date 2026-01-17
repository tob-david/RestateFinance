import { WorkflowContext } from "@restatedev/restate-sdk";
import * as restate from "@restatedev/restate-sdk";
import { v4 as uuidv4 } from "uuid";

import {
  soaProcessingWorkflow,
  SoaProcessingWorkflow,
} from "./soaProcessingWorkflow";

import { documentTypes } from "../utils/schema/SoaAutomationSchema";
import {
  formatDateToUnixTimestamp,
  parseProcessingType,
  formatTimePeriod,
  formatUUID,
} from "../utils/formater";
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
      const timePeriod = formatTimePeriod(dateNow);
      const classOfBusiness = "ALL";
      const branch = "ALL";
      const toDate = formatDateToUnixTimestamp(dateNow);
      const maxRetries = 3;
      const processingDate = dateNow.toISOString();
      const processingType = parseProcessingType(type.type);

      // Get Customers
      const customers = await ctx.run("get-customers", async () => {
        return await findAllAccounts();
      });

      if (!customers?.rows || customers.rows.length === 0) {
        throw new Error("No customers found");
      }

      let customerRows = (customers.rows ?? []) as IAccountRow[];
      const totalCustomers = customerRows.length;

      // Create Batch
      const batchId = await ctx.run("create-batch", async () => {
        const id = formatUUID(uuidv4());
        await insertBatch(id, totalCustomers, "Queued");
        return id;
      });

      ctx.console.log(`Batch created: ${batchId}, Total: ${totalCustomers}`);

      // Processing SOA for each customer
      await ctx.run("soa-processing-start", async () => {
        await updateBatchStatus(batchId, "Processing");
      });

      for (const customer of customerRows) {
        const customerId = customer.cm_code;

        ctx
          .workflowSendClient<SoaProcessingWorkflow>(
            soaProcessingWorkflow,
            customerId
          )
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
