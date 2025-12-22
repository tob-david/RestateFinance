import { executeQuery } from "../config";
import { CustomerModel } from "../../utils/types/soa";

/**
 * Find all accounts (customers with IS_CUSTOMER = 'N')
 */
export const findAllAccounts = async () => {
  const sQuery = await executeQuery(
    `SELECT CM_CODE, CM_NAME FROM MASTER_CM WHERE IS_CUSTOMER = 'N' AND ROWNUM <= 5`
  );

  return sQuery;
};

/**
 * Find customer by ID
 */
export const findCustomerById = async (
  customerId: string
): Promise<CustomerModel | null> => {
  const sQuery = `SELECT CM_CODE AS "code", CM_FULLNAME AS "fullName", ACTING_CODE AS "actingCode", EMAIL AS "email"
               FROM MASTER_CM WHERE CM_CODE = :customerId`;
  const result = await executeQuery(sQuery, { customerId });
  return (result.rows?.[0] as CustomerModel) ?? null;
};

/**
 * Find customer emails by customer code and optionally office code
 */
export const findCustomerEmails = async (
  cmCode: string,
  officeCode?: string | null
): Promise<string[]> => {
  let sql = `
    SELECT DISTINCT EMAIL 
    FROM MASTER_COLLECTION 
    WHERE CM_CODE = :cmCode 
      AND EMAIL IS NOT NULL
  `;

  const binds: any = { cmCode };

  if (officeCode && officeCode !== "ALL") {
    sql += ` AND OFFICE_CODE = :officeCode`;
    binds.officeCode = officeCode;
  }

  const result = await executeQuery(sql, binds);
  return (result.rows as any[])?.map((r) => r.EMAIL).filter(Boolean) ?? [];
};
