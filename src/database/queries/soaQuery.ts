import { callProcedure } from "../config";
import { StatementOfAccountModel } from "../../utils/types/soa";

/**
 * Fetch SOA data from stored procedure
 */
export const fetchSoaFromProcedure = async (
  officeCode: string,
  classOfBusiness: string,
  accountCode: string,
  accountName: string | null,
  toDate: Date,
  userCode: string
): Promise<StatementOfAccountModel[]> => {
  const rows = await callProcedure("PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new", {
    p_office: officeCode,
    p_class: classOfBusiness,
    p_dc_account_code: accountCode,
    p_dc_account_name: accountName,
    p_as_at_date: toDate,
    p_userid: userCode,
  });

  // Stored procedure returns array with indexes, not object with named properties
  // Based on log output, mapping is:
  // [0]=Branch, [1]=DCNoteNo, [7]=ClassOfBusiness, [10]=InsuredName, [11]=CustomerName
  // [17]=Aging(days), [23]=NetPremium, [34]=DCNoteId, [35]=NetPremiumIDR
  return rows.map((row: any) => ({
    branch: row[0],
    dcNoteNo: row[1],
    debitAndCreditNoteNo: row[34] || row[1], // DC Note ID or DC Note No
    classOfBusiness: row[7],
    insuredName: row[10],
    aging: row[17]?.toString() || "0",
    netPremium: row[23] || 0,
    netPremiumIdr: row[35] || row[23] || 0,
    policyNo: row[3] || row[5],
  }));
};
