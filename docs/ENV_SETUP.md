# SOA Processing Environment Variables

## Mailtrap SMTP (for testing emails)

Get credentials from https://mailtrap.io

```env
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password

EMAIL_FROM=collection@tob-ins.com
EMAIL_TEST=gerardus.david@tob-ins.com
```

## How to Setup Mailtrap

1. Go to https://mailtrap.io and create free account
2. In Email Testing → Inboxes → click on your inbox
3. In "Show Credentials" section, copy:
   - Username → `MAILTRAP_USER`
   - Password → `MAILTRAP_PASS`
4. Create `.env` file in project root with above variables
5. All emails will be captured in Mailtrap inbox (not sent to real recipients)
