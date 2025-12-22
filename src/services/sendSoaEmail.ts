import { completePhase, insertPhase } from "../database/queries";

import { EmailMessage, sendEmail } from "../utils/email";
import { generateSoaEmailHtml } from "../utils/report";
import {
  SoaProcessingPhase,
  CustomerModel,
  FileData,
} from "../utils/types/soa";

export const sendSoaEmail = async (
  customer: CustomerModel,
  toEmail: string,
  excelFile: FileData,
  pdfFile: FileData,
  testMode: boolean,
  jobId: string
): Promise<boolean> => {
  const asAtDate = new Date();

  // Generate email HTML
  const emailHtml = await generateSoaEmailHtml({
    customerName: customer.fullName,
    asAtDate: asAtDate,
    virtualAccount: "12345678910101212",
  });

  // In testMode, always use provided email; otherwise use customer email or fallback
  const recipientEmail = testMode ? toEmail : customer.email || toEmail;

  await completePhase(jobId, SoaProcessingPhase.SendingEmail);

  // Prepare email message
  const message: EmailMessage = {
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
