/**
 * Hospital Management System Bridge Service
 * Handles transparent communication with either standard Node Express REST Endpoints
 * (during browser rendering/testing) OR the hosted C# WinForms WebView2 Native Bridge.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  profileImage?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: "Active" | "Inactive";
  regDate: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  title: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "In Visit";
  availabilityText: string;
  experienceYears: number;
  languages: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  clinicalNotes?: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatmentPlan: string;
  internalNotes?: string;
  signedBy: string;
}

class BridgeService {
  // Query if the app runs inside the Microsoft Edge WebView2 client wrapper
  private isWebView2Available(): boolean {
    return (
      typeof window !== "undefined" &&
      (window as any).chrome !== undefined &&
      (window as any).chrome.webview !== undefined
    );
  }

  // Generic message emitter to C# environment
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

  // 1. Authenticate Log In
  public async login(
    username: string,
    password: string,
    role: string,
  ): Promise<User> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "LOGIN_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else reject(new Error(data.error || "Login validation failed"));
            }
          } catch {}
        });

        // Register the listener before sending the request so fast native responses are not missed.
        this.postToC_Sharp("LOGIN", { username, password, role });
      });
    }

    // Default Browser Fallback (Express DB)
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.user;
  }

  // 2. Authenticate Registration
  public async register(
    fullName: string,
    username: string,
    email: string,
    password: string,
    role: string,
  ): Promise<User> {
    if (this.isWebView2Available()) {
      return new Promise((resolve, reject) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "REGISTER_RESPONSE") {
              removeListener();
              if (data.success) resolve(data.payload);
              else
                reject(new Error(data.error || "Register validation failed"));
            }
          } catch {}
        });

        this.postToC_Sharp("REGISTER", {
          fullName,
          username,
          email,
          password,
          role,
        });
      });
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, username, email, password, role }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.user;
  }

  // 3. fetch Patients List
  public async getPatients(): Promise<Patient[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "GET_PATIENTS_RESPONSE") {
              removeListener();
              resolve(data.payload);
            }
          } catch {}
        });

        this.postToC_Sharp("GET_PATIENTS", {});
      });
    }

    const response = await fetch("/api/patients");
    const result = await response.json();
    return result.patients;
  }

  // 4. Create Patient
  public async addPatient(patient: Partial<Patient>): Promise<Patient> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "ADD_PATIENT_RESPONSE") {
              removeListener();
              resolve(data.payload);
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
    return result.patient;
  }

  // 5. Delete Patient (Useful for Admin module CRUD deletions)
  public async deletePatient(id: string): Promise<void> {
    if (this.isWebView2Available()) {
      this.postToC_Sharp("DELETE_PATIENT", { id });
      return;
    }
    await fetch(`/api/patients/${id}`, { method: "DELETE" });
  }

  // 6. fetch Doctors list
  public async getDoctors(): Promise<Doctor[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "GET_DOCTORS_RESPONSE") {
              removeListener();
              resolve(data.payload);
            }
          } catch {}
        });

        this.postToC_Sharp("GET_DOCTORS", {});
      });
    }

    const response = await fetch("/api/doctors");
    const result = await response.json();
    return result.doctors;
  }

  // 7. fetch Appointments list
  public async getAppointments(): Promise<Appointment[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "GET_APPOINTMENTS_RESPONSE") {
              removeListener();
              resolve(data.payload);
            }
          } catch {}
        });

        this.postToC_Sharp("GET_APPOINTMENTS", {});
      });
    }

    const response = await fetch("/api/appointments");
    const result = await response.json();
    return result.appointments;
  }

  // 8. Create Appointment
  public async addAppointment(
    appt: Partial<Appointment>,
  ): Promise<Appointment> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "ADD_APPOINTMENT_RESPONSE") {
              removeListener();
              resolve(data.payload);
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

  // 9. Update Appointment status
  public async updateAppointmentStatus(
    id: string,
    status: string,
  ): Promise<boolean> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "UPDATE_APPOINTMENT_STATUS_RESPONSE") {
              removeListener();
              resolve(data.success);
            }
          } catch {}
        });

        this.postToC_Sharp("UPDATE_APPOINTMENT_STATUS", {
          appointmentId: id,
          status,
        });
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

  // 10. fetch Medical records list
  public async getMedicalRecords(): Promise<MedicalRecord[]> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "GET_MEDICAL_RECORDS_RESPONSE") {
              removeListener();
              resolve(data.payload);
            }
          } catch {}
        });

        this.postToC_Sharp("GET_MEDICAL_RECORDS", {});
      });
    }

    const response = await fetch("/api/medical-records");
    const result = await response.json();
    return result.medicalRecords;
  }

  // 11. Create Medical record
  public async addMedicalRecord(
    record: Partial<MedicalRecord>,
  ): Promise<MedicalRecord> {
    if (this.isWebView2Available()) {
      return new Promise((resolve) => {
        const removeListener = this.addWebViewMessageListener((messageData) => {
          try {
            const data =
              typeof messageData === "string"
                ? JSON.parse(messageData)
                : messageData;
            if (data.action === "ADD_MEDICAL_RECORD_RESPONSE") {
              removeListener();
              resolve(data.payload);
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
}

export const Bridge = new BridgeService();
