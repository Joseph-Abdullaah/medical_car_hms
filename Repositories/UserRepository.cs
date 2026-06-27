using System;
using System.Data;
using MySql.Data.MySqlClient;

namespace HospitalManagementSystem.Repositories
{
    public class UserRepository
    {
        private readonly string _connectionString;

        public UserRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? "Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;";
        }

        /// <summary>
        /// Validates login credentials. JOINs profile table to retrieve full_name.
        /// Returns the user row or an empty DataTable on failure.
        /// </summary>
        public DataTable GetUserByCredentials(string username, string password)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();

                // Try patient login first, then doctor, then admin (admin has no profile row)
                string query = @"
                    SELECT
                        u.user_id  AS id,
                        u.username AS username,
                        u.role     AS role,
                        COALESCE(pp.full_name, dp.full_name, u.username) AS full_name
                    FROM Users u
                    LEFT JOIN Patient_Profiles pp ON u.user_id = pp.user_id AND u.role = 'PATIENT'
                    LEFT JOIN Doctor_Profiles  dp ON u.user_id = dp.user_id AND u.role = 'DOCTOR'
                    WHERE u.username = @user
                      AND u.password = @pass";


                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user", username);
                    cmd.Parameters.AddWithValue("@pass", password);

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
        /// Checks whether a username is already taken.
        /// </summary>
        public bool UserExists(string username)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "SELECT COUNT(*) FROM Users WHERE username = @user";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user", username);
                    int count = Convert.ToInt32(cmd.ExecuteScalar());
                    return count > 0;
                }
            }
        }

        /// <summary>
        /// Inserts a new row into Users. Returns the new user_id.
        /// </summary>
        public int CreateUser(string username, string password, string role)

        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO Users (username, password, role) VALUES (@user, @pass, @role); SELECT LAST_INSERT_ID();";


                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user", username);
                    cmd.Parameters.AddWithValue("@pass", password);
                    cmd.Parameters.AddWithValue("@role", role);


                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }

        /// <summary>
        /// Inserts a Patient_Profiles row linked to a Users row.
        /// </summary>
        public bool CreatePatientProfile(int userId, string fullName, string bloodType, string gender, string phone, string address)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO Patient_Profiles (user_id, full_name, blood_type, gender, phone, address) VALUES (@uid, @name, @blood, @gender, @phone, @address)";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid", userId);
                    cmd.Parameters.AddWithValue("@name", fullName ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@blood", bloodType ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@gender", gender ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@phone", phone ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@address", address ?? (object)DBNull.Value);

                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        /// <summary>
        /// Inserts a Doctor_Profiles row linked to a Users row.
        /// </summary>
        public bool CreateDoctorProfile(int userId, string fullName, int deptId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO Doctor_Profiles (user_id, full_name, dept_id) VALUES (@uid, @name, @dept)";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid", userId);
                    cmd.Parameters.AddWithValue("@name", fullName ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@dept", deptId);

                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        /// <summary>
        /// Updates the username for an existing user. Returns false if the new username is already taken.
        /// </summary>
        public bool UpdateUsername(int userId, string newUsername)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string checkQuery = "SELECT COUNT(*) FROM Users WHERE username = @user AND user_id != @uid";
                using (var checkCmd = new MySqlCommand(checkQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@user", newUsername);
                    checkCmd.Parameters.AddWithValue("@uid", userId);
                    if (Convert.ToInt32(checkCmd.ExecuteScalar()) > 0)
                        return false;
                }
                string query = "UPDATE Users SET username = @user WHERE user_id = @uid";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid", userId);
                    cmd.Parameters.AddWithValue("@user", newUsername);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        /// <summary>
        /// Updates the password for an existing user.
        /// </summary>
        public bool UpdatePassword(int userId, string password)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "UPDATE Users SET password = @pass WHERE user_id = @uid";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid",  userId);
                    cmd.Parameters.AddWithValue("@pass", password);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }

        /// <summary>
        /// Deletes a user and their profile (cascade handles profile deletion).
        /// </summary>
        public bool DeleteUser(int userId)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "DELETE FROM Users WHERE user_id = @uid";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@uid", userId);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }
    }
}
