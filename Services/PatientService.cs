using System;
using System.Collections.Generic;
using System.Data;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class PatientService
    {
        private readonly PatientRepository _patientRepository = new PatientRepository();
        private readonly UserRepository    _userRepository    = new UserRepository();

        /// <summary>
        /// Returns all patients with real schema columns only.
        /// </summary>
        public List<dynamic> GetAllPatients()
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _patientRepository.FetchAll();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(MapRow(row));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PatientService] GetAllPatients failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Returns a single patient by user_id.
        /// </summary>
        public dynamic GetPatientById(int userId)
        {
            try
            {
                DataTable dt = _patientRepository.FetchById(userId);
                if (dt.Rows.Count > 0)
                    return MapRow(dt.Rows[0]);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PatientService] GetPatientById failed: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Deletes a patient (cascades to Patient_Profiles via FK).
        /// </summary>
        public bool DeletePatient(int userId)
        {
            try
            {
                return _userRepository.DeleteUser(userId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PatientService] DeletePatient failed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Updates an existing patient's profile fields. Optionally updates username and/or password.
        /// </summary>
        public bool UpdatePatientProfile(int userId, string fullName, string bloodType, string gender, string phone, string address, string newUsername = "", string newPassword = "")
        {
            try
            {
                bool ok = _patientRepository.UpdateProfile(userId, fullName, bloodType, gender, phone, address);
                if (!string.IsNullOrWhiteSpace(newUsername))
                    _userRepository.UpdateUsername(userId, newUsername);
                if (!string.IsNullOrWhiteSpace(newPassword))
                    _userRepository.UpdatePassword(userId, newPassword);
                return ok;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PatientService] UpdatePatientProfile failed: {ex.Message}");
                return false;
            }
        }

        private static dynamic MapRow(DataRow row)
        {
            return new
            {
                id        = Convert.ToInt32(row["id"]),
                username  = row["username"].ToString(),
                fullName  = row["full_name"]  != DBNull.Value ? row["full_name"].ToString()  : "",
                bloodType = row["blood_type"] != DBNull.Value ? row["blood_type"].ToString() : "",
                gender    = row["gender"]     != DBNull.Value ? row["gender"].ToString()     : "",
                phone     = row["phone"]      != DBNull.Value ? row["phone"].ToString()      : "",
                address   = row["address"]    != DBNull.Value ? row["address"].ToString()    : ""
            };
        }
    }
}
