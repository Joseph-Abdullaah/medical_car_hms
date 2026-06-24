using System;
using System.Collections.Generic;
using System.Data;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class DoctorService
    {
        private readonly DoctorRepository  _doctorRepository  = new DoctorRepository();
        private readonly UserRepository    _userRepository    = new UserRepository();

        /// <summary>
        /// Returns all doctors with real schema columns only.
        /// </summary>
        public List<dynamic> GetAllDoctors()
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _doctorRepository.FetchAll();
                foreach (DataRow row in dt.Rows)
                    list.Add(MapRow(row));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DoctorService] GetAllDoctors failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Creates a doctor account. Admin-only operation.
        /// Inserts into Users (role=DOCTOR) then Doctor_Profiles.
        /// </summary>
        public dynamic CreateDoctor(string fullName, string username, string password, int deptId)
        {
            try
            {
                if (_userRepository.UserExists(username))
                    return null; // Username taken

                string passwordHash = HashPassword(password);
                int userId = _userRepository.CreateUser(username, passwordHash, "DOCTOR");

                if (userId <= 0)
                    return null;

                _userRepository.CreateDoctorProfile(userId, fullName, deptId);

                return new
                {
                    id       = userId,
                    username = username,
                    fullName = fullName,
                    deptId   = deptId
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DoctorService] CreateDoctor failed: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Deletes a doctor account (cascades to Doctor_Profiles).
        /// </summary>
        public bool DeleteDoctor(int userId)
        {
            try
            {
                return _userRepository.DeleteUser(userId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DoctorService] DeleteDoctor failed: {ex.Message}");
                return false;
            }
        }

        private static dynamic MapRow(DataRow row)
        {
            return new
            {
                id       = Convert.ToInt32(row["id"]),
                username = row["username"].ToString(),
                fullName = row["full_name"] != DBNull.Value ? row["full_name"].ToString() : "",
                deptId   = row["dept_id"] != DBNull.Value ? Convert.ToInt32(row["dept_id"]) : 0,
                deptName = row["dept_name"] != DBNull.Value ? row["dept_name"].ToString() : "Unassigned"
            };
        }

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
