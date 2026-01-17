import { executeQuery } from "../config";
import { ICustomerModel } from "../../utils/types";

export const findAllAccounts = async () => {
  const sQuery = await executeQuery(
    `SELECT CM_CODE AS "cm_code", CM_NAME AS "cm_name" FROM MASTER_CM WHERE IS_CUSTOMER = 'N' AND ROWNUM <= 5`
  );

  return sQuery;
};

export const findCustomerById = async (
  customerId: string
): Promise<ICustomerModel | null> => {
  const sQuery = `SELECT CM_CODE AS "code", CM_FULLNAME AS "fullName", ACTING_CODE AS "actingCode", EMAIL AS "email"
               FROM MASTER_CM WHERE CM_CODE = :customerId`;
  const result = await executeQuery(sQuery, { customerId });
  return (result.rows?.[0] as ICustomerModel) ?? null;
};

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
