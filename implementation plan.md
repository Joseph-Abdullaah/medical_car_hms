# HMS Project Audit & Fix Plan

## Summary

Full audit of the Hospital Management System across the React/TypeScript frontend, C# WinForms desktop host, WebView2 bridge, Services, and Repositories — cross-referenced against the **actual** MySQL schema.

---

## 🔴 CRITICAL FINDINGS (Schema vs Code Mismatch)

### The Root Problem: Two Parallel Data Models

The database schema defines 6 clean tables. The application code was built around a **completely different, invented schema** with extra tables and columns that do not exist. Everything from repositories to UI is misaligned.

---

## Schema Reality Check

### Actual `schema.sql` Tables & Columns

| Table | Real Columns |
|---|---|
| `Departments` | `dept_id`, `dept_name` |
| `Users` | `user_id`, `username`, `password_hash`, `role` (ENUM: ADMIN/DOCTOR/PATIENT) |
| `Patient_Profiles` | `user_id` (PK/FK), `full_name`, `blood_type`, `emergency_contact` |
| `Doctor_Profiles` | `user_id` (PK/FK), `full_name`, `dept_id` |
| `Appointments` | `appointment_id`, `patient_id`, `doctor_id`, `appointment_date` (DATETIME), `status` (ENUM: PENDING/CONFIRMED/COMPLETED/CANCELLED) |
| `Medical_Records` | `record_id`, `patient_id`, `doctor_id`, `diagnosis`, `prescription`, `visit_date` (DATETIME) |

---

## Audit Per Layer

---

### Layer 1: Database Repositories

#### `UserRepository.cs` — ❌ BROKEN
- Queries table `users` → **real table is `Users`**
- Selects columns: `id`, `email`, `full_name`, `profile_image` → **None of these exist** in `Users`. Real columns: `user_id`, `username`, `password_hash`, `role`
- `CreateUser` inserts `email`, `full_name` → **columns don't exist**
- `UserExists` checks `email` column → **doesn't exist**
- Password stored as plaintext, schema stores `password_hash`

#### `PatientRepository.cs` — ❌ BROKEN (Wrong Table)
- Queries table `patients` → **real table is `Patient_Profiles`**
- Selects `id`, `gender`, `dob`, `blood_group`, `phone`, `address`, `emergency_contact_name`, `emergency_contact_phone`, `status`, `reg_date` → **Almost none exist**. Real columns: `user_id`, `full_name`, `blood_type`, `emergency_contact`
- `Insert` method inserts into non-existent `patients` table with 11 phantom columns

#### `DoctorRepository.cs` — ❌ BROKEN (Wrong Table)
- Queries table `doctors` → **real table is `Doctor_Profiles`**
- Selects `id`, `specialty`, `title`, `email`, `phone`, `status`, `availability_text`, `experience_years`, `languages` → **None exist**. Real columns: `user_id`, `full_name`, `dept_id`

#### `AppointmentRepository.cs` — ❌ BROKEN (Wrong Tables + Columns)
- Joins `appointments` with `patients` and `doctors` → should join `Appointments` with `Patient_Profiles` and `Doctor_Profiles` via `Users`
- References `a.appointment_time`, `a.reason`, `a.clinical_notes` → **don't exist** in `Appointments`
- References `a.id` → real PK is `appointment_id`
- `MedicalRecords` queries: references `m.id`, `m.symptoms`, `m.treatment_plan`, `m.internal_notes`, `m.signed_by` → **don't exist**. Real columns: `record_id`, `diagnosis`, `prescription`

---

### Layer 2: Services

#### `AuthService.cs` — ❌ BROKEN
- Returns `email`, `fullName`, `profile_image` from DB — columns don't exist
- `RegisterUser` passes `email` to repository — doesn't exist
- No password hashing — passes raw password, schema expects `password_hash`

#### `PatientService.cs` — ❌ BROKEN
- Maps `gender`, `dob`, `blood_group`, `phone`, `address`, `emergency_contact_name`, `emergency_contact_phone`, `status`, `reg_date` — most don't exist
- Generates random `PT-XXXX` IDs — table uses `user_id` as FK, no separate ID column
- `CreatePatient` creates a patient without creating a `Users` row first (violates FK constraint)

#### `DoctorService.cs` — ❌ BROKEN
- Maps `specialty`, `title`, `email`, `phone`, `status`, `availability_text`, `experience_years`, `languages` — none exist in `Doctor_Profiles`

