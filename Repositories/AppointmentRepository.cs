using System;
using System.Data;
using MySql.Data.MySqlClient;

namespace HospitalManagementSystem.Repositories
{
    public class AppointmentRepository
    {
        private readonly string _connectionString;

        public AppointmentRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? "Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;";
        }

        /// <summary>
        /// Fetches all appointments with patient/doctor names via JOINs.
        /// Uses only real schema columns from Appointments, Patient_Profiles, Doctor_Profiles.
        /// </summary>
        public DataTable FetchAll()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        a.appointment_id   AS id,
                        a.patient_id       AS patient_id,
                        pp.full_name       AS patient_name,
                        a.doctor_id        AS doctor_id,
                        dp.full_name       AS doctor_name,
                        a.appointment_date AS appointment_date,
                        a.status           AS status
                    FROM Appointments a
                    INNER JOIN Patient_Profiles pp ON a.patient_id = pp.user_id
                    INNER JOIN Doctor_Profiles  dp ON a.doctor_id  = dp.user_id
                    ORDER BY a.appointment_date DESC";

                using (var cmd = new MySqlCommand(query, conn))
                using (var adapter = new MySqlDataAdapter(cmd))
                {
                    var dt = new DataTable();
                    adapter.Fill(dt);
                    return dt;
                }
            }
        }

        /// <summary>
        /// Fetches appointments for a specific doctor (used in DoctorPortal).
        /// </summary>
        public DataTable FetchByDoctorId(int doctorId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        a.appointment_id   AS id,
                        a.patient_id       AS patient_id,
                        pp.full_name       AS patient_name,
                        a.doctor_id        AS doctor_id,
                        dp.full_name       AS doctor_name,
                        a.appointment_date AS appointment_date,
                        a.status           AS status
                    FROM Appointments a
                    INNER JOIN Patient_Profiles pp ON a.patient_id = pp.user_id
                    INNER JOIN Doctor_Profiles  dp ON a.doctor_id  = dp.user_id
                    WHERE a.doctor_id = @did
                    ORDER BY a.appointment_date DESC";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@did", doctorId);
                    using (var adapter = new MySqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Fetches appointments for a specific patient (used in PatientPortal).
        /// </summary>
        public DataTable FetchByPatientId(int patientId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        a.appointment_id   AS id,
                        a.patient_id       AS patient_id,
                        pp.full_name       AS patient_name,
                        a.doctor_id        AS doctor_id,
                        dp.full_name       AS doctor_name,
                        a.appointment_date AS appointment_date,
                        a.status           AS status
                    FROM Appointments a
                    INNER JOIN Patient_Profiles pp ON a.patient_id = pp.user_id
                    INNER JOIN Doctor_Profiles  dp ON a.doctor_id  = dp.user_id
                    WHERE a.patient_id = @pid
                    ORDER BY a.appointment_date DESC";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@pid", patientId);
                    using (var adapter = new MySqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Inserts a new appointment. Uses only real schema columns.
        /// appointment_id is auto-increment, not a string.
        /// </summary>
        public int Insert(int patientId, int doctorId, DateTime appointmentDate, string status)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    INSERT INTO Appointments (patient_id, doctor_id, appointment_date, status)
                    VALUES (@pid, @did, @date, @status);
                    SELECT LAST_INSERT_ID();";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@pid",    patientId);
                    cmd.Parameters.AddWithValue("@did",    doctorId);
                    cmd.Parameters.AddWithValue("@date",   appointmentDate);
                    cmd.Parameters.AddWithValue("@status", status);

                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }

        /// <summary>
        /// Updates appointment status. Valid values: PENDING, CONFIRMED, COMPLETED, CANCELLED.
        /// </summary>
        public bool UpdateStatus(int appointmentId, string status)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "UPDATE Appointments SET status = @status WHERE appointment_id = @id";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@status", status);
                    cmd.Parameters.AddWithValue("@id",     appointmentId);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        // ─── Medical Records ────────────────────────────────────────────────────────

        /// <summary>
        /// Fetches all medical records with patient/doctor names via JOINs.
        /// Uses only real schema columns: record_id, patient_id, doctor_id, diagnosis, prescription, visit_date.
        /// </summary>
        public DataTable FetchAllMedicalRecords()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        m.record_id    AS id,
                        m.patient_id   AS patient_id,
                        pp.full_name   AS patient_name,
                        m.doctor_id    AS doctor_id,
                        dp.full_name   AS doctor_name,
                        m.diagnosis    AS diagnosis,
                        m.prescription AS prescription,
                        m.visit_date   AS visit_date
                    FROM Medical_Records m
                    INNER JOIN Patient_Profiles pp ON m.patient_id = pp.user_id
                    INNER JOIN Doctor_Profiles  dp ON m.doctor_id  = dp.user_id
                    ORDER BY m.visit_date DESC";

                using (var cmd = new MySqlCommand(query, conn))
                using (var adapter = new MySqlDataAdapter(cmd))
                {
                    var dt = new DataTable();
                    adapter.Fill(dt);
                    return dt;
                }
            }
        }

        /// <summary>
        /// Fetches medical records for a specific doctor.
        /// </summary>
        public DataTable FetchMedicalRecordsByDoctorId(int doctorId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        m.record_id    AS id,
                        m.patient_id   AS patient_id,
                        pp.full_name   AS patient_name,
                        m.doctor_id    AS doctor_id,
                        dp.full_name   AS doctor_name,
                        m.diagnosis    AS diagnosis,
                        m.prescription AS prescription,
                        m.visit_date   AS visit_date
                    FROM Medical_Records m
                    INNER JOIN Patient_Profiles pp ON m.patient_id = pp.user_id
                    INNER JOIN Doctor_Profiles  dp ON m.doctor_id  = dp.user_id
                    WHERE m.doctor_id = @did
                    ORDER BY m.visit_date DESC";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@did", doctorId);
                    using (var adapter = new MySqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Fetches medical records for a specific patient.
        /// </summary>
        public DataTable FetchMedicalRecordsByPatientId(int patientId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        m.record_id    AS id,
                        m.patient_id   AS patient_id,
                        pp.full_name   AS patient_name,
                        m.doctor_id    AS doctor_id,
                        dp.full_name   AS doctor_name,
                        m.diagnosis    AS diagnosis,
                        m.prescription AS prescription,
                        m.visit_date   AS visit_date
                    FROM Medical_Records m
                    INNER JOIN Patient_Profiles pp ON m.patient_id = pp.user_id
                    INNER JOIN Doctor_Profiles  dp ON m.doctor_id  = dp.user_id
                    WHERE m.patient_id = @pid
                    ORDER BY m.visit_date DESC";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@pid", patientId);
                    using (var adapter = new MySqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        /// <summary>
        /// Inserts a new medical record. Uses only real schema columns.
        /// record_id is auto-increment. Returns new record_id.
        /// </summary>
        public int InsertMedicalRecord(int patientId, int doctorId, string diagnosis, string prescription, DateTime visitDate)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    INSERT INTO Medical_Records (patient_id, doctor_id, diagnosis, prescription, visit_date)
                    VALUES (@pid, @did, @diag, @presc, @date);
                    SELECT LAST_INSERT_ID();";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@pid",   patientId);
                    cmd.Parameters.AddWithValue("@did",   doctorId);
                    cmd.Parameters.AddWithValue("@diag",  diagnosis);
                    cmd.Parameters.AddWithValue("@presc", prescription ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@date",  visitDate);

                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }
    }
}
