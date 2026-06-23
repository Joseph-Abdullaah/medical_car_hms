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

        public DataTable FetchAll()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "SELECT a.id, a.patient_id, p.full_name AS patient_name, a.doctor_id, d.full_name AS doctor_name, " +
                               "a.appointment_date, a.appointment_time, a.reason, a.clinical_notes, a.status " +
                               "FROM appointments a " +
                               "JOIN patients p ON a.patient_id = p.id " +
                               "JOIN doctors d ON a.doctor_id = d.id " +
                               "ORDER BY a.appointment_date DESC, a.appointment_time DESC";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    using (var adapter = new MySqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public bool Insert(string id, string patientId, string doctorId, DateTime date, string time, string reason, string notes, string status)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, reason, clinical_notes, status) " +
                               "VALUES (@id, @pId, @dId, @date, @time, @reason, @notes, @status)";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@pId", patientId);
                    cmd.Parameters.AddWithValue("@dId", doctorId);
                    cmd.Parameters.AddWithValue("@date", date);
                    cmd.Parameters.AddWithValue("@time", time);
                    cmd.Parameters.AddWithValue("@reason", reason);
                    cmd.Parameters.AddWithValue("@notes", notes ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@status", status);

                    int rows = cmd.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }

        public bool UpdateStatus(string id, string status)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "UPDATE appointments SET status = @status WHERE id = @id";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@status", status);
                    cmd.Parameters.AddWithValue("@id", id);

                    int rows = cmd.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }

        public DataTable FetchAllMedicalRecords()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "SELECT m.id, m.patient_id, p.full_name AS patient_name, m.doctor_id, d.full_name AS doctor_name, " +
                               "m.visit_date, m.symptoms, m.diagnosis, m.treatment_plan, m.internal_notes, m.signed_by " +
                               "FROM medical_records m " +
                               "JOIN patients p ON m.patient_id = p.id " +
                               "JOIN doctors d ON m.doctor_id = d.id " +
                               "ORDER BY m.visit_date DESC";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    using (var adapter = new MySqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public bool InsertMedicalRecord(string id, string patientId, string doctorId, DateTime visitDate, string symptoms, string diagnosis, string plan, string notes, string signedBy)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO medical_records (id, patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment_plan, internal_notes, signed_by) " +
                               "VALUES (@id, @pId, @dId, @date, @symptoms, @diag, @plan, @notes, @sign)";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@pId", patientId);
                    cmd.Parameters.AddWithValue("@dId", doctorId);
                    cmd.Parameters.AddWithValue("@date", visitDate);
                    cmd.Parameters.AddWithValue("@symptoms", symptoms);
                    cmd.Parameters.AddWithValue("@diag", diagnosis);
                    cmd.Parameters.AddWithValue("@plan", plan);
                    cmd.Parameters.AddWithValue("@notes", notes ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@sign", signedBy);

                    int rows = cmd.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }
    }
}
