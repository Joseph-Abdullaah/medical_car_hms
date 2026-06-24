using System;
using System.Collections.Generic;
using System.Data;
using HospitalManagementSystem.Repositories;

namespace HospitalManagementSystem.Services
{
    public class DepartmentService
    {
        private readonly DepartmentRepository _deptRepository = new DepartmentRepository();

        /// <summary>
        /// Returns all departments with their doctor count.
        /// </summary>
        public List<dynamic> GetAllDepartments()
        {
            var list = new List<dynamic>();
            try
            {
                DataTable dt = _deptRepository.FetchAll();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        id          = Convert.ToInt32(row["dept_id"]),
                        deptName    = row["dept_name"].ToString(),
                        doctorCount = Convert.ToInt32(row["doctor_count"])
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DepartmentService] GetAllDepartments failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Creates a new department.
        /// </summary>
        public dynamic CreateDepartment(string deptName)
        {
            try
            {
                int newId = _deptRepository.Insert(deptName);
                if (newId > 0)
                {
                    return new { id = newId, deptName = deptName, doctorCount = 0 };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DepartmentService] CreateDepartment failed: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Updates a department's name.
        /// </summary>
        public bool UpdateDepartment(int deptId, string deptName)
        {
            try
            {
                return _deptRepository.Update(deptId, deptName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DepartmentService] UpdateDepartment failed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Deletes a department. Fails if doctors are still assigned.
        /// </summary>
        public bool DeleteDepartment(int deptId)
        {
            try
            {
                return _deptRepository.Delete(deptId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DepartmentService] DeleteDepartment failed: {ex.Message}");
                return false;
            }
        }
    }
}
