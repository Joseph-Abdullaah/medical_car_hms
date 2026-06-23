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

        public DataTable FetchAll()
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "SELECT id, full_name, gender, dob, blood_group, phone, address, emergency_contact_name, emergency_contact_phone, status, reg_date FROM patients ORDER BY reg_date DESC";
                
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

        public bool Insert(string id, string fullName, string gender, DateTime dob, string bloodGroup, string phone, string address, string emergencyName, string emergencyPhone, string status, DateTime regDate)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                string query = "INSERT INTO patients (id, full_name, gender, dob, blood_group, phone, address, emergency_contact_name, emergency_contact_phone, status, reg_date) " +
                               "VALUES (@id, @name, @gender, @dob, @blood, @phone, @address, @emName, @emPhone, @status, @reg)";
                
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@name", fullName);
                    cmd.Parameters.AddWithValue("@gender", gender);
                    cmd.Parameters.AddWithValue("@dob", dob);
                    cmd.Parameters.AddWithValue("@blood", bloodGroup);
                    cmd.Parameters.AddWithValue("@phone", phone);
                    cmd.Parameters.AddWithValue("@address", address);
                    cmd.Parameters.AddWithValue("@emName", emergencyName);
                    cmd.Parameters.AddWithValue("@emPhone", emergencyPhone);
                    cmd.Parameters.AddWithValue("@status", status);
                    cmd.Parameters.AddWithValue("@reg", regDate);

                    int rows = cmd.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }
    }
}
