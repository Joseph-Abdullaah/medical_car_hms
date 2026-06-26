using System;
using Newtonsoft.Json;
using HospitalManagementSystem.Services;

namespace HospitalManagementSystem.Desktop
{
    public static class MessageHandler
    {
        private static readonly AuthService        AuthService        = new AuthService();
        private static readonly PatientService     PatientService     = new PatientService();
        private static readonly DoctorService      DoctorService      = new DoctorService();
        private static readonly AppointmentService AppointmentService = new AppointmentService();
        private static readonly DepartmentService  DepartmentService  = new DepartmentService();

        public static void HandleIncomingWebMessage(string rawMessage, WebViewBridge bridge)
        {
            try
            {
                dynamic webRequest = JsonConvert.DeserializeObject<dynamic>(rawMessage);
                if (webRequest == null) return;

                string  action  = (string)webRequest.action;
                dynamic payload = webRequest.payload;

                Console.WriteLine($"[Bridge] Action: {action}");

                switch (action)
                {
                    case "LOGIN":                    HandleLogin(payload, bridge);                  break;
                    case "REGISTER":                 HandleRegister(payload, bridge);               break;
                    case "GET_PATIENTS":             HandleGetPatients(bridge);                     break;
                    case "ADD_PATIENT":              HandleAddPatient(payload, bridge);             break;
                    case "DELETE_PATIENT":           HandleDeletePatient(payload, bridge);          break;
                    case "UPDATE_PATIENT_PROFILE":   HandleUpdatePatientProfile(payload, bridge);   break;
                    case "GET_DOCTORS":              HandleGetDoctors(bridge);                      break;
                    case "ADD_DOCTOR":               HandleAddDoctor(payload, bridge);              break;
                    case "UPDATE_DOCTOR":            HandleUpdateDoctor(payload, bridge);           break;
                    case "DELETE_DOCTOR":            HandleDeleteDoctor(payload, bridge);           break;
                    case "GET_APPOINTMENTS":         HandleGetAppointments(bridge);                 break;
                    case "ADD_APPOINTMENT":          HandleAddAppointment(payload, bridge);         break;
                    case "UPDATE_APPOINTMENT_STATUS":HandleUpdateAppointmentStatus(payload, bridge);break;
                    case "GET_MEDICAL_RECORDS":      HandleGetMedicalRecords(bridge);               break;
                    case "ADD_MEDICAL_RECORD":       HandleAddMedicalRecord(payload, bridge);       break;
                    case "GET_DEPARTMENTS":          HandleGetDepartments(bridge);                  break;
                    case "ADD_DEPARTMENT":           HandleAddDepartment(payload, bridge);          break;
                    case "UPDATE_DEPARTMENT":        HandleUpdateDepartment(payload, bridge);       break;
                    case "DELETE_DEPARTMENT":        HandleDeleteDepartment(payload, bridge);       break;
                    default:
                        Console.WriteLine($"[Bridge] Unknown action: {action}");
                        bridge.SendResponseToUI(action, null, false, "Unknown action.");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Bridge] Exception: {ex.Message}");
            }
        }

        // ── AUTH ────────────────────────────────────────────────────────────────────

        private static void HandleLogin(dynamic payload, WebViewBridge bridge)
        {
            string username = (string)payload.username;
            string password = (string)payload.password;

            var user = AuthService.ValidateCredentials(username, password);

            if (user != null)
                bridge.SendResponseToUI("LOGIN_RESPONSE", user, true);
            else
                bridge.SendResponseToUI("LOGIN_RESPONSE", null, false, "Invalid username or password.");
        }

        private static void HandleRegister(dynamic payload, WebViewBridge bridge)
        {
            string fullName  = (string)payload.fullName;
            string username  = (string)payload.username;
            string password  = (string)payload.password;
            string bloodType = (string)payload.bloodType  ?? "";
            string gender    = (string)payload.gender     ?? "Male";
            string phone     = (string)payload.phone      ?? "";
            string address   = (string)payload.address    ?? "";

            var result = AuthService.RegisterUser(fullName, username, password, bloodType, gender, phone, address);

            if (result != null && result.ok != false)
                bridge.SendResponseToUI("REGISTER_RESPONSE", result, true);
            else
            {
                string msg = (result != null && result.message != null) ? (string)result.message : "Registration failed.";
                bridge.SendResponseToUI("REGISTER_RESPONSE", null, false, msg);
            }
        }

