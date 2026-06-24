using System;
using System.Collections.Generic;
using System.Data;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class AppointmentService
    {
        private readonly AppointmentRepository _appointmentRepository = new AppointmentRepository();

        /// <summary>
        /// Returns all appointments using real schema columns only.
        /// </summary>
        public List<dynamic> GetAllAppointments()
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchAll();
                foreach (DataRow row in dt.Rows)
                    list.Add(MapAppointmentRow(row));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] GetAllAppointments failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Returns appointments for a specific doctor (filtered by doctorId).
        /// </summary>
        public List<dynamic> GetAppointmentsByDoctor(int doctorId)
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchByDoctorId(doctorId);
                foreach (DataRow row in dt.Rows)
                    list.Add(MapAppointmentRow(row));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] GetAppointmentsByDoctor failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Returns appointments for a specific patient (filtered by patientId).
        /// </summary>
        public List<dynamic> GetAppointmentsByPatient(int patientId)
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchByPatientId(patientId);
                foreach (DataRow row in dt.Rows)
                    list.Add(MapAppointmentRow(row));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] GetAppointmentsByPatient failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Creates a new appointment with PENDING status.
        /// </summary>
        public dynamic CreateAppointment(int patientId, int doctorId, string date)
        {
            try
            {
                DateTime apptDate = DateTime.TryParse(date, out var parsed) ? parsed : DateTime.Today;
                int newId = _appointmentRepository.Insert(patientId, doctorId, apptDate, "PENDING");

                if (newId > 0)
                {
                    return new
                    {
                        id              = newId,
                        patientId       = patientId,
                        doctorId        = doctorId,
                        appointmentDate = apptDate.ToString("yyyy-MM-dd"),
                        status          = "PENDING"
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] CreateAppointment failed: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Updates appointment status. Accepts: PENDING, CONFIRMED, COMPLETED, CANCELLED.
        /// </summary>
        public bool UpdateStatus(int appointmentId, string status)
        {
            try
            {
                return _appointmentRepository.UpdateStatus(appointmentId, status);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] UpdateStatus failed: {ex.Message}");
                return false;
            }
        }

        // ─── Medical Records ────────────────────────────────────────────────────────

        /// <summary>
        /// Returns all medical records using real schema columns.
        /// </summary>
        public List<dynamic> GetAllMedicalRecords()
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchAllMedicalRecords();
                foreach (DataRow row in dt.Rows)
                    list.Add(MapRecordRow(row));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] GetAllMedicalRecords failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Returns medical records for a specific doctor.
        /// </summary>
        public List<dynamic> GetMedicalRecordsByDoctor(int doctorId)
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchMedicalRecordsByDoctorId(doctorId);
                foreach (DataRow row in dt.Rows)
                    list.Add(MapRecordRow(row));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] GetMedicalRecordsByDoctor failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Returns medical records for a specific patient.
        /// </summary>
        public List<dynamic> GetMedicalRecordsByPatient(int patientId)
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchMedicalRecordsByPatientId(patientId);
                foreach (DataRow row in dt.Rows)
                    list.Add(MapRecordRow(row));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] GetMedicalRecordsByPatient failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Creates a new medical record with real schema columns: diagnosis + prescription.
        /// </summary>
        public dynamic CreateMedicalRecord(int patientId, int doctorId, string diagnosis, string prescription, string date)
        {
            try
            {
                DateTime visitDate = DateTime.TryParse(date, out var parsed) ? parsed : DateTime.Today;
                int newId = _appointmentRepository.InsertMedicalRecord(patientId, doctorId, diagnosis, prescription, visitDate);

                if (newId > 0)
                {
                    return new
                    {
                        id           = newId,
                        patientId    = patientId,
                        doctorId     = doctorId,
                        diagnosis    = diagnosis,
                        prescription = prescription,
                        visitDate    = visitDate.ToString("yyyy-MM-dd")
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppointmentService] CreateMedicalRecord failed: {ex.Message}");
            }
            return null;
        }

        // ─── Helpers ────────────────────────────────────────────────────────────────

        private static dynamic MapAppointmentRow(DataRow row)
        {
            return new
            {
                id              = Convert.ToInt32(row["id"]),
                patientId       = Convert.ToInt32(row["patient_id"]),
                patientName     = row["patient_name"].ToString(),
                doctorId        = Convert.ToInt32(row["doctor_id"]),
                doctorName      = row["doctor_name"].ToString(),
                appointmentDate = Convert.ToDateTime(row["appointment_date"]).ToString("yyyy-MM-dd"),
                status          = row["status"].ToString()
            };
        }

        private static dynamic MapRecordRow(DataRow row)
        {
            return new
            {
                id           = Convert.ToInt32(row["id"]),
                patientId    = Convert.ToInt32(row["patient_id"]),
                patientName  = row["patient_name"].ToString(),
                doctorId     = Convert.ToInt32(row["doctor_id"]),
                doctorName   = row["doctor_name"].ToString(),
                diagnosis    = row["diagnosis"] != DBNull.Value ? row["diagnosis"].ToString() : "",
                prescription = row["prescription"] != DBNull.Value ? row["prescription"].ToString() : "",
                visitDate    = Convert.ToDateTime(row["visit_date"]).ToString("yyyy-MM-dd")
            };
        }
    }
}
