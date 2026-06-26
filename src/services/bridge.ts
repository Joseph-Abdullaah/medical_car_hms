/**
 * Hospital Management System Bridge Service
 * Handles communication with either WebView2 native bridge or Express REST fallback.
 */

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: "admin" | "doctor" | "patient";
  email?: string;
  profileImage?: string;
}

// Matches Users + Patient_Profiles schema exactly
export interface Patient {
  id: string;
  username: string;
  fullName: string;
  bloodType: string;
  gender: string;
  phone: string;
  address: string;
}

// Matches Users + Doctor_Profiles + Departments schema exactly
export interface Doctor {
  id: string;
  username: string;
  fullName: string;
  deptId: number;
  deptName: string;
}

// Matches Departments schema with computed doctorCount
export interface Department {
  id: number;
  deptName: string;
  doctorCount: number;
}

// Matches Appointments schema. appointmentDate = "yyyy-MM-dd", appointmentTime = "HH:mm".
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

// Matches Medical_Records schema exactly.
export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  diagnosis: string;
  prescription: string;
  // Optional legacy fields — not in DB schema; kept until DoctorPortal is updated
  symptoms?: string;
  treatmentPlan?: string;
  internalNotes?: string;
  signedBy?: string;
}

class BridgeService {
  private isWebView2Available(): boolean {
    return (
      typeof window !== "undefined" &&
      (window as any).chrome !== undefined &&
      (window as any).chrome.webview !== undefined
    );
  }

  private postToC_Sharp(action: string, payload: any) {
    if (this.isWebView2Available()) {
      (window as any).chrome.webview.postMessage({ action, payload });
    }
  }

  private addWebViewMessageListener(handler: (data: any) => void) {
    const webview = (window as any).chrome.webview;
    const wrappedHandler = (event: any) => handler(event.data);
    webview.addEventListener("message", wrappedHandler);
    return () => webview.removeEventListener("message", wrappedHandler);
  }

  // ── AUTH ─────────────────────────────────────────────────────────────────────

