# 🏥 Prashanth Hospital Master Data Governance & Sanitization Platform

An enterprise-wide, metadata-driven platform functioning as a **Single Source of Truth (SSOT)** for all clinical, financial, operational, and administrative hospital master data.

![License](https://img.shields.io/badge/License-Proprietary-teal.svg)
![Build](https://img.shields.io/badge/Build-Passing-emerald.svg)
![Version](https://img.shields.io/badge/Version-v1.0.0-blue.svg)

---

## 🌟 Key Features & Capabilities

- **Metadata-Driven Architecture**: Powered by a central **Master Registry Engine** allowing Administrators to register new hospital masters dynamically without code changes or application rebuilds.
- **24+ Core Registered Hospital Masters**:
  - 👨‍⚕️ Doctor Master
  - 👤 Employee & User Master
  - 🏢 Department Master
  - 🩺 Specialty Master
  - 🏥 Branch & Location Master
  - 💊 Pharmacy Master (Formulary, LASA, Schedule H/H1/X)
  - 📦 Stores & Consumables Master (Medical & Surgical)
  - 🧪 Laboratory Test Master (LOINC, Specimen, Reference Ranges)
  - 📑 Laboratory Profile & Package Master
  - 🩻 Radiology Investigation Master (Modality, Contrast, PACS)
  - 🫀 Cardiology Diagnostic Master (ECG, Echo, TMT, Holter)
  - 🔬 Other Diagnostic Master (PFT, EEG, EMG, Endoscopy)
  - 🔪 Procedure Master (OT classification, Anaesthesia, Consumables)
  - 👩‍⚕️ Clinical Service Master
  - 🧾 Billing Service Master
  - 💳 Tariff Master (Payer, Corporate, Insurance pricing matrix)
  - 🏦 Payer, TPA & Corporate Master
  - 📦 Hospital Package Master
  - 🛏️ Room, Ward & Bed Master
  - 👩‍🔬 Nursing Service Master
  - ⚙️ Equipment & Biomedical Master
  - 🚛 Vendor Master
  - 📣 Referral Source Master
  - 🏷️ Diagnosis & Clinical Coding Master (ICD-10 / CPT)

- **Universal Validation Engine**:
  - Primary Key & Candidate Business Key Uniqueness.
  - Exact, Normalised, and **Levenshtein Fuzzy Match Duplicate Detection**.
  - **Doctor Anti-Automerge Rule**: Similar names prohibited from auto-merging without registration number verification.
  - Pathologist, Radiologist, and Finance approval signoff protocols.
  - Cross-Master Relationship Engine (Orphan record & inactive parent mapping detection).

- **Multi-Branch 9-Step Audit Control**:
  - Prompts for Hospital Group, Hospital, Branch, Source System, Master Domain, Master Type, File Version, Effective Date, and Load Mode (Full vs. Incremental).

- **Multi-Role Approval Routing & Adapters**:
  - Workspaces for Medical Directors, Pathologists, Radiologists, Surgical HODs, Finance Controllers, Chief Pharmacists, and HIS Admins.
  - Exports to Kranium-compatible CSV, Source CSV, Unresolved/Rejected CSVs, Audit Reports, and API JSON endpoints.

---

## 🚀 Quick Start & Installation

### Option 1: Automated 1-Click Deployment Script
```bash
# Clone the repository
git clone https://github.com/drbaskaran-sketch/prashanth-master-data-governance.git
cd prashanth-master-data-governance

# Make deployment script executable & run
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Local Setup

#### 1. Start Backend API Engine (Port 5050)
```bash
cd backend
npm install
npm start
```

#### 2. Start Frontend Portal (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/registry/masters` | Returns metadata definitions for all 24+ registered masters |
| `GET` | `/api/registry/masters/:masterId` | Gets schema details for a specific master |
| `POST` | `/api/registry/masters` | Dynamically registers a new hospital master |
| `POST` | `/api/governance/upload` | Validates uploaded dataset against schemas & domain rule packs |
| `POST` | `/api/governance/approve` | Records field-level / domain multi-role approval signoffs |
| `GET` | `/api/governance/export/:masterId` | Exports data in Kranium CSV, Source CSV, or API JSON format |

---

## 📦 Download Releases

Target server deployment archives are available on the [GitHub Releases Page](https://github.com/drbaskaran-sketch/prashanth-master-data-governance/releases/tag/v1.0.0):
- [`prashanth-master-data-governance-deployment.zip`](https://github.com/drbaskaran-sketch/prashanth-master-data-governance/releases/download/v1.0.0/prashanth-master-data-governance-deployment.zip)

---

© 2026 Prashanth Hospitals Group. All rights reserved.