#### `AppointmentService.cs` — ❌ BROKEN
- All field mappings reference phantom columns
- `CreateAppointment` generates `APT-XXXX` string IDs — real PK is `INT AUTO_INCREMENT`
- `CreateMedicalRecord` generates `MR-XXXX` string IDs — real PK is `INT AUTO_INCREMENT`
- Medical record references `symptoms`, `treatment_plan`, `internal_notes`, `signed_by` — don't exist; real columns: `diagnosis`, `prescription`

---

### Layer 3: C# Bridge / MessageHandler

#### `MessageHandler.cs` — ⚠️ STRUCTURALLY OK, DATA BROKEN
- Routes are correct (LOGIN, REGISTER, GET_PATIENTS, etc.)
- `HandleAddPatient` extracts `gender`, `dob`, `phone`, `address` etc. — all phantom fields
- `HandleAddMedicalRecord` extracts `symptoms`, `treatmentPlan`, `internalNotes`, `signedBy` — phantom fields
- **Missing**: No handler for `DELETE_DOCTOR`, `GET_DEPARTMENTS`, `ADD_DOCTOR`, `DELETE_APPOINTMENT`

#### `WebViewBridge.cs` — ✅ OK
- `PostWebMessageAsJson` and `ExecuteScriptAsync` are correctly implemented

---

### Layer 4: Frontend Bridge (`bridge.ts`)

#### Interfaces — ❌ MISMATCHED WITH SCHEMA

