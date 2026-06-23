# MediCare Hospital Management System (HMS)

A secure, enterprise-grade clinical workspace featuring an administrative panel, a doctor portal, and a patient management system. The application coordinates healthcare administration, appointment booking, clinical notes logging, and patient record management.

---

## 🏗️ System Architecture

The application is structured as a **hybrid workspace** that merges a modern responsive web interface with a high-performance native Windows client wrapper.

```
       +--------------------------------------------+
       |   React 18 / Vite / TypeScript Frontend    |
       |  (Responsive Views, Styled with Tailwind)  |
       +---------------------+----------------------+
                             |
                   Web Messaging (JSON RPC)
                             |
                             v
       +---------------------+----------------------+
       |       Microsoft Edge WebView2 Control      |
       +---------------------+----------------------+
                             |
                     WebViewBridge.cs
                             v
       +---------------------+----------------------+
       |         C# Windows Forms Application       |
       |                (.NET 8.0 Core)             |
       +--+------------------+-------------------+--+
          |                  |                   |
          v                  v                   v
   +--------------+   +--------------+   +---------------+
   | AuthService  |   | PatientServ  |   | AppointmentSvc|
   +------+-------+   +------+-------+   +-------+-------+
          |                  |                   |
          v                  v                   v
   +------+-------+   +------+-------+   +-------+-------+
   |  UserRepo    |   | PatientRepo  |   |   ApptRepo    |
   +------+-------+   +------+-------+   +-------+-------+
          |                  |                   |
          +------------------+-------------------+
                             |
                       MySqlConnector
                             v
               +-------------+-------------+
               | MySQL / MariaDB Database   |
               +---------------------------+
```

### 1. The Lightweight Web Interface (React + Vite)

- **Tech Stack**: React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Design Paradigm**: Crisp, high-contrast **Light Mode** styling with generous white space, custom typography, subtle interactive hover-states, and fluid layouts.
- **Responsiveness**: Designed with dynamic responsive utility classes (`sm:`, `md:`, `lg:`, `xl:`) and an adjustable slide-out drawer navigation to display beautifully on phones, tablets, and wide screens.
- **Interoperability**: Interacts with the host environment through standard JSON RPC payloads dispatched using `window.chrome.webview.postMessage` on WebView2.

### 2. High-Performance Native Host (C# WinForms Client)

- **Tech Stack**: Microsoft .NET 8.0-windows, Microsoft.Web.WebView2 Client Runtime.
- **Core Process**: Hosts the compiled web bundles in an optimal Chromium-based web container.
- **RPC Bridging**: `WebViewBridge.cs` and `MessageHandler.cs` catch and deserialize JSON payloads into runtime structures, routing requests to domain services.

### 3. Business logic & Persistence Infrastructure

- **Services layer**: `AuthService`, `PatientService`, `DoctorService`, and `AppointmentService` perform strict validation and structure transaction sequences.
- **Repositories layer**: ADO.NET abstraction (`UserRepository`, `PatientRepository`, `DoctorRepository`, `AppointmentRepository`) that processes optimized parameterized prepared statements directly on the database engine.
- **Database Service**: Standardized relational MySQL/MariaDB backing state.

---

## 🛠️ Prerequisites

To build and launch the platform entirely on your developer workstation, ensure you have configured:

1. **Node.js** (v18.x or v20.x recommended) alongside `npm`.
2. **.NET 8.0 SDK** (Installed on a developer system with Windows desktop-workload targets).
3. **MySQL Server** (v8.0+) or **MariaDB Server** (v10.4+).
4. **WebView2 Runtime** (Pre-installed natively on Windows 10/11 operating systems).

---

## 🗄️ Database Setup Instructions

The application interfaces with a relational MySQL schema. Follow these phases to configure and initialize your database.

If you run the desktop app through `dotnet run`, it will initialize the database from `Database/schema.sql` and `Database/seed.sql` automatically before opening the WinForms WebView host.

### 1. Database Provisioning & Schema Import

Connect to your local or remote MySQL shell or preferred client (e.g., MySQL Workbench, DBeaver) as an administrative user and run the initial setup script provided under `/Database/schema.sql`:

```sql
-- Connect to MySQL and create the schema
CREATE DATABASE IF NOT EXISTS medicare_hms;
USE medicare_hms;
```

Now, apply the tables structure from `/Database/schema.sql`:

- **`users` Table**: Encapsulates clinical accounts for administrators, doctors, and patients.
- **`doctors` Table**: Registers medical backgrounds, clinical specialties, and availability markers.
- **`patients` Table**: Standard clinical profiles including date of birth, blood group metrics, and emergency contact registries.
- **`appointments` Table**: Records calendars, patient symptoms, and booking statuses (`Pending`, `Approved`, `Completed`, `Cancelled`).
- **`medical_records` Table**: Holds patient diagnostics (ICD-10 matched clinical descriptors) and official doctor treatment signatures.

```bash
# Execute schema via terminal command
mysql -u root -p medicare_hms < Database/schema.sql
```

Use the MySQL account you specified for local development when prompted for the password.

If you want a one-command local setup on Windows, run the helper script instead:

```powershell
.\scripts\setup-db.ps1
```

### 2. Seeding Sandbox Data

To test portals using realistic, pre-populated accounts, run the seed values provided in `/Database/seed.sql`:

