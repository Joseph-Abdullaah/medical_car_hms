# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏥 Project Overview
This is the MediCare Hospital Management System (HMS), a hybrid application consisting of:
- A React/Vite/TypeScript frontend (responsive web interface)
- A C# .NET 8.0 Windows Forms host with WebView2 hosting the web interface
- A MySQL/MariaDB database backend accessed via ADO.NET repositories

See [README.md](./README.md) for detailed architecture diagrams and technology stack.

## 🛠️ Development Workflow

### Prerequisites
- Node.js (v18.x or v20.x) + npm
- .NET 8.0 SDK
- MySQL Server (v8.0+) or MariaDB Server (v10.4+)
- WebView2 Runtime (pre-installed on Windows 10/11)

### Database Setup
1. Create database and schema:
   ```bash
   mysql -u root -p medicare_hms < Database/schema.sql
   ```
2. Seed with test data:
   ```bash
   mysql -u root -p medicare_hms < Database/seed.sql
   ```
3. Alternative Windows PowerShell setup:
   ```powershell
   .\scripts\setup-db.ps1
   ```

### Frontend Development (React/Vite/TypeScript)
- Install dependencies: `npm install`
- Start development server: `npm run dev` (runs on http://localhost:3000)
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint/Type-check: `npm run lint` (runs `tsc --noEmit`)

### Backend Development (C# Windows Forms)
- Restore NuGet packages: `dotnet restore`
- Build solution: `dotnet build`
- Run application: `dotnet run`
  - **Important**: Start frontend dev server (`npm run dev`) first so WebView2 can load the UI
  - The app reads the frontend URL from `APP_URL` environment variable (defaults to `http://localhost:3000`)
- One-click Windows startup: `.\scripts\start-app.ps1` (starts frontend then backend)

### Environment Variables
- `MYSQL_CONN`: MySQL connection string (format: `Server=host;Database=medicare_hms;Uid=username;Pwd=password;`)
  - Fallback: `Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;`
- `APP_URL`: Frontend URL for WebView2 (defaults to `http://localhost:3000`)

## 🏗️ Architecture Overview

### High-Level Structure
```
Root
├── Database/                 # SQL schema and seed files
├── Desktop/                  # C# WinForms host application
│   ├── MainForm.cs           # Main window hosting WebView2
│   ├── WebViewBridge.cs       # JS↔C# message passing
│   ├── MessageHandler.cs      {\n {1,method} 
 "params:{  }
   
│   ├── Program.cs              # Application entry point
│   └── DatabaseInitializer.cs  # DB schema/seeding on startup
├── Services/                 # C# business logic services
│   ├── AuthService.cs
│   ├── PatientService.cs
│   ├── DoctorService.cs
│   └── AppointmentService.cs
├── Repositories/             # ADO.NET data access layer
│   ├── UserRepository.cs
│   ├── PatientRepository.cs
│   ├── DoctorRepository.cs
│   └── AppointmentRepository.cs
└── src/                      # React/TypeScript frontend
    ├── App.tsx               # Main app router with responsive sidebar
    ├── components/           # Portal panels (AdminPortal, DoctorPortal, PatientPortal)
    ├── services/             # JS bridge connectors (bridge.ts)
    └── index.css             # Global Tailwind styles

### Data Flow
1. **Frontend** ↔ **WebView2 Bridge**: JSON-RPC messages via `window.chrome.webview.postMessage`
2. **WebView2 Host** → **MessageHandler.cs**: Deserializes JSON, routes to C# services
3. **Services Layer**: Validates input, orchestrates transactions
4. **Repositories Layer**: Executes parameterized SQL queries against MySQL
5. **Database**: MySQL/MariaDB stores all application data

### Key Integration Points
- **WebViewBridge.cs**: Injects JavaScript into WebView2 to expose C# methods via `window.chrome.webview.postMessage`
- **MessageHandler.cs**: Maps incoming JSON-RPC method calls to service methods (e.g., `auth.login` → `AuthService.Login`)
- **Services**: Contain business logic (validation, transaction management)
- **Repositories**: Direct ADO.NET access with parameterized queries (no ORM)

## 💡 Development Tips

### Debugging
- **Frontend**: Standard React devtools via browser when running `npm run dev`
- **Backend**: Attach debugger to `dotnet run` process or use Visual Studio
- **Bridge Communication**: Check browser console for WebView2 messages; enable WebView2 logging if needed

### Database Connections
- Repositories read `MYSQL_CONN` environment variable at runtime
- For testing, set `MYSQL_CONN` before running the app:
  ```bash
  $env:MYSQL_CONN="Server=localhost;Database=medicare_hms;Uid=test;Pwd=test;"
  dotnet run
  ```

### Common Tasks
- **Adding a new API endpoint**: 
  1. Add method to relevant Service class
  2. Add repository method if needed
  3. Add JSON-RPC handler in MessageHandler.cs
  4. Call from frontend via bridge.ts
- **Modifying database schema**: 
  1. Update `Database/schema.sql`
  2. Update relevant Repository classes
  3. Update Service layer if business logic changes
  4. Update frontend service calls if needed

### Testing
- No formal test framework configured yet; manual testing via running the application
- Backend logic can be tested by instantiating Service classes directly
- Frontend components can be tested via React devtools and manual interaction

## 📝 Notes
- The application expects the frontend to be running on `http://localhost:3000` by default
- Database initialization occurs automatically on app startup if tables don't exist
- Passwords are stored in plaintext (as per current schema) - for demo purposes only
- Tailwind CSS is used for styling; see `src/index.css` and component classes