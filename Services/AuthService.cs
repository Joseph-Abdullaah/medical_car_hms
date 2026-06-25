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
                DataTable dt = _userRepository.GetUserByCredentials(username, password);

                if (dt.Rows.Count > 0)
                {
                    DataRow row = dt.Rows[0];
                    return new
                    {
                        id = Convert.ToInt32(row["id"]),
                        username = row["username"].ToString(),
                        fullName = row["full_name"].ToString(),
                        role = row["role"].ToString().ToLower() // Return lowercase to match React expectations
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
        /// Registers a new PATIENT.
        /// Creates a Users row + a Patient_Profiles row.
        /// </summary>
        public dynamic RegisterUser(
            string fullName,
            string username,
            string password,
            string bloodType,
            string gender,
            string phone,
            string address)
        {
            try
            {
                if (_userRepository.UserExists(username))
                    return new { ok = false, message = "Username already exists." };

                // 1) Insert into Users
                int userId = _userRepository.CreateUser(username, password, "PATIENT");
                if (userId <= 0)
                    return new { ok = false, message = "Failed to create user." };

                // 2) Insert into Patient_Profiles
                bool profileOk = _userRepository.CreatePatientProfile(
                    userId,
                    fullName,
                    bloodType,
                    gender,
                    phone,
                    address);

                if (!profileOk)
                    return new { ok = false, message = "Failed to create patient profile." };

                return new
                {
                    id = userId,
                    username = username,
                    fullName = fullName,
                    role = "patient"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AuthService] RegisterUser failed: {ex.Message}");
                return new { ok = false, message = "Registration failed due to server error." };
            }
        }
    }
}

