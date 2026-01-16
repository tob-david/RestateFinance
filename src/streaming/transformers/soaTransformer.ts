import { IStatementOfAccountModel } from "../../utils/types/soa";

/**
 * Column mapping from Oracle cursor to IStatementOfAccountModel
 * Based on stored procedure PACKAGE_RPT_FI_SOA.get_rpt_fi_soa_new output:
 *
 * SELECT columns:
 * branch, policy_no, pol_end_no, contract_no, plat_no, co_in_fac_ref_no, fire_conjunction_pol,
 * lob, sob, dc_account_full_name, insured_name, distribution_name, distribution_name2, qq_name,
 * end_eff_date, end_exp_date, post_date, aging, curr, exch_rate, end_reason, acting_code, tsi,
 * GP, DISC, COMM, PPN, PPH21, PPH23, COST, STMP, NETT_PREMIUM, inst_no, due_date, DC_NOTE, orig_amount
 */

// Column indices from stored procedure result
const COL = {
  BRANCH: 0,
  POLICY_NO: 1,
  POL_END_NO: 2,
  CONTRACT_NO: 3,
  PLAT_NO: 4,
  CO_IN_FAC_REF_NO: 5,
  FIRE_CONJUNCTION_POL: 6,
  LOB: 7,
  SOB: 8,
  DC_ACCOUNT_FULL_NAME: 9,
  INSURED_NAME: 10,
  DISTRIBUTION_NAME: 11,
  DISTRIBUTION_NAME2: 12,
  QQ_NAME: 13,
  END_EFF_DATE: 14,
  END_EXP_DATE: 15,
  POST_DATE: 16,
  AGING: 17,
  CURR: 18,
  EXCH_RATE: 19,
  END_REASON: 20,
  ACTING_CODE: 21,
  TSI: 22,
  GP: 23,
  DISC: 24,
  COMM: 25,
  PPN: 26,
  PPH21: 27,
  PPH23: 28,
  COST: 29,
  STMP: 30,
  NETT_PREMIUM: 31,
  INST_NO: 32,
  DUE_DATE: 33,
  DC_NOTE: 34,
  ORIG_AMOUNT: 35,
} as const;

/**
 * Parse string to number safely
 */
function parseNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = parseFloat(value.toString());
  return isNaN(num) ? 0 : num;
}

/**
 * Parse date from Oracle result
 */
function parseDate(value: any): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  return new Date(value);
}

/**
 * Parse string safely
 */
function parseString(value: any): string {
  if (value === null || value === undefined) return "";
  return value.toString().trim();
}

/**
 * Transform raw Oracle row to IStatementOfAccountModel
 */
export function transformSoaRow(row: any[]): IStatementOfAccountModel | null {
  if (!row || row.length < 35) return null;

  const netPremium = parseNumber(row[COL.NETT_PREMIUM]);
  const exchangeRate = parseNumber(row[COL.EXCH_RATE]) || 1;
  const aging = parseNumber(row[COL.AGING]);

  // Skip rows with no net premium
  if (netPremium === 0) return null;

  return {
    // DC Note identification
    debitAndCreditNoteNo: parseString(row[COL.DC_NOTE]),

    // Branch and Policy info
    branch: parseString(row[COL.BRANCH]),
    policyNo: parseString(row[COL.POLICY_NO]),
    policyEndNo: parseString(row[COL.POL_END_NO]),
    contractNo: parseString(row[COL.CONTRACT_NO]),
    plateNo: parseString(row[COL.PLAT_NO]),
    coInFacRefNo: parseString(row[COL.CO_IN_FAC_REF_NO]),
    fireConjunctionPolicy: parseString(row[COL.FIRE_CONJUNCTION_POL]),

    // Business classification
    lob: parseString(row[COL.LOB]),
    sourceOfBusiness: parseString(row[COL.SOB]),

    // Account and customer info
    accountName: parseString(row[COL.DC_ACCOUNT_FULL_NAME]),
    insuredName: parseString(row[COL.INSURED_NAME]),
    distributionName: parseString(row[COL.DISTRIBUTION_NAME]),
    distributionNameSecond: parseString(row[COL.DISTRIBUTION_NAME2]),
    qualitateQuaName: parseString(row[COL.QQ_NAME]),

    // Dates
    endEffDate: parseDate(row[COL.END_EFF_DATE]),
    endExpDate: parseDate(row[COL.END_EXP_DATE]),
    postDate: parseDate(row[COL.POST_DATE]),
    dueDate: parseDate(row[COL.DUE_DATE]),

    // Aging and currency
    aging: aging.toString(),
    currency: parseString(row[COL.CURR]),
    exchangeRate: exchangeRate,

    // Endorsement info
    endReason: parseString(row[COL.END_REASON]),
    actingCode: parseString(row[COL.ACTING_CODE]),

    // Financial values
    totalSumInsured: parseNumber(row[COL.TSI]),
    grossPremium: parseNumber(row[COL.GP]),
    discount: parseNumber(row[COL.DISC]),
    commission: parseNumber(row[COL.COMM]),
    ppn: parseNumber(row[COL.PPN]),
    pph21: parseNumber(row[COL.PPH21]),
    pph23: parseNumber(row[COL.PPH23]),
    cost: parseNumber(row[COL.COST]),
    stmp: parseNumber(row[COL.STMP]),
    netPremium: netPremium,
    netPremiumIdr: netPremium * exchangeRate,

    // Installment info
    installment: parseString(row[COL.INST_NO]),
    origAmount: parseNumber(row[COL.ORIG_AMOUNT]),

    // Legacy fields for backward compatibility
    dcNoteNo: parseString(row[COL.DC_NOTE]),
    classOfBusiness: parseString(row[COL.LOB]),
    customerCode: parseString(row[COL.DISTRIBUTION_NAME]),
    officeCode: parseString(row[COL.BRANCH]),
  };
}

/**
 * Transform multiple rows
 */
// export function transformSoaRows(rows: any[][]): IStatementOfAccountModel[] {
//   return rows
//     .map(transformSoaRow)
//     .filter((row): row is IStatementOfAccountModel => row !== null);
// }
