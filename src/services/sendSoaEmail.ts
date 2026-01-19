import { completePhase, insertPhase } from "../database/queries";

import { sendEmail } from "../utils/email";
import { generateSoaEmailHtml } from "../utils/report/email";
import { IEmailMessage } from "../utils/types";
import {
  SoaProcessingPhase,
  ICustomerModel,
  IFileData,
} from "../utils/types/soa";

export const sendSoaEmail = async (
  customer: ICustomerModel,
  toEmail: string,
  excelFile: IFileData,
  pdfFile: IFileData,
  testMode: boolean,
  jobId: string,
): Promise<boolean> => {
  const asAtDate = new Date();

  // Generate email HTML
  const emailHtml = await generateSoaEmailHtml({
    customerName: customer.fullName,
    virtualAccount: customer.virtualAccount || "-",
    asAtDate: asAtDate,
  });

  // In testMode, always use provided email; otherwise use customer email or fallback
  const recipientEmail = testMode ? toEmail : customer.email || toEmail;

  await completePhase(jobId, SoaProcessingPhase.SendingEmail);

  // Prepare email message
  const message: IEmailMessage = {
    to: [recipientEmail],
    subject: `SOA OUTSTANDING ${
      customer.fullName
    } as ${asAtDate.toLocaleDateString("id-ID")}`,
    body: emailHtml,
    attachments: [
      {
        name: excelFile.fileName,
        contentType: excelFile.contentType,
        contentBytes: excelFile.bytes.toString("base64"),
      },
      {
        name: pdfFile.fileName,
        contentType: pdfFile.contentType,
        contentBytes: pdfFile.bytes.toString("base64"),
      },
    ],
  };

  await insertPhase(jobId, SoaProcessingPhase.SendingEmail);

  console.log(`Sending SOA email for ${customer.code} to: ${recipientEmail}`);
  return await sendEmail(message);
};