| Interface | Phantom Fields (Don't Exist in DB) |
|---|---|
| `User` | `email`, `fullName`, `profileImage` |
| `Patient` | `gender`, `dob`, `phone`, `address`, `emergencyContactName`, `emergencyContactPhone`, `status`, `regDate` |
| `Doctor` | `specialty`, `title`, `email`, `phone`, `status`, `availabilityText`, `experienceYears`, `languages` |
| `Appointment` | `appointmentTime`, `reason`, `clinicalNotes` |
| `MedicalRecord` | `symptoms`, `treatmentPlan`, `internalNotes`, `signedBy` |

#### Bridge Methods — ⚠️ PATTERN OK, PAYLOAD BROKEN
- All WebView2 routing pattern is correct and functional
- `login()` sends `role` to C# — login should not need a role (role comes FROM the DB)
- `register()` sends `email`, `role` — email doesn't exist; should only register PATIENT
- `addPatient()` sends phantom fields
- No `getDepartments()`, `addDoctor()`, `deleteDoctor()`, `updatePatient()` methods

---

### Layer 5: React Components

#### `RegisterScreen.tsx` — ❌ ROLE VIOLATION
- Shows Patient / Doctor / Admin role selector
- **Must show Patient only** — Admin and Doctor options must be removed
- Sends `email` field — doesn't exist in schema
- State type `"admin" | "doctor" | "patient"` must be fixed to just `"patient"`

#### `LoginScreen.tsx` — ✅ ACCEPTABLE (Role selector is OK for login)
- Role selector is acceptable here — user picks their role to route to correct portal
- Minor: `email` is in the `User` interface but not in the DB

#### `AdminPortal.tsx` — ❌ MULTIPLE ISSUES
- **Patients table** shows: `gender`, `dob`, `phone`, `status` → `gender`, `dob`, `phone` exist in the **old fake repo** but NOT in schema. `status` doesn't exist either. Only valid: `full_name`, `blood_type`, `emergency_contact`
- **Doctors table** shows: `specialty`, `title`, `availability`, `status` → None exist. Only valid: `full_name`, `dept_id` (show dept name via join)
- Doctor specialty filter dropdowns are hardcoded, not from Departments table
- Dashboard `+12%` trend and `+3 specialists` text are **hardcoded fake data**
- Dashboard chart SVG is **static decorative**, not real data
- Add Doctor modal is **missing entirely** — only Add Patient and Add Appointment exist
- **Department management page is completely missing**
- `handleAddPatient` sends `gender`, `dob`, `phone`, `address` — all phantom
- `doctorId: "DR-8821"` hardcoded in DoctorPortal

#### `DoctorPortal.tsx` — ❌ HARDCODED FAKE DATA
- `docAppointments = appointments.filter(a => a.doctorId === "DR-8821" || a.doctorName.includes("Smith"))` → **HARDCODED FAKE FILTER**
- `docRecords` filtered by `"DR-8821"` and `"Smith"` → **HARDCODED FAKE FILTER**
- Doctor ID `"DR-8821"` hardcoded in `addMedicalRecord` call → should use `user.id`
- Patient modal shows Diagnoses: `"Diabetes Type 2"`, `"Hypertension"` → **hardcoded fake**
- Patient modal shows allergy: `"Known severe allergy response to Penicillin"` → **hardcoded fake**
- Department column shows `"Neurology Center, Wing Level 4"` → **hardcoded fake**
- `"Next slot: 10:30 AM"` in dashboard → **hardcoded fake**
- Shows `gender`, `dob`, `status` on patient cards → don't exist in schema

#### `PatientPortal.tsx` — ❌ MULTIPLE ISSUES
- Patient lookup: `patList.find(p => p.fullName.toLowerCase().includes(user.fullName.toLowerCase()))` → fragile name match, no ID-based join
- `handleUpdateProfile` calls `Bridge.getPatients()` and shows fake alert — **does not actually save anything**
- Profile page shows `phone`, `address` fields → don't exist in `Patient_Profiles`
- Blood group displayed as `patientProfile?.bloodGroup || "O+"` → the fallback `"O+"` is fake
- `"Dr. Smith signed"` hardcoded on record card → fake
- Appointment booking specialty dropdown: hardcoded `["Cardiology","Neurology","Pediatrics","General Medicine"]` → should come from `Departments` table
- Available time slots `["09:00 AM", ...]` are hardcoded, not validated against real data

---

## User Review Required

> [!CAUTION]
> **The entire repository and service layer must be rewritten** against the real schema. The existing `patients`, `doctors` tables referenced by repositories **do not exist** in `schema.sql`. Every SQL query will fail at runtime.

> [!WARNING]
> **Registration allows Doctor and Admin creation** — this is a security hole. Must restrict to Patient only immediately.

> [!IMPORTANT]
> **Doctor creation flow is completely missing** from the Admin panel. There is no "Add Doctor" form that inserts into `Users` (role=DOCTOR) + `Doctor_Profiles`.

> [!IMPORTANT]
> **Department management page does not exist**. The `Departments` table is in the schema but there is zero UI or backend code for it.

> [!CAUTION]
> **Patient profile update does nothing** — `handleUpdateProfile` calls `getPatients()` and shows an alert. No real save call is made.

> [!WARNING]
> **DoctorPortal hardcodes `"DR-8821"` and `"Smith"`** to filter appointments and records. A real logged-in doctor will see zero data.

---

## Open Questions

1. Should `Users` table store passwords as plaintext or with BCrypt hashing? (Currently schema says `password_hash` but the code stores plain text — which is correct for this app's scope?)
2. The schema has `emergency_contact VARCHAR(15)` as a single field. The UI splits it into `emergencyContactName` + `emergencyContactPhone`. Should the schema be updated to add a `emergency_contact_name` column, or should the UI be simplified to a single field?
3. The `Patient_Profiles` schema has no `gender`, `dob`, `phone`, `address` columns. Should these be added to the schema, or removed from ALL UI? *(Per your instructions: remove from UI unless adding columns is authorized.)*
4. The `Doctor_Profiles` schema has no `specialty` — only `dept_id`. Should Doctor specialty = Department name (fetched via JOIN)?
5. `Appointments.status` ENUM is `PENDING/CONFIRMED/COMPLETED/CANCELLED` — the UI uses `Pending/Approved/Completed/Cancelled`. Should the schema ENUM be updated to include `APPROVED` or should the UI use `CONFIRMED`?

---

## Proposed Changes (7-Phase Fix Plan)

---

### Phase 1 — Authentication Fixes

#### [MODIFY] [schema.sql](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Database/schema.sql)
- No changes needed to core tables — only operational fixes

#### [MODIFY] [UserRepository.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Repositories/UserRepository.cs)
- Fix table name `users` → `Users`
- Fix column references: `user_id` (not `id`), remove `email`/`full_name`/`profile_image`
- Login query: join `Users` with `Patient_Profiles` or `Doctor_Profiles` to get `full_name`
- `CreateUser`: insert only `username`, `password_hash`, `role`
- Add `CreatePatientProfile` method (inserts into `Patient_Profiles` after user creation)

#### [MODIFY] [AuthService.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Services/AuthService.cs)
- `ValidateCredentials`: remove `role` param from query (role comes from DB row), verify password against `password_hash`
- `RegisterUser`: remove `email` param; after inserting `Users` row, insert `Patient_Profiles` row; always role=PATIENT

#### [MODIFY] [RegisterScreen.tsx](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/components/RegisterScreen.tsx)
- Remove Doctor and Admin role buttons entirely
- Remove `email` field
- Fix state type to only `"patient"`
- Update `Bridge.register()` call to remove `email` and `role` params

#### [MODIFY] [bridge.ts](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/services/bridge.ts)
- Fix `User` interface: remove `email`, keep only `id`, `username`, `fullName`, `role`
- Fix `register()`: remove `email` and `role` params
- Fix `login()`: remove `role` from payload (role returned by server)

---

### Phase 2 — Admin Module Fixes

#### [MODIFY] [PatientRepository.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Repositories/PatientRepository.cs)
- Rewrite `FetchAll` to query `Patient_Profiles JOIN Users`; return `user_id`, `full_name`, `blood_type`, `emergency_contact`
- Rewrite `Insert` to only insert valid schema columns

#### [MODIFY] [PatientService.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Services/PatientService.cs)
- Fix `GetAllPatients`: map only real columns (`id`, `fullName`, `bloodType`, `emergencyContact`)
- Fix `CreatePatient`: remove phantom fields; create `Users` row + `Patient_Profiles` row

#### [MODIFY] [DoctorRepository.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Repositories/DoctorRepository.cs)
- Rewrite `FetchAll` to query `Doctor_Profiles JOIN Users JOIN Departments`; return `user_id`, `full_name`, `dept_name`
- Add `Insert` method (creates `Users` row + `Doctor_Profiles` row)
- Add `Delete` method

#### [MODIFY] [DoctorService.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Services/DoctorService.cs)
- Fix `GetAllDoctors`: map `id`, `fullName`, `deptName`
- Add `CreateDoctor(username, password, fullName, deptId)` method
- Add `DeleteDoctor(id)` method

#### [NEW] [DepartmentRepository.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Repositories/DepartmentRepository.cs)
- `FetchAll`: SELECT `dept_id`, `dept_name`, COUNT(dp.user_id) as doctor_count FROM `Departments` LEFT JOIN `Doctor_Profiles`
- `Insert(deptName)`, `Update(deptId, deptName)`, `Delete(deptId)`

#### [NEW] [DepartmentService.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Services/DepartmentService.cs)
- `GetAllDepartments()`, `CreateDepartment()`, `UpdateDepartment()`, `DeleteDepartment()`

#### [MODIFY] [MessageHandler.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Desktop/MessageHandler.cs)
- Add cases: `GET_DEPARTMENTS`, `ADD_DEPARTMENT`, `UPDATE_DEPARTMENT`, `DELETE_DEPARTMENT`
- Add cases: `ADD_DOCTOR`, `DELETE_DOCTOR`
- Fix `HandleAddPatient`: remove phantom fields, use real schema fields
- Fix `HandleAddMedicalRecord`: use real `diagnosis`, `prescription` fields

#### [MODIFY] [bridge.ts](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/services/bridge.ts)
- Fix `Patient` interface: remove `gender`, `dob`, `phone`, `address`, `status`, `regDate`; add `bloodType`, `emergencyContact`
- Fix `Doctor` interface: remove `specialty`, `title`, `email`, `phone`, `status`, `availabilityText`, `experienceYears`, `languages`; add `deptName`
- Add `Department` interface: `{ id: number; deptName: string; doctorCount: number }`
- Add `getDepartments()`, `addDepartment()`, `updateDepartment()`, `deleteDepartment()` methods
- Add `addDoctor()`, `deleteDoctor()` methods

#### [MODIFY] [AdminPortal.tsx](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/components/AdminPortal.tsx)
- **Patients table**: remove `gender`, `dob`, `phone`, `status` columns; show `fullName`, `bloodType`, `emergencyContact`
- **Doctors table**: remove `specialty`, `title`, `availability`, `status` columns; show `fullName`, `deptName`
- Fix Add Patient modal: remove `gender`, `dob`, `phone`, `address` fields; use `bloodType`, `emergencyContact`
- **Add "Add Doctor" modal**: fields = `username`, `password`, `fullName`, `dept_id` (dropdown from Departments)
- Remove hardcoded `+12%`, `+3 specialists` text
- Add real Department filter from DB
- **Add Department management section**

#### [NEW] Department management section in AdminPortal
- Table: dept_id, dept_name, doctor_count (from JOIN)
- Actions: Add, Edit, Delete

---

### Phase 3 — Doctor Module Fixes

#### [MODIFY] [DoctorPortal.tsx](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/components/DoctorPortal.tsx)
- **Remove `"DR-8821"` and `"Smith"` hardcoded filters** — filter by `user.id` instead
- Fix `addMedicalRecord` call: use `user.id` as `doctorId` instead of `"DR-8821"`
- Fix patient cards: remove `gender`, `dob`, `status`; show `bloodType`, `emergencyContact`
- Remove hardcoded diagnosis tags `("Diabetes Type 2", "Hypertension")`
- Remove hardcoded allergy alert `("Penicillin")`
- Remove hardcoded `"Neurology Center, Wing Level 4"` in appointment table
- Remove `"Next slot: 10:30 AM"` hardcoded badge
- Fix `MedicalRecord` interface usage: `symptoms`, `treatmentPlan`, `signedBy` → `diagnosis`, `prescription`

#### [MODIFY] [AppointmentRepository.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Repositories/AppointmentRepository.cs)
- Fix `FetchAll`: join `Appointments` with `Patient_Profiles` and `Doctor_Profiles` via `Users`; return real columns `appointment_id`, `patient_id`, `doctor_id`, `appointment_date`, `status`
- Remove phantom columns: `appointment_time`, `reason`, `clinical_notes`
- Fix `Insert`: use only real columns
- Fix `FetchAllMedicalRecords`: use `Medical_Records` columns: `record_id`, `patient_id`, `doctor_id`, `diagnosis`, `prescription`, `visit_date`
- Fix `InsertMedicalRecord`: use real columns

#### [MODIFY] [AppointmentService.cs](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/Services/AppointmentService.cs)
- Fix `GetAllAppointments`: map real columns
- Fix `CreateAppointment`: use INT auto-increment, not string ID
- Fix `GetAllMedicalRecords`: map `diagnosis`, `prescription` (not `symptoms`, `treatmentPlan`)
- Fix `CreateMedicalRecord`: use real columns

#### [MODIFY] [bridge.ts](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/services/bridge.ts)
- Fix `Appointment` interface: remove `appointmentTime`, `reason`, `clinicalNotes`; keep `appointment_date`, `status`
- Fix `MedicalRecord` interface: remove `symptoms`, `treatmentPlan`, `internalNotes`, `signedBy`; use `diagnosis`, `prescription`

---

### Phase 4 — Patient Module Fixes

#### [MODIFY] [PatientPortal.tsx](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/components/PatientPortal.tsx)
- Fix patient lookup: use `user.id` to find the matching `Patient_Profiles` record, NOT name fuzzy match
- **Remove `phone`, `address` from profile display and edit form** (don't exist in schema)
- Fix `handleUpdateProfile`: make a real bridge call (`updatePatientProfile`) or note this is currently broken
- Remove `"O+"` hardcoded blood group fallback — show empty if null
- Fix appointment booking: load departments from `getDepartments()` bridge call, not hardcoded list
- Fix `"Dr. Smith signed"` → use `selectedRecord.signedBy` (already done) — but clean it up
- Booking: filter doctors by `deptId` instead of `specialty` name

#### [MODIFY] [bridge.ts](file:///c:/Users/Joseph/OneDrive/Desktop/csharp/medicalcare/src/services/bridge.ts)
- Add `updatePatientProfile(userId, data)` method

---

### Phase 5 — Department Management

- Already covered in Phase 2 above (DepartmentRepository, DepartmentService, MessageHandler additions, AdminPortal section)

---

### Phase 6 — Data Verification

- Audit all dashboard card counts — all must come from `patients.length`, `doctors.length`, `appointments.length`
- Remove all static SVG charts or replace with real computed data
- Verify all dropdowns (doctor lists, patient lists, department lists) are populated from bridge calls
- Verify delete patient / delete doctor flow propagates through bridge → service → repository → DB

---

### Phase 7 — Final Testing

- Seed DB with a test admin user, 2 doctors, 2 patients, 2 appointments
- Verify full registration flow (patient only)
- Verify login flow for all 3 roles
- Verify Admin CRUD: patients, doctors, departments, appointments
- Verify Doctor portal: sees own appointments by `user.id`, creates medical records
- Verify Patient portal: profile loads by `user.id`, books appointment, views records

---

## Verification Plan

### Automated Tests
- `dotnet build` — verify C# compiles after all repository/service changes
- `npm run build` — verify TypeScript compiles with fixed interfaces

### Manual Verification
- Start app → Register as Patient → Verify DB has `Users` row + `Patient_Profiles` row
- Login as Admin → Verify dashboard counts match DB row counts (not hardcoded)
- Admin Doctors page → Add Doctor → Verify DB has `Users` + `Doctor_Profiles` rows
- Admin Departments page → Add/Edit/Delete
- Login as Doctor → Verify appointments filtered by real `user.id`
- Login as Patient → Book appointment → Verify `Appointments` row in DB
