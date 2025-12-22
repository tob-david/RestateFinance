export interface EmailAttachment {
  name: string;
  contentType: string;
  contentBytes: string;
}
export interface EmailMessage {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}
