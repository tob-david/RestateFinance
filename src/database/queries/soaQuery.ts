import { callProcedure } from "../config";
import { IStatementOfAccountModel } from "../../utils/types/soa";
import { transformSoaRow } from "../../streaming/transformers/soaTransformer";

/**
 * Fetch SOA data from stored procedure
 * Uses PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new which returns cursor with all SOA columns
 */
export const fetchSoaFromProcedure = async (
  officeCode: string,
  classOfBusiness: string,
  accountCode: string,
  accountName: string | null,
  toDate: Date,
  userCode: string
): Promise<IStatementOfAccountModel[]> => {
  const rows = await callProcedure("PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new", {
    p_office: officeCode,
    p_class: classOfBusiness,
    p_dc_account_code: accountCode,
    p_dc_account_name: accountName,
    p_as_at_date: toDate,
    p_userid: userCode,
  });

  // Use the transformer to map Oracle cursor columns to IStatementOfAccountModel
  return rows
    .map((row: any[]) => transformSoaRow(row))
    .filter((row): row is IStatementOfAccountModel => row !== null);
};