        // ── PATIENTS ────────────────────────────────────────────────────────────────

        private static void HandleGetPatients(WebViewBridge bridge)
        {
            var patients = PatientService.GetAllPatients();
            bridge.SendResponseToUI("GET_PATIENTS_RESPONSE", patients);
        }

        private static void HandleAddPatient(dynamic payload, WebViewBridge bridge)
        {
            string fullName  = (string)payload.fullName;
            string username  = (string)payload.username;
            string password  = (string)payload.password;
            string bloodType = (string)payload.bloodType  ?? "";
            string gender    = (string)payload.gender     ?? "Male";
            string phone     = (string)payload.phone      ?? "";
            string address   = (string)payload.address    ?? "";

            var result = AuthService.RegisterUser(fullName, username, password, bloodType, gender, phone, address);

            if (result != null && result.ok != false)
                bridge.SendResponseToUI("ADD_PATIENT_RESPONSE", result, true);
            else
            {
                string msg = (result != null && result.message != null) ? (string)result.message : "Failed to create patient.";
                bridge.SendResponseToUI("ADD_PATIENT_RESPONSE", null, false, msg);
            }
        }

        private static void HandleDeletePatient(dynamic payload, WebViewBridge bridge)
        {
            int id = Convert.ToInt32(payload.id);
            bool success = PatientService.DeletePatient(id);
            bridge.SendResponseToUI("DELETE_PATIENT_RESPONSE", new { id }, success, success ? "" : "Delete failed.");
        }

        private static void HandleUpdatePatientProfile(dynamic payload, WebViewBridge bridge)
        {
            int    userId    = Convert.ToInt32(payload.userId);
            string fullName  = (string)payload.fullName  ?? "";
            string bloodType = (string)payload.bloodType ?? "";
            string gender    = (string)payload.gender    ?? "";
            string phone     = (string)payload.phone     ?? "";
            string address   = (string)payload.address   ?? "";

            bool success = PatientService.UpdatePatientProfile(userId, fullName, bloodType, gender, phone, address);
            bridge.SendResponseToUI("UPDATE_PATIENT_PROFILE_RESPONSE", new { userId }, success, success ? "" : "Update failed.");
        }

        // ── DOCTORS ─────────────────────────────────────────────────────────────────

        private static void HandleGetDoctors(WebViewBridge bridge)
        {
            var doctors = DoctorService.GetAllDoctors();
            bridge.SendResponseToUI("GET_DOCTORS_RESPONSE", doctors);
        }

        private static void HandleAddDoctor(dynamic payload, WebViewBridge bridge)
        {
            string fullName = (string)payload.fullName;
            string username = (string)payload.username;
            string password = (string)payload.password;
            int    deptId   = Convert.ToInt32(payload.deptId);

            var newDoctor = DoctorService.CreateDoctor(fullName, username, password, deptId);

            if (newDoctor != null)
                bridge.SendResponseToUI("ADD_DOCTOR_RESPONSE", newDoctor, true);
            else
                bridge.SendResponseToUI("ADD_DOCTOR_RESPONSE", null, false, "Username already taken or department not found.");
        }

        private static void HandleUpdateDoctor(dynamic payload, WebViewBridge bridge)
        {
            int    userId      = Convert.ToInt32(payload.userId);
            string fullName    = (string)payload.fullName    ?? "";
            int    deptId      = Convert.ToInt32(payload.deptId);
            string newPassword = (string)payload.newPassword ?? "";

            bool success = DoctorService.UpdateDoctor(userId, fullName, deptId, newPassword);
            bridge.SendResponseToUI("UPDATE_DOCTOR_RESPONSE", new { userId }, success, success ? "" : "Update failed.");
        }

        private static void HandleDeleteDoctor(dynamic payload, WebViewBridge bridge)
        {
            int userId = Convert.ToInt32(payload.userId);
            bool success = DoctorService.DeleteDoctor(userId);
            bridge.SendResponseToUI("DELETE_DOCTOR_RESPONSE", new { userId }, success, success ? "" : "Delete failed.");
        }

