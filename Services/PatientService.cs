using System;
using System.Collections.Generic;
using System.Data;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class PatientService
    {
        private readonly PatientRepository _patientRepository = new PatientRepository();

        /// <summary>
        /// Retrieves all patient accounts stored in the database.
        /// </summary>
        public List<dynamic> GetAllPatients()
        {
            var patientsList = new List<dynamic>();
            try
            {
                DataTable dt = _patientRepository.FetchAll();
                foreach (DataRow row in dt.Rows)
                {
                    patientsList.Add(new
                    {
                        id = row["id"].ToString(),
                        fullName = row["full_name"].ToString(),
                        gender = row["gender"].ToString(),
                        dob = Convert.ToDateTime(row["dob"]).ToString("yyyy-MM-dd"),
                        bloodGroup = row["blood_group"].ToString(),
                        phone = row["phone"].ToString(),
                        address = row["address"].ToString(),
                        emergencyContactName = row["emergency_contact_name"].ToString(),
                        emergencyContactPhone = row["emergency_contact_phone"].ToString(),
                        status = row["status"].ToString(),
                        regDate = Convert.ToDateTime(row["reg_date"]).ToString("yyyy-MM-dd")
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# PatientService Error] GetAllPatients failed: {ex.Message}");
            }
            return patientsList;
        }

        /// <summary>
        /// Creates a new patient registration record with a distinct generated layout.
        /// </summary>
        public dynamic CreatePatient(string fullName, string gender, string dob, string bloodGroup, string phone, string address, string emergencyName, string emergencyPhone)
        {
            try
            {
                // Generate a unique incremental clinical patient identifier
                string newId = "PT-" + new Random().Next(1000, 9999).ToString();
                DateTime birthDate = DateTime.TryParse(dob, out var parsedDob) ? birthDate = parsedDob : birthDate = DateTime.Now.AddYears(-30);
                DateTime regDate = DateTime.Now;

                bool success = _patientRepository.Insert(newId, fullName, gender, birthDate, bloodGroup, phone, address, emergencyName, emergencyPhone, "Active", regDate);

                if (success)
                {
                    return new
                    {
                        id = newId,
                        fullName = fullName,
                        gender = gender,
                        dob = birthDate.ToString("yyyy-MM-dd"),
                        bloodGroup = bloodGroup,
                        phone = phone,
                        address = address,
                        emergencyContactName = emergencyName,
                        emergencyContactPhone = emergencyPhone,
                        status = "Active",
                        regDate = regDate.ToString("yyyy-MM-dd")
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# PatientService Error] CreatePatient failed: {ex.Message}");
            }
            return null;
        }
    }
}
