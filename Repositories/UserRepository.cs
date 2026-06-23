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

        public DataTable GetUserByCredentials(string username, string password, string role)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "SELECT id, username, email, full_name, role, profile_image FROM users WHERE username = @user AND password = @pass AND role = @role";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user", username);
                    cmd.Parameters.AddWithValue("@pass", password);
                    cmd.Parameters.AddWithValue("@role", role);

                    using (var adapter = new MySqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        public bool UserExists(string username, string email)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "SELECT COUNT(*) FROM users WHERE username = @user OR email = @email";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user", username);
                    cmd.Parameters.AddWithValue("@email", email);
                    
                    int count = Convert.ToInt32(cmd.ExecuteScalar());
                    return count > 0;
                }
            }
        }

        public int CreateUser(string fullName, string username, string email, string password, string role)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO users (username, email, full_name, password, role) VALUES (@user, @email, @name, @pass, @role); SELECT LAST_INSERT_ID();";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user", username);
                    cmd.Parameters.AddWithValue("@email", email);
                    cmd.Parameters.AddWithValue("@name", fullName);
                    cmd.Parameters.AddWithValue("@pass", password);
                    cmd.Parameters.AddWithValue("@role", role);

                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }
    }
}
