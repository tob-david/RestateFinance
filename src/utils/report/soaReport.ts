import { readFileSync } from "fs";
import { join } from "path";

import { generatePdfFromHtml } from "./pdfGenerator";
import { renderTemplate } from "./templateEngine";
import { generateExcel } from "./excelGenerator";

import { IExcelColumn, ISoaFileResult } from "../types/report";
import { IStatementOfAccountModel } from "../types/soa";
import { CONTENT_TYPES } from "./constants";

const TEMPLATES_DIR = join(__dirname, "templates");

function loadTemplate(name: string): string {
  return readFileSync(join(TEMPLATES_DIR, `${name}.html`), "utf-8");
}

export async function generateSoaExcel(
  soaData: IStatementOfAccountModel[],
  customerId: string,
  dateStr: string,
  branch: string
): Promise<ISoaFileResult> {
  const fileName = `SOA_${customerId}_${dateStr}.xlsx`;

  // Define SOA columns matching the requested format
  const columns: IExcelColumn[] = [
    { header: "DC Note", key: "debitAndCreditNoteNo", width: 18 },
    { header: "Branch", key: "branch", width: 10 },
    { header: "Policy No", key: "policyNo", width: 20 },
    { header: "Policy End No", key: "policyEndNo", width: 15 },
    { header: "Contract No", key: "contractNo", width: 15 },
    { header: "Plat No", key: "plateNo", width: 12 },
    { header: "Batch No", key: "coInFacRefNo", width: 15 },
    {
      header: "Fire Conjunction Policy",
      key: "fireConjunctionPolicy",
      width: 20,
    },
    { header: "LOB", key: "lob", width: 10 },
    { header: "SOB", key: "sourceOfBusiness", width: 10 },
    { header: "Account Name", key: "accountName", width: 30 },
    { header: "Insured Name", key: "insuredName", width: 30 },
    { header: "Distribution Name", key: "distributionName", width: 25 },
    {
      header: "Distribution Second Name",
      key: "distributionNameSecond",
      width: 25,
    },
    { header: "QQ Name", key: "qualitateQuaName", width: 20 },
    { header: "Effective Date", key: "endEffDate", width: 12 },
    { header: "Expired Date", key: "endExpDate", width: 12 },
    { header: "Post Date", key: "postDate", width: 12 },
    { header: "Aging", key: "aging", width: 10 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Exchange Rate", key: "exchangeRate", width: 12 },
    { header: "Endorsement Reason", key: "endReason", width: 20 },
    { header: "Acting Code", key: "actingCode", width: 12 },
    { header: "Total Sum Insured", key: "totalSumInsured", width: 18 },
    { header: "Gross Premium", key: "grossPremium", width: 15 },
    { header: "Discount", key: "discount", width: 12 },
    { header: "Commission", key: "commission", width: 12 },
    { header: "PPN", key: "ppn", width: 12 },
    { header: "PPH 21", key: "pph21", width: 12 },
    { header: "PPH 23", key: "pph23", width: 12 },
    { header: "Cost", key: "cost", width: 12 },
    { header: "STMP", key: "stmp", width: 10 },
    { header: "Nett Premium", key: "netPremium", width: 15 },
    { header: "Nett Premium (IDR)", key: "netPremiumIdr", width: 18 },
    { header: "Installment", key: "installment", width: 12 },
    { header: "Due Date", key: "dueDate", width: 12 },
  ];

  // Map SOA data to rows
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

  const buffer = generateExcel([
    {
      sheetName: "Statement of Account",
      columns,
      rows,
    },
  ]);

  return {
    fileName,
    contentType: CONTENT_TYPES.XLSX,
    bytes: buffer,
  };
}

export async function generateCollectionPdf(
  customerId: string,
  customerName: string,
  statementDate: string,
  virtualAccount: string
): Promise<ISoaFileResult> {
  const fileName = `Collection_${customerId}_${statementDate}.pdf`;

  const template = loadTemplate("collectionPdf");
  const html = await renderTemplate(template, {
    customerId,
    customerName,
    statementDate,
    virtualAccount: virtualAccount || "N/A",
  });

  const buffer = await generatePdfFromHtml(html, {
    format: "A4",
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
  });

  return {
    fileName,
    contentType: CONTENT_TYPES.PDF,
    bytes: buffer,
  };
}
