using System;
using System.Data;
using MySql.Data.MySqlClient;

namespace HospitalManagementSystem.Repositories
{
    public class DoctorRepository
    {
        private readonly string _connectionString;

        public DoctorRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? "Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;";
        }

        /// <summary>
        /// Fetches all doctors by joining Users + Doctor_Profiles + Departments.
        /// Only returns real schema columns.
        /// </summary>
        public DataTable FetchAll()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        u.user_id      AS id,
                        u.username     AS username,
                        dp.full_name   AS full_name,
                        dp.dept_id     AS dept_id,
                        d.dept_name    AS dept_name
                    FROM Users u
                    INNER JOIN Doctor_Profiles dp ON u.user_id = dp.user_id
                    LEFT  JOIN Departments     d  ON dp.dept_id = d.dept_id
                    WHERE u.role = 'DOCTOR'
                    ORDER BY dp.full_name ASC";

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
        /// Updates a doctor's profile fields (full_name and dept_id).
        /// </summary>
        public bool UpdateProfile(int userId, string fullName, int deptId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    UPDATE Doctor_Profiles
                    SET full_name = @name,
                        dept_id   = @dept
                    WHERE user_id = @uid";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid",  userId);
                    cmd.Parameters.AddWithValue("@name", fullName ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@dept", deptId);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        /// <summary>
        /// Fetches a single doctor by their user_id.
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
                        dp.full_name AS full_name,
                        dp.dept_id   AS dept_id,
                        d.dept_name  AS dept_name
                    FROM Users u
                    INNER JOIN Doctor_Profiles dp ON u.user_id = dp.user_id
                    LEFT  JOIN Departments     d  ON dp.dept_id = d.dept_id
                    WHERE u.user_id = @uid AND u.role = 'DOCTOR'";

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
    }
}
