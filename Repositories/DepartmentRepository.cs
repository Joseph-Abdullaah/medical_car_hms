using System;
using System.Data;
using MySql.Data.MySqlClient;

namespace HospitalManagementSystem.Repositories
{
    public class DepartmentRepository
    {
        private readonly string _connectionString;

        public DepartmentRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? "Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;";
        }

        /// <summary>
        /// Fetches all departments with a doctor count calculated from Doctor_Profiles.
        /// </summary>
        public DataTable FetchAll()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = @"
                    SELECT
                        d.dept_id   AS dept_id,
                        d.dept_name AS dept_name,
                        COUNT(dp.user_id) AS doctor_count
                    FROM Departments d
                    LEFT JOIN Doctor_Profiles dp ON d.dept_id = dp.dept_id
                    GROUP BY d.dept_id, d.dept_name
                    ORDER BY d.dept_name ASC";

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
        /// Inserts a new department. Returns the new dept_id.
        /// </summary>
        public int Insert(string deptName)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO Departments (dept_name) VALUES (@name); SELECT LAST_INSERT_ID();";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@name", deptName);
                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }

        /// <summary>
        /// Updates an existing department's name.
        /// </summary>
        public bool Update(int deptId, string deptName)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "UPDATE Departments SET dept_name = @name WHERE dept_id = @id";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@name", deptName);
                    cmd.Parameters.AddWithValue("@id",   deptId);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        /// <summary>
        /// Deletes a department. Will fail if doctors are still assigned to it.
        /// </summary>
        public bool Delete(int deptId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "DELETE FROM Departments WHERE dept_id = @id";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", deptId);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }
    }
}
