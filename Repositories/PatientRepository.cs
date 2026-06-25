using System;
using System.Data;
using MySql.Data.MySqlClient;

namespace HospitalManagementSystem.Repositories
{
    public class PatientRepository
    {
        private readonly string _connectionString;

        public PatientRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? "Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;";
        }

        /// <summary>
        /// Fetches all patients by joining Users + Patient_Profiles.
        /// Only returns real schema columns.
        /// </summary>
        public DataTable FetchAll()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        u.user_id    AS id,
                        u.username   AS username,
                        pp.full_name AS full_name,
                        pp.blood_type AS blood_type,
                        pp.phone AS phone,
                        pp.address AS address,
                        pp.gender AS gender
                    FROM Users u
                    INNER JOIN Patient_Profiles pp ON u.user_id = pp.user_id
                    WHERE u.role = 'PATIENT'
                    ORDER BY pp.full_name ASC";

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
        /// Fetches a single patient by their user_id.
        /// </summary>
        public DataTable FetchById(int userId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        u.user_id    AS id,
                        u.username   AS username,
                        pp.full_name AS full_name,
                        pp.blood_type AS blood_type,
                        pp.phone AS phone,
                        pp.address AS address,
                        pp.gender AS gender
                    FROM Users u
                    INNER JOIN Patient_Profiles pp ON u.user_id = pp.user_id
                    WHERE u.user_id = @uid AND u.role = 'PATIENT'";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid", userId);
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
        /// Updates a patient's profile fields (all Patient_Profiles columns).
        /// </summary>
        public bool UpdateProfile(int userId, string fullName, string bloodType, string gender, string phone, string address)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    UPDATE Patient_Profiles
                    SET full_name  = @name,
                        blood_type = @blood,
                        gender     = @gender,
                        phone      = @phone,
                        address    = @address
                    WHERE user_id = @uid";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid",     userId);
                    cmd.Parameters.AddWithValue("@name",    fullName  ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@blood",   bloodType ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@gender",  gender    ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@phone",   phone     ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@address", address   ?? (object)DBNull.Value);

                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }
    }
}

