# FinanceRestate - SOA Workflow

Sistem otomatis untuk memproses dan mengirimkan **Statement of Account (SOA)** kepada customer menggunakan **Restate SDK** dengan fitur **durable execution**, **checkpointing**, dan **automatic retry**.

## Prerequisites

- Node.js >= 18
- Docker (untuk Restate Server)
- Oracle Database
- Azure Blob Storage Account
- Microsoft 365 (untuk Graph API email)
- Jasper Report Server

## Installation

```bash
# Clone repository
git clone git@github.com:tob-david/FinanceRestate.git
cd FinanceRestate

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

## Environment Variables

| Variable                          | Description                   |
| --------------------------------- | ----------------------------- |
| `DB_USER`                         | Oracle database username      |
| `DB_PASSWORD`                     | Oracle database password      |
| `DB_CONNECTION_STRING`            | Oracle connection string      |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection |
| `AZURE_STORAGE_CONTAINER_NAME`    | Container name for files      |
| `AZURE_TENANT_ID`                 | Azure AD tenant ID            |
| `AZURE_CLIENT_ID`                 | Azure AD app client ID        |
| `AZURE_CLIENT_SECRET`             | Azure AD app client secret    |
| `EMAIL_SENDER`                    | Sender email address          |
| `JASPER_URL`                      | Jasper Report Server URL      |
| `JASPER_USERNAME`                 | Jasper username               |
| `JASPER_PASSWORD`                 | Jasper password               |

## Running the Application

```bash
# Start Restate Server (Docker)
docker run --name restate_dev --rm -p 8080:8080 -p 9070:9070 -p 9071:9071 --add-host=host.docker.internal:host-gateway docker.io/restatedev/restate:1.1

# Start the application (in another terminal)
npm run dev

