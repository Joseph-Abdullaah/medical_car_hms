import React, { useState, useEffect } from "react";
import { 
  Users, 
  Stethoscope, 
  CalendarDays, 
  Search, 
  Plus, 
  TrendingUp, 
  Eye, 
  Trash2, 
  Calendar,
  Layers,
  Heart,
  Brain,
  Baby,
  Activity,
  Trash,
  Clock,
  User,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { Bridge, Patient, Doctor, Appointment } from "../services/bridge";

interface AdminPortalProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeSection, setActiveSection }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Filtering & Searches
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorDeptFilter, setDoctorDeptFilter] = useState("All Departments");
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState("All Status");

  // Modals state
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddAppt, setShowAddAppt] = useState(false);

  // Form parameters
  const [newPatient, setNewPatient] = useState({
    fullName: "",
    dob: "",
    gender: "Male",
    bloodGroup: "O+",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  const [newDoctor, setNewDoctor] = useState({
    id: "",
    fullName: "",
    specialty: "Cardiology",
    title: "Resident Physician",
    email: "",
    phone: "",
    availabilityText: "Daily",
    experienceYears: "5",
    languages: "English"
  });

  const [newAppt, setNewAppt] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "10:00 AM",
    reason: "",
    clinicalNotes: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patList, docList, apptList] = await Promise.all([
        Bridge.getPatients(),
        Bridge.getDoctors(),
        Bridge.getAppointments()
      ]);
      setPatients(patList);
      setDoctors(docList);
      setAppointments(apptList);
    } catch (err) {
      console.error("Error loading administrative catalog", err);
    } finally {
      setLoading(false);
    }
  };

  // Create Patient Form submit
  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.fullName || !newPatient.phone || !newPatient.dob) {
      alert("Please fill in required fields.");
      return;
    }
    try {
      await Bridge.addPatient(newPatient);
      setShowAddPatient(false);
      setNewPatient({
        fullName: "",
        dob: "",
        gender: "Male",
        bloodGroup: "O+",
        phone: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: ""
      });
      fetchData(); // Reload list
    } catch (err) {
      console.error(err);
    }
  };

  // Create Appointment submit
  const handleAddApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId || !newAppt.doctorId || !newAppt.appointmentDate || !newAppt.reason) {
      alert("Please fill in required appointment settings.");
      return;
    }
    try {
      await Bridge.addAppointment(newAppt);
      setShowAddAppt(false);
      setNewAppt({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "10:00 AM",
        reason: "",
        clinicalNotes: ""
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (confirm("Are you sure you want to delete this patient and their clinical histories?")) {
      try {
        await Bridge.deletePatient(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter lists
  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredDoctors = doctors.filter(
    (d) =>
      (d.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.id.toLowerCase().includes(doctorSearch.toLowerCase())) &&
      (doctorDeptFilter === "All Departments" || d.specialty === doctorDeptFilter)
  );

  const filteredAppointments = appointments.filter(
    (a) =>
      (a.patientName.toLowerCase().includes(apptSearch.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(apptSearch.toLowerCase()) ||
        a.id.toLowerCase().includes(apptSearch.toLowerCase())) &&
      (apptStatusFilter === "All Status" || a.status === apptStatusFilter)
  );

  return (
    <div className="p-6 space-y-6">
      
      {/* 1. SECTION: DASHBOARD */}
      {activeSection === "dashboard" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                    TOTAL REGISTERED PATIENTS
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                    {patients.length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +12%
                </span>
                <span className="text-slate-500">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                    ACTIVE HOSPITAL DOCTORS
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                    {doctors.length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                  <Stethoscope className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs">
                <span className="text-emerald-600 font-bold">+3</span>
                <span className="text-slate-500">specialists onboarded</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                    TOTAL VISIT SLOTS
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                    {appointments.length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                  <CalendarDays className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span>Next slot: Tomorrow 09:00 AM</span>
              </div>
            </div>
          </div>

          {/* Bento Secondary layout (Chart + Activities) */}
          <div className="grid grid-cols-12 gap-6 w-full">
            <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-950 dark:text-white text-base">
                  Weekly Appointment Loading
                </h4>
                <span className="text-xs text-slate-500 font-semibold">Real-Time Data Integration</span>
              </div>
              
              {/* SVG vector chart line representation */}
              <div className="h-64 w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full p-4" viewBox="0 0 800 250" fill="none">
                  <path
                    d="M 50 180 C 150 140, 200 210, 300 130 C 400 60, 500 180, 600 50 C 700 80, 750 30, 800 10"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <g className="opacity-10 stroke-slate-300 dark:stroke-slate-700" strokeWidth="1">
                    <line x1="0" x2="800" y1="50" y2="50" />
                    <line x1="0" x2="800" y1="100" y2="100" />
                    <line x1="0" x2="800" y1="150" y2="150" />
                    <line x1="0" x2="800" y1="200" y2="200" />
                  </g>
                  {/* Grid labels */}
                  <g className="fill-slate-400 text-xs" fontSize="10">
                    <text x="50" y="240">Mon</text>
                    <text x="175" y="240">Tue</text>
                    <text x="300" y="240">Wed</text>
                    <text x="425" y="240">Thu</text>
                    <text x="550" y="240">Fri</text>
                    <text x="675" y="240">Sat</text>
                    <text x="750" y="240">Sun</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h4 className="font-bold text-slate-950 dark:text-white text-base mb-6">
                Active Hospital Logs
              </h4>
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                <div className="flex gap-4 relative">
                  <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-xs text-slate-900 dark:text-white font-semibold">
                      New patient registration completed
                    </p>
                    <p className="text-[10px] text-slate-400">Just now</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-950/20 text-blue-600 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-xs text-slate-900 dark:text-white font-semibold">
                      Appointment booked with Cardiology
                    </p>
                    <p className="text-[10px] text-slate-400">45 minutes ago</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-xs text-slate-900 dark:text-white font-semibold">
                      Dr. Smith finalized patient record
                    </p>
                    <p className="text-[10px] text-slate-400">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. SECTION: PATIENTS */}
      {activeSection === "patients" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patient registry by name or ID..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowAddPatient(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add Patient</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Gender</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">DOB</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Reg Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-sm text-slate-500 italic">
                        No registered patients matching requirements found.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => {
                      const initials = p.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-blue-600">{p.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs select-none">
                                {initials}
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white text-sm">{p.fullName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 capitalize">{p.gender}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.dob}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.phone}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.regDate}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeletePatient(p.id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Patient"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTION: DOCTORS */}
      {activeSection === "doctors" && (
        <div className="space-y-6">
          {/* Per department distribution widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-950/20 text-sky-600 rounded-lg">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Cardiology</p>
                <p className="text-xl font-bold">{doctors.filter(d => d.specialty === "Cardiology").length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-950/20 text-purple-600 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Neurology</p>
                <p className="text-xl font-bold">{doctors.filter(d => d.specialty === "Neurology").length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/20 text-amber-600 rounded-lg">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Pediatrics</p>
                <p className="text-xl font-bold">{doctors.filter(d => d.specialty === "Pediatrics").length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-teal-100 dark:bg-teal-950/20 text-teal-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">General Med</p>
                <p className="text-xl font-bold">{doctors.filter(d => d.specialty === "General Medicine").length}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-1 w-full md:w-auto items-center bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-850">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search staff library by name, ID or languages..."
                className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                value={doctorDeptFilter}
                onChange={(e) => setDoctorDeptFilter(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-sm py-2 px-3 outline-none"
              >
                <option>All Departments</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Pediatrics</option>
                <option>General Medicine</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-0 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Doctor ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Full Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Department</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Title</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Availability</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredDoctors.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-5/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{d.id}</td>
                      <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-white">{d.fullName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                          {d.specialty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{d.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{d.availabilityText}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${d.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                          <span className="text-sm font-medium">{d.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION: APPOINTMENTS */}
      {activeSection === "appointments" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={apptSearch}
                onChange={(e) => setApptSearch(e.target.value)}
                placeholder="Search appointments..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-sm py-2 px-3 outline-none"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <button
                onClick={() => setShowAddAppt(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Schedule Visit</span>
              </button>
            </div>
          </div>

          {/* Grid Appointments list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/10 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Patient</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Doctor</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Schedule</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Reason</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dbAppointmentsState(filteredAppointments)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PATIENT */}
      {showAddPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Add New Patient</h3>
                <p className="text-xs text-slate-500">Fill in demographic and clinical details to create record.</p>
              </div>
              <button onClick={() => setShowAddPatient(false)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            <form onSubmit={handleAddPatientSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.fullName}
                    onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                    placeholder="e.g. Elias Johnson"
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={newPatient.dob}
                    onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="(555) 012-3456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Emergency Name</label>
                  <input
                    type="text"
                    value={newPatient.emergencyContactName}
                    onChange={(e) => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
                    placeholder="Contact Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Permanent Address</label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Enter residential address"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD APPOINTMENT */}
      {showAddAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Schedule Visit</h3>
                <p className="text-xs text-slate-500">Establish a scheduled session for checked patents.</p>
              </div>
              <button onClick={() => setShowAddAppt(false)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            <form onSubmit={handleAddApptSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Select Patient *</label>
                  <select
                    required
                    value={newAppt.patientId}
                    onChange={(e) => setNewAppt({ ...newAppt, patientId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Choose Patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Select Doctor *</label>
                  <select
                    required
                    value={newAppt.doctorId}
                    onChange={(e) => setNewAppt({ ...newAppt, doctorId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Choose Specialist...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.fullName} - {d.specialty}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Schedule Date *</label>
                  <input
                    type="date"
                    required
                    value={newAppt.appointmentDate}
                    onChange={(e) => setNewAppt({ ...newAppt, appointmentDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Schedule Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={newAppt.appointmentTime}
                    onChange={(e) => setNewAppt({ ...newAppt, appointmentTime: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Reason for Visit *</label>
                <textarea
                  required
                  value={newAppt.reason}
                  onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })}
                  placeholder="Primary complaint description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-16"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAppt(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-lg py-2 bg-primary text-on-primary font-button rounded-lg hover:bg-primary-active transition-all"
                >
                  Book Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getAppointmentsStatusClass = (status: string) => {
  switch (status) {
    case "Approved": return "bg-sticker-teal/10 text-sticker-teal";
    case "Completed": return "bg-sticker-green/10 text-sticker-green";
    case "Cancelled": return "bg-error-container text-error";
    default: return "bg-sticker-orange/10 text-sticker-orange";
  }
}

const getDbGridStyle = (initials: string) => {
  const styles = [
    "bg-sticker-sky/10 text-sticker-sky",
    "bg-sticker-pink/10 text-sticker-pink",
    "bg-sticker-purple/10 text-sticker-purple",
    "bg-sticker-teal/10 text-sticker-teal"
  ];
  const charCode = initials.charCodeAt(0) || 0;
  return styles[charCode % styles.length];
}

const getFilteredAppointments = (filteredAppointments: Appointment[]) => {
  return filteredAppointments;
}

const dbFilteredAppts = (appts: Appointment[]) => {
  return appts;
}

const dbAppointmentsState = (filtered: any[]) => {
  if (filtered.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="text-center py-8 text-sm text-slate-500 italic">
          No hospital appointments matching filters found.
        </td>
      </tr>
    );
  }
  return filtered.map((a: any) => {
    const initials = a.patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
    return (
      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{a.id}</td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getDbGridStyle(initials)}`}>
              {initials}
            </div>
            <span className="font-semibold text-sm text-slate-900 dark:text-white">{a.patientName}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{a.doctorName}</td>
        <td className="px-6 py-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.appointmentDate}</p>
          <p className="text-xs text-slate-400 font-semibold">{a.appointmentTime}</p>
        </td>
        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{a.reason}</td>
        <td className="px-6 py-4">
          <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${getAppointmentsStatusClass(a.status)}`}>
            {a.status}
          </span>
        </td>
      </tr>
    );
  });
}
