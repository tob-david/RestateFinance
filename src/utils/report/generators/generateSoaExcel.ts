import { randomUUID } from "crypto";
import { ISoaFileResult, IStatementOfAccountModel } from "../../types";
import { CONTENT_TYPES, excelColumns } from "../constants";
import { excelGenerate } from "./excelGenerator";

interface GenerateSoaExcelParams {
  soaData: IStatementOfAccountModel[];
  customerId: string;
}

export async function generateSoaExcel(
  params: GenerateSoaExcelParams,
): Promise<ISoaFileResult> {
  const { soaData, customerId } = params;
  const uniqueId = randomUUID().replace(/-/g, "");
  const fileName = `Outstanding-SOA--${customerId}-${uniqueId}.xlsx`;

  const rows: Record<string, any>[] = soaData.map((soa) => ({
    debitAndCreditNoteNo: soa.debitAndCreditNoteNo,
    branch: soa.branch,
    policyNo: soa.policyNo,
    policyEndNo: soa.policyEndNo,
    contractNo: soa.contractNo,
    plateNo: soa.plateNo,
    coInFacRefNo: soa.coInFacRefNo,
    fireConjunctionPolicy: soa.fireConjunctionPolicy,
    lob: soa.lob,
    sourceOfBusiness: soa.sourceOfBusiness,
    accountName: soa.accountName,
    insuredName: soa.insuredName,
    distributionName: soa.distributionName,
    distributionNameSecond: soa.distributionNameSecond,
    qualitateQuaName: soa.qualitateQuaName,
    endEffDate: soa.endEffDate,
    endExpDate: soa.endExpDate,
    postDate: soa.postDate,
    aging: soa.aging,
    currency: soa.currency,
    exchangeRate: soa.exchangeRate,
    endReason: soa.endReason,
    actingCode: soa.actingCode,
    totalSumInsured: soa.totalSumInsured,
    grossPremium: soa.grossPremium,
    discount: soa.discount,
    commission: soa.commission,
    ppn: soa.ppn,
    pph21: soa.pph21,
    pph23: soa.pph23,
    cost: soa.cost,
    stmp: soa.stmp,
    netPremium: soa.netPremium,
    netPremiumIdr: soa.netPremiumIdr,
    installment: soa.installment,
    dueDate: soa.dueDate,
  }));

  const buffer = excelGenerate([
    {
      sheetName: "Statement of Account",
      columns: excelColumns,
      rows,
    },
  ]);

  return {
    fileName,
    contentType: CONTENT_TYPES.XLSX,
    bytes: buffer,
  };
}