  public async login(username: string, password: string, role: string): Promise<User> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "LOGIN_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else reject(new Error(data.error || "Login failed"));
            }
          } catch {}
        });
        this.postToC_Sharp("LOGIN", { username, password, role });
      });
    }
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.user;
  }

  public async register(
    fullName: string,
    username: string,
    password: string,
    bloodType: string,
    gender: "Male" | "Female",
    phone: string,
    address: string,
  ): Promise<User> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "REGISTER_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else reject(new Error(data.error || "Registration failed"));
            }
          } catch {}
        });
        this.postToC_Sharp("REGISTER", { fullName, username, password, bloodType, gender, phone, address });
      });
    }
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, username, password, bloodType, gender, phone, address }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.user;
  }

  // ── PATIENTS ─────────────────────────────────────────────────────────────────

  public async getPatients(): Promise<Patient[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "GET_PATIENTS_RESPONSE") {
              removeListener();
              resolve(data.payload ?? []);
            }
          } catch {}
        });
        this.postToC_Sharp("GET_PATIENTS", {});
      });
    }
    const response = await fetch("/api/patients");
    const result = await response.json();
    return result.patients ?? [];
  }

  public async addPatient(patient: Partial<Patient> & { username?: string; password?: string }): Promise<Patient> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "ADD_PATIENT_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else reject(new Error(data.error || "Failed to add patient"));
            }
          } catch {}
        });
        this.postToC_Sharp("ADD_PATIENT", patient);
      });
    }
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.patient;
  }

  public async deletePatient(id: string): Promise<void> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "DELETE_PATIENT_RESPONSE") {
              removeListener();
              resolve();
            }
          } catch {}
        });
        this.postToC_Sharp("DELETE_PATIENT", { id });
      });
    }
    await fetch(`/api/patients/${id}`, { method: "DELETE" });
  }

  public async updatePatientProfile(
    userId: number,
    fullName: string,
    bloodType: string,
    gender: string,
    phone: string,
    address: string,
  ): Promise<boolean> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "UPDATE_PATIENT_PROFILE_RESPONSE") {
              removeListener();
              resolve(data.success);
            }
          } catch {}
        });
        this.postToC_Sharp("UPDATE_PATIENT_PROFILE", { userId, fullName, bloodType, gender, phone, address });
      });
    }
    const response = await fetch(`/api/patients/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, bloodType, gender, phone, address }),
    });
    const result = await response.json();
    return result.success;
  }

  // ── DOCTORS ──────────────────────────────────────────────────────────────────

  public async getDoctors(): Promise<Doctor[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "GET_DOCTORS_RESPONSE") {
              removeListener();
              resolve(data.payload ?? []);
            }
          } catch {}
        });
        this.postToC_Sharp("GET_DOCTORS", {});
      });
    }
    const response = await fetch("/api/doctors");
    const result = await response.json();
    return result.doctors ?? [];
  }

  public async addDoctor(
    fullName: string,
    username: string,
    password: string,
    deptId: number,
  ): Promise<Doctor> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "ADD_DOCTOR_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else reject(new Error(data.error || "Failed to create doctor"));
            }
          } catch {}
        });
        this.postToC_Sharp("ADD_DOCTOR", { fullName, username, password, deptId });
      });
    }
    const response = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, username, password, deptId }),
    });
    const result = await response.json();
    return result.doctor;
  }

  public async updateDoctor(
    id: string,
    fullName: string,
    deptId: number,
    newPassword: string,
  ): Promise<boolean> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "UPDATE_DOCTOR_RESPONSE") {
              removeListener();
              resolve(data.success);
            }
          } catch {}
        });
        this.postToC_Sharp("UPDATE_DOCTOR", { userId: id, fullName, deptId, newPassword });
      });
    }
    const response = await fetch(`/api/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, deptId, newPassword }),
    });
    const result = await response.json();
    return result.success;
  }

  public async deleteDoctor(id: string): Promise<boolean> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "DELETE_DOCTOR_RESPONSE") {
              removeListener();
              resolve(data.success);
            }
          } catch {}
        });
        this.postToC_Sharp("DELETE_DOCTOR", { userId: id });
      });
    }
    const response = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    const result = await response.json();
    return result.success;
  }

  // ── APPOINTMENTS ─────────────────────────────────────────────────────────────

  public async getAppointments(): Promise<Appointment[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "GET_APPOINTMENTS_RESPONSE") {
              removeListener();
              resolve(data.payload ?? []);
            }
          } catch {}
        });
        this.postToC_Sharp("GET_APPOINTMENTS", {});
      });
    }
    const response = await fetch("/api/appointments");
    const result = await response.json();
    return result.appointments ?? [];
  }

  public async addAppointment(appt: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "ADD_APPOINTMENT_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else reject(new Error(data.error || "Failed to schedule appointment"));
            }
          } catch {}
        });
        this.postToC_Sharp("ADD_APPOINTMENT", appt);
      });
    }
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appt),
    });
    const result = await response.json();
    return result.appointment;
  }

  public async updateAppointmentStatus(id: string, status: string): Promise<boolean> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "UPDATE_APPOINTMENT_STATUS_RESPONSE") {
              removeListener();
              resolve(data.success);
            }
          } catch {}
        });
        this.postToC_Sharp("UPDATE_APPOINTMENT_STATUS", { appointmentId: id, status });
      });
    }
    const response = await fetch(`/api/appointments/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    return result.success;
  }

  // ── MEDICAL RECORDS ───────────────────────────────────────────────────────────

  public async getMedicalRecords(): Promise<MedicalRecord[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "GET_MEDICAL_RECORDS_RESPONSE") {
              removeListener();
              resolve(data.payload ?? []);
            }
          } catch {}
        });
        this.postToC_Sharp("GET_MEDICAL_RECORDS", {});
      });
    }
    const response = await fetch("/api/medical-records");
    const result = await response.json();
    return result.medicalRecords ?? [];
  }

  public async addMedicalRecord(record: {
    patientId: string;
    doctorId: string;
    diagnosis: string;
    prescription: string;
    visitDate: string;
  }): Promise<MedicalRecord> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "ADD_MEDICAL_RECORD_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else reject(new Error(data.error || "Failed to add medical record"));
            }
          } catch {}
        });
        this.postToC_Sharp("ADD_MEDICAL_RECORD", record);
      });
    }
    const response = await fetch("/api/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    const result = await response.json();
    return result.medicalRecord;
  }

  // ── DEPARTMENTS ───────────────────────────────────────────────────────────────

  public async getDepartments(): Promise<Department[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "GET_DEPARTMENTS_RESPONSE") {
              removeListener();
              resolve(data.payload ?? []);
            }
          } catch {}
        });
        this.postToC_Sharp("GET_DEPARTMENTS", {});
      });
    }
    const response = await fetch("/api/departments");
    const result = await response.json();
    return result.departments ?? [];
  }

  public async addDepartment(dept: Partial<Department>): Promise<Department> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "ADD_DEPARTMENT_RESPONSE") {
              removeListener();
              if (data.payload) resolve(data.payload);
              else reject(new Error("Failed to add department"));
            }
          } catch {}
        });
        this.postToC_Sharp("ADD_DEPARTMENT", dept);
      });
    }
    const response = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dept),
    });
    const result = await response.json();
    return result.department;
  }

  public async updateDepartment(id: number, dept: Partial<Department>): Promise<boolean> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "UPDATE_DEPARTMENT_RESPONSE") {
              removeListener();
              resolve(data.success);
            }
          } catch {}
        });
        this.postToC_Sharp("UPDATE_DEPARTMENT", { id, ...dept });
      });
    }
    const response = await fetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dept),
    });
    const result = await response.json();
    return result.success;
  }

  public async deleteDepartment(id: number): Promise<boolean> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data = typeof messageData === "string" ? JSON.parse(messageData) : messageData;
            if (data.action === "DELETE_DEPARTMENT_RESPONSE") {
              removeListener();
              resolve(data.success);
            }
          } catch {}
        });
        this.postToC_Sharp("DELETE_DEPARTMENT", { id });
      });
    }
    const response = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    const result = await response.json();
    return result.success;
  }
}

export const Bridge = new BridgeService();
