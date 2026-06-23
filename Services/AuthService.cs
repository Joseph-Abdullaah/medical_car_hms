using System;
using System.Data;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class AuthService
    {
        private readonly UserRepository _userRepository = new UserRepository();

        /// <summary>
        /// Validates login credentials and returns user details.
        /// </summary>
        public dynamic ValidateCredentials(string username, string password, string role)
        {
            try
            {
                // Authenticates user with real parameterized MySQL queries
                DataTable dt = _userRepository.GetUserByCredentials(username, password, role);
                
                if (dt.Rows.Count > 0)
                {
                    DataRow row = dt.Rows[0];
                    return new
                    {
                        id = Convert.ToInt32(row["id"]),
                        username = row["username"].ToString(),
                        email = row["email"].ToString(),
                        fullName = row["full_name"].ToString(),
                        role = row["role"].ToString(),
                        profileImage = row["profile_image"] != DBNull.Value ? row["profile_image"].ToString() : null
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# AuthService Error] ValidateCredentials failed: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Registers a new user into the database repository.
        /// </summary>
        public dynamic RegisterUser(string fullName, string username, string email, string password, string role)
        {
            try
            {
                if (_userRepository.UserExists(username, email))
                {
                    return null; // Username/Email conflicts
                }

                int userId = _userRepository.CreateUser(fullName, username, email, password, role);
                if (userId > 0)
                {
                    return new
                    {
                        id = userId,
                        username = username,
                        email = email,
                        fullName = fullName,
                        role = role,
                        profileImage = (string)null
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# AuthService Error] RegisterUser failed: {ex.Message}");
            }
            return null;
        }
    }
}
