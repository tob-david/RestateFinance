import { callProcedure } from "../config";
import { IStatementOfAccountModel } from "../../utils/types/soa";
import { transformSoaRow } from "../../streaming/transform/soaTransformer";

export const fetchSoaFromProcedure = async (
  officeCode: string,
  classOfBusiness: string,
  accountCode: string,
  accountName: string | null,
  toDate: Date,
  userCode: string,
): Promise<IStatementOfAccountModel[]> => {
  const rows = await callProcedure("PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new", {
    p_office: officeCode,
    p_class: classOfBusiness,
    p_dc_account_code: accountCode,
    p_dc_account_name: accountName,
    p_as_at_date: toDate,
    p_userid: userCode,
  });

  return rows
    .map((row: any[]) => transformSoaRow(row))
    .filter((row): row is IStatementOfAccountModel => row !== null);
};