```bash
# Seed records and accounts
mysql -u root -p medicare_hms < Database/seed.sql
```

After these two commands complete, the runtime data source is the MySQL database. The app reads from `medicare_hms` at launch, not from `Database/database.json`.

#### Pre-Configured Test Credentials:

Use these pre-loaded profiles to log into your portal and test feature domains:

| Role              | Username    | Password  | Full Name          | Specialty / Details                     |
| :---------------- | :---------- | :-------- | :----------------- | :-------------------------------------- |
| **Administrator** | `admin`     | `admin`   | Admin User         | Core System Coordinator                 |
| **Doctor**        | `dr_smith`  | `doctor`  | Dr. Julianne Smith | Neurology (Senior Clinical Neurologist) |
| **Doctor**        | `dr_patel`  | `doctor`  | Dr. Amit Patel     | Pediatrics (Resident Pediatrician)      |
| **Patient**       | `eleanor_m` | `patient` | Eleanor Mitchell   | O+ blood group, active appointments     |
| **Patient**       | `ahmed`     | `patient` | Ahmed Ali          | B+ blood group, active records          |

### 3. C# Database Connection Configuration

The C# Repository layer connects using an environment variable named `MYSQL_CONN`.

If `MYSQL_CONN` is not found on your system environment, the repositories fall back to a standard localhost connection string:
`Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;`

#### Custom Connection Strings:

You can overwrite this parameters on shell startups or config files:

- **Windows PowerShell**:
  ```powershell
  $env:MYSQL_CONN="Server=your_host_address;Database=medicare_hms;Uid=your_username;Pwd=your_password;"
  ```
- **Bash Shell**:
  ```bash
  export MYSQL_CONN="Server=your_host_address;Database=medicare_hms;Uid=your_username;Pwd=your_password;"
  ```

---

## 🌐 Frontend Development & Setup

First, launch the React/Vite development server to host the healthcare visual interface.

### 1. Install Dependencies

Restore the project's JavaScript modules package tree:

```bash
npm install
```

### 2. Launch Development Web Preview

Boot the Vite dev pipeline. The development build runs by default on port `3000`:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) using any modern web browser to view the light, responsive administrative interface.

---

## 🖥️ Launching the C# Windows Application (`dotnet run`)

After starting the frontend web view, you can execute the native C# application shell.

### 1. Point the Wrapper to your Web Host URL (Optional)

The C# desktop wrapper looks for the `APP_URL` environment variable to configure the target URL to load into Microsoft WebView2. It defaults to `http://localhost:3000` if not set.

If your frontend is running on a different port or host environment, set the variable:

```bash
# Example
export APP_URL="http://localhost:3001"
```

### 2. Restore Nuget Dependencies & Execute Client

Under the parent workspace folder where `HospitalManagementSystem.csproj` resides, run:

```bash
# Restore local NuGet packages (Newtonsoft.Json, Microsoft.Web.WebView2, MySql.Data)
dotnet restore

# Build and execute the application
dotnet run
```

Launch order matters: seed MySQL first, start the React dev server with `npm run dev`, and then start the WinForms app so WebView2 can load the UI from `http://localhost:3000`.

For a one-command Windows launch, run `.\scripts\start-app.ps1` from the project root. It starts the frontend and then launches the desktop host with `APP_URL` pointed at the Vite server.

---

## 🛠️ Project File Directory Structure

```
├── Database/
│   ├── schema.sql              # MySQL DDL Schemas
│   └── seed.sql                # Initial Sandbox accounts and clinical logs
├── Desktop/
│   ├── MainForm.cs             # Primary Windows Container Form (Configures WebView2)
│   ├── WebViewBridge.cs        # Bridge module invoking injected JS methods on the Web Thread
│   ├── MessageHandler.cs       # Decodes incoming JSON RPC and triggers C# Domain Services
│   └── Program.cs              # Application entry point [STAThread]
├── Services/
│   ├── AuthService.cs          # Validates credentials and handles user creation
│   ├── PatientService.cs       # Controls patient enrollment logs
│   ├── DoctorService.cs        # Registers doctor clinical profiles
│   └── AppointmentService.cs   # Organizes appointments and medical record creations
├── Repositories/
│   ├── UserRepository.cs       # Parameters processing on SQL users records
│   ├── PatientRepository.cs    # SQL transactions for patients clinical charts
│   ├── DoctorRepository.cs     # SQL registers for doctors clinic tracking
│   └── AppointmentRepository.cs# Appointments details and medical diagnosis logs
├── src/
│   ├── components/             # Portal panels (AdminPortal, DoctorPortal, PatientPortal)
│   ├── services/               # Javascript bridge connectors
│   ├── App.tsx                 # Core layout router (responsive sidebar overlay coordination)
│   └── index.css               # Global tailwind assets
└── HospitalManagementSystem.csproj  # Target .NET 8.0 SDK configurations and libraries
```

---

## 🛡️ Support, Troubleshooting & Fallbacks

- **Empty Screen on C# Startup**: Make sure the React frontend development server is running on `http://localhost:3000` (or match the address configured on your custom `APP_URL` environment variable).
- **Missing MySql assemblies**: Ensure NuGet has executed correctly: `dotnet restore`.
- **Database Connection Terminated**: Verify that your MySQL server is active on the configured port and credentials are matching the parameters in your `MYSQL_CONN` env variable.
