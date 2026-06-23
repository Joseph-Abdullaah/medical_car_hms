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
        /// Retrieves all logged appointments.
        /// </summary>
        public List<dynamic> GetAllAppointments()
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchAll();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        id = row["id"].ToString(),
                        patientId = row["patient_id"].ToString(),
                        patientName = row["patient_name"].ToString(),
                        doctorId = row["doctor_id"].ToString(),
                        doctorName = row["doctor_name"].ToString(),
                        appointmentDate = Convert.ToDateTime(row["appointment_date"]).ToString("yyyy-MM-dd"),
                        appointmentTime = row["appointment_time"].ToString(),
                        reason = row["reason"].ToString(),
                        clinicalNotes = row["clinical_notes"] != DBNull.Value ? row["clinical_notes"].ToString() : "",
                        status = row["status"].ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# AppointmentService Error] GetAllAppointments: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Schedules a new appointment.
        /// </summary>
        public dynamic CreateAppointment(string patientId, string doctorId, string date, string time, string reason, string notes)
        {
            try
            {
                string id = "APT-" + new Random().Next(1000, 9999).ToString();
                DateTime apptDate = DateTime.TryParse(date, out var parsedDate) ? apptDate = parsedDate : apptDate = DateTime.Today;

                bool success = _appointmentRepository.Insert(id, patientId, doctorId, apptDate, time, reason, notes, "Pending");
                if (success)
                {
                    return new
                    {
                        id = id,
                        patientId = patientId,
                        doctorId = doctorId,
                        appointmentDate = apptDate.ToString("yyyy-MM-dd"),
                        appointmentTime = time,
                        reason = reason,
                        clinicalNotes = notes,
                        status = "Pending"
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# AppointmentService Error] CreateAppointment: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Updates the status of an appointment.
        /// </summary>
        public bool UpdateStatus(string appointmentId, string status)
        {
            try
            {
                return _appointmentRepository.UpdateStatus(appointmentId, status);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# AppointmentService Error] UpdateStatus: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Retrieves all clinical medical entries.
        /// </summary>
        public List<dynamic> GetAllMedicalRecords()
        {
            var records = new List<dynamic>();
            try
            {
                DataTable dt = _appointmentRepository.FetchAllMedicalRecords();
                foreach (DataRow row in dt.Rows)
                {
                    records.Add(new
                    {
                        id = row["id"].ToString(),
                        patientId = row["patient_id"].ToString(),
                        patientName = row["patient_name"].ToString(),
                        doctorId = row["doctor_id"].ToString(),
                        doctorName = row["doctor_name"].ToString(),
                        visitDate = Convert.ToDateTime(row["visit_date"]).ToString("yyyy-MM-dd"),
                        symptoms = row["symptoms"].ToString(),
                        diagnosis = row["diagnosis"].ToString(),
                        treatmentPlan = row["treatment_plan"].ToString(),
                        internalNotes = row["internal_notes"] != DBNull.Value ? row["internal_notes"].ToString() : "",
                        signedBy = row["signed_by"].ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# AppointmentService Error] GetAllMedicalRecords: {ex.Message}");
            }
            return records;
        }

        /// <summary>
        /// Creates a new signed medical consultation record.
        /// </summary>
        public dynamic CreateMedicalRecord(string patientId, string doctorId, string date, string symptoms, string diagnosis, string plan, string notes, string signedBy)
        {
            try
            {
                string id = "MR-" + new Random().Next(1000, 9999).ToString();
                DateTime visitDate = DateTime.TryParse(date, out var parsedDate) ? visitDate = parsedDate : visitDate = DateTime.Today;

                bool success = _appointmentRepository.InsertMedicalRecord(id, patientId, doctorId, visitDate, symptoms, diagnosis, plan, notes, signedBy);
                if (success)
                {
                    return new
                    {
                        id = id,
                        patientId = patientId,
                        doctorId = doctorId,
                        visitDate = visitDate.ToString("yyyy-MM-dd"),
                        symptoms = symptoms,
                        diagnosis = diagnosis,
                        treatmentPlan = plan,
                        internalNotes = notes,
                        signedBy = signedBy
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# AppointmentService Error] CreateMedicalRecord: {ex.Message}");
            }
            return null;
        }
    }
}