# Register the service
npx restate deployments register http://host.docker.internal:9080
```

---

## Deskripsi Umum

SOA (Statement of Account) Workflow adalah sistem otomatis untuk memproses dan mengirimkan Statement of Account kepada customer.

## Komponen Utama

| File                                    | Deskripsi                              |
| --------------------------------------- | -------------------------------------- |
| `src/workflows/soaWorkflow.ts`          | Main workflow orchestrator             |
| `src/services/generateSoa.ts`           | Generate Excel & PDF files             |
| `src/services/sendSoaEmail.ts`          | Kirim email via Microsoft Graph        |
| `src/services/createSoaReminder.ts`     | Buat reminder record di database       |
| `src/services/processReminderLetter.ts` | Proses reminder letter (RL1, RL2, RL3) |
| `src/services/singleBranch.ts`          | Proses SOA per branch                  |

## Tahapan Workflow

### Step 1: Get Customers

- Mengambil daftar semua customer aktif dari database
- Query: `findAllAccounts()`

### Step 2: Create Batch

- Membuat batch baru dengan status "Queued"
- Generate unique batch ID menggunakan UUID
- Insert ke tabel `SOA_BATCH`

### Step 3: Process Each Customer

#### 3a. Get or Create Job

- Cek apakah job sudah ada untuk customer + batch
- Jika belum, buat job baru dengan status awal

#### 3b. Check SOA History

- Cek apakah customer sudah punya reminder sebelumnya di periode yang sama
- Menentukan apakah proses **NEW SOA** atau **REMINDER LETTER**

#### 3c. Decision Logic

| Kondisi                       | Aksi                   |
| ----------------------------- | ---------------------- |
| Tidak ada reminder sebelumnya | Proses NEW SOA         |
| Ada reminder sebelumnya       | Proses REMINDER LETTER |

### Detail Generate SOA

1. **Get SOA Data** - Panggil stored procedure untuk ambil data SOA
2. **Filter by Aging** - Hanya ambil yang aging >= 60 hari
3. **Extract DC Notes** - Ambil list DC Note dari SOA data
4. **Filter Processed** - Skip DC Notes yang sudah pernah diproses
5. **Generate Excel** - Buat file Excel dari Jasper Server
6. **Generate PDF** - Buat file Collection PDF dari Jasper Server
7. **Upload to Azure** - Upload kedua file ke Azure Blob Storage

### Processing Phases

```typescript
enum SoaProcessingPhase {
  RetrievingCustomerData = "RetrievingCustomerData",
  CheckingSoaHistory = "CheckingSoaHistory",
  GetSoa = "GetSoa",
  GeneratingFiles = "GeneratingFiles",
  UploadingToAzure = "UploadingToAzure",
  SendingEmail = "SendingEmail",
}
```

### Email Configuration

| Parameter   | Deskripsi                                       |
| ----------- | ----------------------------------------------- |
| TO          | Email customer (atau test email dalam testMode) |
| Subject     | `SOA OUTSTANDING {CustomerName} as {Date}`      |
| Attachments | Excel SOA + PDF Collection                      |

---

## Proses Reminder Letter

### Reminder Types

| Type    | Deskripsi                 | Interval             |
| ------- | ------------------------- | -------------------- |
| **RL1** | Reminder Letter 1         | 2 minggu setelah SOA |
| **RL2** | Reminder Letter 2         | 2 minggu setelah RL1 |
| **RL3** | Reminder Letter 3 (Final) | 2 minggu setelah RL2 |

> **Note:** Dalam **testMode**, interval reminder adalah **2 menit** untuk testing.

## Data Models

### SoaProcessingItem

```typescript
interface SoaProcessingItem {
  customerId: string;
  timePeriod: string; // Format: "YYYY-MM"
  processingDate: string;
  batchId: string;
  jobId: string;
  classOfBusiness: string;
  branch: string;
  toDate: number; // Unix timestamp
  maxRetries: number; // Default: 3
  processingType: SoaProcessingType;
  testMode: boolean;
  skipAgingFilter?: boolean;
  skipDcNoteCheck?: boolean;
}
```

### SoaProcessingType

```typescript
enum SoaProcessingType {
  SOA = 1, // New SOA
  RL1 = 2, // Reminder Letter 1
  RL2 = 3, // Reminder Letter 2
  RL3 = 4, // Reminder Letter 3
}
```

### CustomerModel

```typescript
interface CustomerModel {
  code: string;
  fullName: string;
  actingCode: string; // DIC, DIP, DIG, DID = Multi-branch
  email?: string;
}
```

> **Multi-branch codes**: `["DIC", "DIP", "DIG", "DID"]`

### Retry Configuration

- **Max Retries**: 3
- **Backoff Strategy**: Exponential (1s, 2s, 3s)
- **Status Updates**: Retrying → Failed

---

## Step 4: Finalize Batch

Setelah semua customer diproses:

1. Ambil status batch dari database
2. Hitung total processed vs failed
3. Tentukan final status:

| Kondisi        | Final Status     |
| -------------- | ---------------- |
| Semua berhasil | Completed        |
| Sebagian gagal | Partially Failed |
| Semua gagal    | Failed           |

---

## External Dependencies

### Database (Oracle)

- Tabel: `SOA_BATCH`, `SOA_JOB`, `SOA_REMINDER`, `SOA_REMINDER_DETAIL`, `SOA_REMINDER_LETTER`
- Stored Procedure: `SP_GET_SOA_DATA`

### Azure Blob Storage

- Container untuk menyimpan file Excel dan PDF
- Path: `{customerId}/excel/{filename}` dan `{customerId}/pdf/{filename}`

### Microsoft Graph API

- Untuk mengirim email dengan attachment
- Menggunakan OAuth2 client credentials flow

### Jasper Report Server

- Generate Excel SOA report
- Generate PDF Collection report

---

## Menjalankan Workflow

### Trigger via HTTP

```bash
curl -X POST http://localhost:8080/SoaWorkflow/run \
  -H "Content-Type: application/json" \
  -d '{"type": "SOA", "testMode": true}'
```

### Input Parameters

| Parameter         | Type    | Deskripsi                             |
| ----------------- | ------- | ------------------------------------- |
| `type`            | string  | "SOA", "RL1", "RL2", "RL3"            |
| `testMode`        | boolean | Gunakan email test & interval pendek  |
| `skipAgingFilter` | boolean | Skip filter aging >= 60 hari          |
| `skipDcNoteCheck` | boolean | Skip cek DC Notes yang sudah diproses |

---

## Monitoring

### Restate Admin UI

- URL: `http://localhost:9070`
- Lihat status workflow, jobs, dan invocations

### Logs

- Output console untuk setiap step processing
- Phase tracking di database untuk audit trail
