using System;
using System.Collections.Generic;
using System.Data;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class DoctorService
    {
        private readonly DoctorRepository _doctorRepository = new DoctorRepository();

        /// <summary>
        /// Fetches all active on-call and specialist medical doctors.
        /// </summary>
        public List<dynamic> GetAllDoctors()
        {
            var doctorsList = new List<dynamic>();
            try
            {
                DataTable dt = _doctorRepository.FetchAll();
                foreach (DataRow row in dt.Rows)
                {
                    doctorsList.Add(new
                    {
                        id = row["id"].ToString(),
                        fullName = row["full_name"].ToString(),
                        specialty = row["specialty"].ToString(),
                        title = row["title"].ToString(),
                        email = row["email"].ToString(),
                        phone = row["phone"].ToString(),
                        status = row["status"].ToString(),
                        availabilityText = row["availability_text"].ToString(),
                        experienceYears = Convert.ToInt32(row["experience_years"]),
                        languages = row["languages"].ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# DoctorService Error] GetAllDoctors failed: {ex.Message}");
            }
            return doctorsList;
        }
    }
}
