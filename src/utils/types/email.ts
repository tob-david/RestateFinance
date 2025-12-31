export interface IEmailAttachment {
  name: string;
  contentType: string;
  contentBytes: string;
}
export interface IEmailMessage {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachments?: IEmailAttachment[];
}
