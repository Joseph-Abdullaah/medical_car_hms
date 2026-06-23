using System;
using Newtonsoft.Json;
using HospitalManagementSystem.Services;

namespace HospitalManagementSystem.Desktop
{
    public static class MessageHandler
    {
        // Simple Service Container dependency injection simulations
        private static readonly AuthService AuthService = new AuthService();
        private static readonly PatientService PatientService = new PatientService();
        private static readonly DoctorService DoctorService = new DoctorService();
        private static readonly AppointmentService AppointmentService = new AppointmentService();

        public static void HandleIncomingWebMessage(string rawMessage, WebViewBridge bridge)
        {
            try
            {
                // Decode Incoming message schemas (Action, Payload)
                dynamic webRequest = JsonConvert.DeserializeObject<dynamic>(rawMessage);
                if (webRequest == null) return;

                string action = (string)webRequest.action;
                dynamic payload = webRequest.payload;

                Console.WriteLine($"[C# WinForms Bridge] Triggered Action: {action}");

                switch (action)
                {
                    case "LOGIN":
                        HandleLogin(payload, bridge);
                        break;
                    case "REGISTER":
                        HandleRegister(payload, bridge);
                        break;
                    case "GET_PATIENTS":
                        HandleGetPatients(bridge);
                        break;
                    case "ADD_PATIENT":
                        HandleAddPatient(payload, bridge);
                        break;
                    case "GET_DOCTORS":
                        HandleGetDoctors(bridge);
                        break;
                    case "GET_APPOINTMENTS":
                        HandleGetAppointments(bridge);
                        break;
                    case "ADD_APPOINTMENT":
                        HandleAddAppointment(payload, bridge);
                        break;
                    case "UPDATE_APPOINTMENT_STATUS":
                        HandleUpdateAppointmentStatus(payload, bridge);
                        break;
                    case "GET_MEDICAL_RECORDS":
                        HandleGetMedicalRecords(bridge);
                        break;
                    case "ADD_MEDICAL_RECORD":
                        HandleAddMedicalRecord(payload, bridge);
                        break;
                    default:
                        Console.WriteLine($"[C# Error] Unrecognized message action triggered: {action}");
                        bridge.SendResponseToUI(action, null, false, "Unknown C# endpoint path");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# Router Exception] {ex.Message}");
            }
        }

        private static void HandleLogin(dynamic payload, WebViewBridge bridge)
        {
            string username = (string)payload.username;
            string password = (string)payload.password;
            string role = (string)payload.role;

            var user = AuthService.ValidateCredentials(username, password, role);
            if (user != null)
            {
                bridge.SendResponseToUI("LOGIN_RESPONSE", user, true);
            }
            else
            {
                bridge.SendResponseToUI("LOGIN_RESPONSE", null, false, "Invalid credentials or role selection.");
            }
        }

        private static void HandleRegister(dynamic payload, WebViewBridge bridge)
        {
            string fullName = (string)payload.fullName;
            string username = (string)payload.username;
            string email = (string)payload.email;
            string password = (string)payload.password;
            string role = (string)payload.role;

            var newUser = AuthService.RegisterUser(fullName, username, email, password, role);
            if (newUser != null)
            {
                bridge.SendResponseToUI("REGISTER_RESPONSE", newUser, true);
            }
            else
            {
                bridge.SendResponseToUI("REGISTER_RESPONSE", null, false, "Username or Email already exists.");
            }
        }

        private static void HandleGetPatients(WebViewBridge bridge)
        {
            var patients = PatientService.GetAllPatients();
            bridge.SendResponseToUI("GET_PATIENTS_RESPONSE", patients);
        }

        private static void HandleAddPatient(dynamic payload, WebViewBridge bridge)
        {
            string fullName = (string)payload.fullName;
            string gender = (string)payload.gender;
            string dob = (string)payload.dob;
            string bloodGroup = (string)payload.bloodGroup;
            string phone = (string)payload.phone;
            string address = (string)payload.address;
            string emergencyName = (string)payload.emergencyContactName;
            string emergencyPhone = (string)payload.emergencyContactPhone;

            var newPatient = PatientService.CreatePatient(fullName, gender, dob, bloodGroup, phone, address, emergencyName, emergencyPhone);
            bridge.SendResponseToUI("ADD_PATIENT_RESPONSE", newPatient);
        }

        private static void HandleGetDoctors(WebViewBridge bridge)
        {
            var doctors = DoctorService.GetAllDoctors();
            bridge.SendResponseToUI("GET_DOCTORS_RESPONSE", doctors);
        }

        private static void HandleGetAppointments(WebViewBridge bridge)
        {
            var appointments = AppointmentService.GetAllAppointments();
            bridge.SendResponseToUI("GET_APPOINTMENTS_RESPONSE", appointments);
        }

        private static void HandleAddAppointment(dynamic payload, WebViewBridge bridge)
        {
            string patientId = (string)payload.patientId;
            string doctorId = (string)payload.doctorId;
            string date = (string)payload.appointmentDate;
            string time = (string)payload.appointmentTime;
            string reason = (string)payload.reason;
            string notes = (string)payload.clinicalNotes;

            var appt = AppointmentService.CreateAppointment(patientId, doctorId, date, time, reason, notes);
            bridge.SendResponseToUI("ADD_APPOINTMENT_RESPONSE", appt);
        }

        private static void HandleUpdateAppointmentStatus(dynamic payload, WebViewBridge bridge)
        {
            string appointmentId = (string)payload.appointmentId;
            string status = (string)payload.status;

            bool success = AppointmentService.UpdateStatus(appointmentId, status);
            bridge.SendResponseToUI("UPDATE_APPOINTMENT_STATUS_RESPONSE", new { appointmentId, status }, success, success ? "" : "Appointment not found");
        }

        private static void HandleGetMedicalRecords(WebViewBridge bridge)
        {
            var records = AppointmentService.GetAllMedicalRecords();
            bridge.SendResponseToUI("GET_MEDICAL_RECORDS_RESPONSE", records);
        }

        private static void HandleAddMedicalRecord(dynamic payload, WebViewBridge bridge)
        {
            string patientId = (string)payload.patientId;
            string doctorId = (string)payload.doctorId;
            string date = (string)payload.visitDate;
            string symptoms = (string)payload.symptoms;
            string diagnosis = (string)payload.diagnosis;
            string plan = (string)payload.treatmentPlan;
            string notes = (string)payload.internalNotes;
            string signedBy = (string)payload.signedBy;

            var record = AppointmentService.CreateMedicalRecord(patientId, doctorId, date, symptoms, diagnosis, plan, notes, signedBy);
            bridge.SendResponseToUI("ADD_MEDICAL_RECORD_RESPONSE", record);
        }
    }
}
