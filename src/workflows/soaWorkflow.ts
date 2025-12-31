import { WorkflowContext } from "@restatedev/restate-sdk";
import * as restate from "@restatedev/restate-sdk";
import { v4 as uuidv4 } from "uuid";

import { customerService, CustomerService } from "../handlers/customersHandler";
import { batchService, BatchService } from "../handlers/batchHandler";

import { documentTypes } from "../utils/schema/SoaAutomationSchema";
import { IAccountRow, SoaProcessingType } from "../utils/types";
import { formatUUID } from "../utils/formater";
import {
  soaProcessingWorkflow,
  SoaProcessingWorkflow,
} from "./soaProcessingWorkflow";

export const soaWorkflow = restate.workflow({
  name: "SoaWorkflowV1",
  handlers: {
    run: async (ctx: WorkflowContext, type: documentTypes) => {
      // Initialize values
      const { batchId, timePeriod, toDate, processingDate } = await ctx.run(
        "initializeWorkflow",
        () => {
          const dateNow = new Date();
          return {
            batchId: formatUUID(uuidv4()),
            timePeriod: dateNow.toISOString().slice(0, 7),
            toDate: Math.floor(dateNow.getTime() / 1000),
            processingDate: dateNow.toISOString(),
          };
        }
      );

      const classOfBusiness = "ALL";
      const branch = "ALL";
      const maxRetries = 3;

      ctx.console.log(`🚀 Starting SoaWorkflow, batchId: ${batchId}`);

      // ========== STEP 1: Get Customers ==========
      const customers = await ctx
        .serviceClient<CustomerService>(customerService)
        .getCustomers();

      if (!customers?.rows || customers.rows.length === 0) {
        throw new restate.TerminalError("No customers found");
      }

      const customerRows = (customers.rows ?? []) as IAccountRow[];
      ctx.console.log(`Found ${customerRows.length} customers to process`);

      // ========== STEP 2: Create Batch ==========
      await ctx.serviceClient<BatchService>(batchService).createBatch({
        batchId,
        totalAccounts: customerRows.length,
      });

      ctx.console.log(`Batch created: ${batchId}`);

      // ========== STEP 3: Create child workflow for each customer ==========
      const processingType =
        SoaProcessingType[type.type as keyof typeof SoaProcessingType];

      const childWorkflowResults: Array<{
        customerId: string;
        workflowKey: string;
        status: string;
      }> = [];

      for (const customer of customerRows) {
        const customerId = customer.cm_code;
        const workflowKey = customerId;

        ctx.console.log(`Spawning child workflow for: ${customerId}`);
        ctx
          .workflowSendClient<SoaProcessingWorkflow>(
            soaProcessingWorkflow,
            workflowKey
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

        childWorkflowResults.push({
          customerId,
          workflowKey,
          status: "spawned",
        });

        ctx.console.log(`Child workflow spawned for: ${customerId}`);
      }

      // ========== STEP 4: Finalize Batch ==========
      const finalStatus = await ctx
        .serviceClient<BatchService>(batchService)
        .finalizeBatch({ batchId, customers: customerRows });

      return {
        status: finalStatus.status,
        message: "SOA processing completed",
        batchId,
        totalCustomers: customerRows.length,
      };
    },
  },
});
