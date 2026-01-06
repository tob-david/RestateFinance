// import * as restate from "@restatedev/restate-sdk";
// import { findAllAccounts, findCustomerById } from "../database/queries";

// export const customerService = restate.service({
//   name: "CustomerService",
//   handlers: {
//     getCustomers: async (ctx: restate.Context) => {
//       const customers = await ctx.run("getCustomers", async () => {
//         console.log("Fetching customers...");
//         return await findAllAccounts();
//       });

//       return customers;
//     },
//   },
// });

// export type CustomerService = typeof customerService;