        // ── APPOINTMENTS ─────────────────────────────────────────────────────────────

        private static void HandleGetAppointments(WebViewBridge bridge)
        {
            var appointments = AppointmentService.GetAllAppointments();
            bridge.SendResponseToUI("GET_APPOINTMENTS_RESPONSE", appointments);
        }

        private static void HandleAddAppointment(dynamic payload, WebViewBridge bridge)
        {
            int    patientId = Convert.ToInt32(payload.patientId);
            int    doctorId  = Convert.ToInt32(payload.doctorId);
            string date      = (string)payload.appointmentDate ?? DateTime.Today.ToString("yyyy-MM-dd");
            string time      = (string)payload.appointmentTime ?? "09:00";
            string combined  = $"{date} {time}";

            var result = AppointmentService.CreateAppointment(patientId, doctorId, combined);

            if (result != null)
                bridge.SendResponseToUI("ADD_APPOINTMENT_RESPONSE", result, true);
            else
                bridge.SendResponseToUI("ADD_APPOINTMENT_RESPONSE", null, false, "Failed to create appointment.");
        }

        private static void HandleUpdateAppointmentStatus(dynamic payload, WebViewBridge bridge)
        {
            int    appointmentId = Convert.ToInt32(payload.appointmentId);
            string status        = (string)payload.status;

            bool success = AppointmentService.UpdateStatus(appointmentId, status);
            bridge.SendResponseToUI("UPDATE_APPOINTMENT_STATUS_RESPONSE", new { appointmentId, status }, success, success ? "" : "Appointment not found.");
        }

        // ── MEDICAL RECORDS ──────────────────────────────────────────────────────────

        private static void HandleGetMedicalRecords(WebViewBridge bridge)
        {
            var records = AppointmentService.GetAllMedicalRecords();
            bridge.SendResponseToUI("GET_MEDICAL_RECORDS_RESPONSE", records);
        }

        private static void HandleAddMedicalRecord(dynamic payload, WebViewBridge bridge)
        {
            int    patientId    = Convert.ToInt32(payload.patientId);
            int    doctorId     = Convert.ToInt32(payload.doctorId);
            string diagnosis    = (string)payload.diagnosis    ?? "";
            string prescription = (string)payload.prescription ?? "";
            string date         = (string)payload.visitDate    ?? DateTime.Today.ToString("yyyy-MM-dd");

            var result = AppointmentService.CreateMedicalRecord(patientId, doctorId, diagnosis, prescription, date);

            if (result != null)
                bridge.SendResponseToUI("ADD_MEDICAL_RECORD_RESPONSE", result, true);
            else
                bridge.SendResponseToUI("ADD_MEDICAL_RECORD_RESPONSE", null, false, "Failed to create medical record.");
        }

        // ── DEPARTMENTS ──────────────────────────────────────────────────────────────

        private static void HandleGetDepartments(WebViewBridge bridge)
        {
            var depts = DepartmentService.GetAllDepartments();
            bridge.SendResponseToUI("GET_DEPARTMENTS_RESPONSE", depts);
        }

        private static void HandleAddDepartment(dynamic payload, WebViewBridge bridge)
        {
            string deptName = (string)payload.deptName;
            var newDept = DepartmentService.CreateDepartment(deptName);
            bridge.SendResponseToUI("ADD_DEPARTMENT_RESPONSE", newDept);
        }

        private static void HandleUpdateDepartment(dynamic payload, WebViewBridge bridge)
        {
            int    id       = Convert.ToInt32(payload.id);
            string deptName = (string)payload.deptName;
            bool success = DepartmentService.UpdateDepartment(id, deptName);
            bridge.SendResponseToUI("UPDATE_DEPARTMENT_RESPONSE", new { id, deptName }, success, success ? "" : "Update failed.");
        }

        private static void HandleDeleteDepartment(dynamic payload, WebViewBridge bridge)
        {
            int id = Convert.ToInt32(payload.id);
            bool success = DepartmentService.DeleteDepartment(id);
            bridge.SendResponseToUI("DELETE_DEPARTMENT_RESPONSE", new { id }, success, success ? "" : "Delete failed.");
        }
    }
}
