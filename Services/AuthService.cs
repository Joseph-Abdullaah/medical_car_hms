using System;
using System.Data;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class AuthService
    {
        private readonly UserRepository _userRepository = new UserRepository();

        /// <summary>
        /// Validates login credentials against the real Users table.
        /// Password is stored as a hash; we compare the hashed input.
        /// Returns a dynamic user object on success, null on failure.
        /// </summary>
        public dynamic ValidateCredentials(string username, string password)
        {
            try
            {
                // Hash the incoming password the same way we stored it
                string passwordPlain = password;

                DataTable dt = _userRepository.GetUserByCredentials(username, passwordHash);

                if (dt.Rows.Count > 0)
                {
                    DataRow row = dt.Rows[0];
                    return new
                    {
                        id       = Convert.ToInt32(row["id"]),
                        username = row["username"].ToString(),
                        fullName = row["full_name"].ToString(),
                        role     = row["role"].ToString().ToLower()   // Return lowercase to match React expectations
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AuthService] ValidateCredentials failed: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Registers a new PATIENT. Only PATIENT registration is allowed here.
        /// Creates a Users row + a Patient_Profiles row in one atomic flow.
        /// </summary>
        public dynamic RegisterUser(string fullName, string username, string password)
        {
            try
            {
                if (_userRepository.UserExists(username))
                {
                    return null; // Username already taken
                }

                string passwordPlain = password;

                // 1. Insert into Users with role = PATIENT
                int userId = _userRepository.CreateUser(username, passwordHash, "PATIENT");

                if (userId <= 0)
                {
                    return null;
                }

                // 2. Insert into Patient_Profiles
                _userRepository.CreatePatientProfile(userId, fullName);

                return new
                {
                    id       = userId,
                    username = username,
                    fullName = fullName,
                    role     = "patient"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AuthService] RegisterUser failed: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Simple SHA-256 password hashing. In production use BCrypt.
        /// </summary>
        private static string HashPassword(string password)
        {
            using (var sha = System.Security.Cryptography.SHA256.Create())
            {
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(password);
                byte[] hash  = sha.ComputeHash(bytes);
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }
    }
}
