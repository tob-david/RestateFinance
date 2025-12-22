import { EmailAttachment, sendEmail } from "../utils/email";
import {
  generateReminderEmailHtml,
  getReminderEmailSubject,
  ReminderEmailData,
} from "../utils/report";
import { CustomerModel } from "../utils/types/soa";

export const sendReminderEmail = async (params: {
  customer: CustomerModel;
  toEmail: string;
  reminderType: string;
  letterNo: string;
  previousLetterNo?: string;
  excelFile: { fileName: string; bytes: Buffer; contentType: string };
  pdfFile: { fileName: string; bytes: Buffer; contentType: string };
  testMode: boolean;
}): Promise<boolean> => {
  const {
    customer,
    toEmail,
    reminderType,
    letterNo,
    previousLetterNo,
    testMode,
    excelFile,
    pdfFile,
  } = params;

  const emailData: ReminderEmailData = {
    customerName: customer.fullName,
    asAtDate: new Date(),
    virtualAccount: "",
    letterNo,
    previousLetterNo,
  };

  const htmlContent = await generateReminderEmailHtml(reminderType, emailData);
  const subject = getReminderEmailSubject(reminderType, customer.fullName);
  const recipient = testMode ? "gerardus.david@tob-ins.com" : toEmail;
  const recipients = recipient.split(",").map((r) => r.trim());
  const attachments: EmailAttachment[] = [
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
  ];
  await sendEmail({ to: recipients, subject, body: htmlContent, attachments });
  return true;
};
