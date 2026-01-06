// import * as restate from "@restatedev/restate-sdk";

// import { IAccountRow, IGetSoaBatchStatus } from "../utils/types";

// import {
//   updateBatchStatus,
//   findBatchStatus,
//   insertBatch,
// } from "../database/queries";

// export const batchService = restate.service({
//   name: "BatchService",
//   handlers: {
//     createBatch: async (
//       ctx: restate.Context,
//       params: { batchId: string; totalAccounts: number }
//     ) => {
//       const id = await ctx.run("createBatch", async () => {
//         await insertBatch(params.batchId, params.totalAccounts, "Queued");
//         return params.batchId;
//       });

//       return id;
//     },

//     finalizeBatch: async (
//       ctx: restate.Context,
//       params: { batchId: string; customers: IAccountRow[] }
//     ) => {
//       const finalStatus = await ctx.run("Step4-FinalizeBatch", async () => {
//         const status = (await findBatchStatus(
//           params.batchId
//         )) as IGetSoaBatchStatus;
//         const totalDone = status.processed_customers + status.failed_customers;

//         let result = "Completed";
//         if (status.failed_customers > 0 && status.processed_customers > 0) {
//           result = "Partially Failed";
//         } else if (status.processed_customers === 0) {
//           result = "Failed";
//         }

//         if (totalDone >= status.total_customers) {
//           await updateBatchStatus(params.batchId, result);
//         }

//         return result;
//       });

//       return {
//         batchId: params.batchId,
//         message: "SOA processing completed",
//         totalCustomers: params.customers.length,
//         status: finalStatus,
//       };
//     },
//   },
// });

// export type BatchService = typeof batchService;
