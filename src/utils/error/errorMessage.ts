import { IAccountRow } from "../types";

export const validationCustomers = (customers: IAccountRow[]) => {
  if (!customers || customers.length === 0) {
    return "No customer found";
  }
};
