import React, { useState, useEffect } from "react";
import {
  Users,
  Stethoscope,
  CalendarDays,
  Search,
  Plus,
  Trash2,
  Layers,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { Bridge, Patient, Doctor, Appointment, Department } from "../services/bridge";

interface AdminPortalProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeSection }) => {
  // ── Data ─────────────────────────────────────────────────────────────────────
  const [patients,     setPatients]     = useState<Patient[]>([]);
  const [doctors,      setDoctors]      = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [patientSearch,    setPatientSearch]    = useState("");
  const [doctorSearch,     setDoctorSearch]     = useState("");
  const [doctorDeptFilter, setDoctorDeptFilter] = useState("all");
  const [apptSearch,       setApptSearch]       = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState("all");

  // ── Modals ────────────────────────────────────────────────────────────────────
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddDoctor,  setShowAddDoctor]  = useState(false);
  const [showAddAppt,    setShowAddAppt]    = useState(false);
  const [showAddDept,    setShowAddDept]    = useState(false);
  const [showEditDept,   setShowEditDept]   = useState(false);
  const [editDept,       setEditDept]       = useState<Department | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────────
  const [newPatient, setNewPatient] = useState({
    fullName: "", username: "", password: "",
    bloodType: "O+", gender: "Male", phone: "", address: "",
  });
  const [newDoctor, setNewDoctor] = useState({
    fullName: "", username: "", password: "", deptId: "",
  });
  const [newAppt, setNewAppt] = useState({
    patientId: "", doctorId: "", appointmentDate: "",
  });
  const [newDeptName,  setNewDeptName]  = useState("");
  const [editDeptName, setEditDeptName] = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [patList, docList, apptList, deptList] = await Promise.all([
        Bridge.getPatients(),
        Bridge.getDoctors(),
        Bridge.getAppointments(),
        Bridge.getDepartments(),
      ]);
      setPatients(patList);
      setDoctors(docList);
      setAppointments(apptList);
      setDepartments(deptList);
    } catch (err) {
      console.error("AdminPortal fetchData failed:", err);
      setError("Failed to load data. Check database connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Dashboard computed values ─────────────────────────────────────────────────

  // Appointments grouped by day of week — derived from real DB data
  const weeklyChartData = (() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, idx) => {
      const dayIndex = (idx + 1) % 7; // Mon=1 … Sat=6, Sun=0
      return {
        day,
        count: appointments.filter(a => {
          try { return new Date(a.appointmentDate).getDay() === dayIndex; }
          catch { return false; }
        }).length,
      };
    });
  })();
  const maxBarCount = Math.max(...weeklyChartData.map(d => d.count), 1);

  const statusBreakdown = [
    { label: "Pending",   status: "PENDING",   dot: "bg-amber-500",   pill: "bg-amber-100 text-amber-700"   },
    { label: "Confirmed", status: "CONFIRMED",  dot: "bg-blue-500",    pill: "bg-blue-100 text-blue-700"     },
    { label: "Completed", status: "COMPLETED",  dot: "bg-emerald-500", pill: "bg-emerald-100 text-emerald-700" },
    { label: "Cancelled", status: "CANCELLED",  dot: "bg-red-400",     pill: "bg-red-100 text-red-700"       },
  ].map(s => ({ ...s, count: appointments.filter(a => a.status === s.status).length }));

  // ── Handlers — Patients ───────────────────────────────────────────────────────
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.fullName || !newPatient.username || !newPatient.password) {
      alert("Full name, username and password are required.");
      return;
    }
    try {
      await Bridge.addPatient(newPatient);
      setShowAddPatient(false);
      setNewPatient({ fullName: "", username: "", password: "", bloodType: "O+", gender: "Male", phone: "", address: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to add patient.");
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm("Delete this patient and all their records?")) return;
    try {
      await Bridge.deletePatient(id);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // ── Handlers — Doctors ────────────────────────────────────────────────────────
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.fullName || !newDoctor.username || !newDoctor.password || !newDoctor.deptId) {
      alert("All fields are required.");
      return;
    }
    try {
      await Bridge.addDoctor(newDoctor.fullName, newDoctor.username, newDoctor.password, parseInt(newDoctor.deptId));
      setShowAddDoctor(false);
      setNewDoctor({ fullName: "", username: "", password: "", deptId: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to add doctor.");
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Delete this doctor?")) return;
    try {
      await Bridge.deleteDoctor(id);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // ── Handlers — Appointments ───────────────────────────────────────────────────
  const handleAddAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId || !newAppt.doctorId || !newAppt.appointmentDate) {
      alert("Please fill in all appointment fields.");
      return;
    }
    try {
      await Bridge.addAppointment(newAppt);
      setShowAddAppt(false);
      setNewAppt({ patientId: "", doctorId: "", appointmentDate: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to schedule appointment.");
    }
  };

  // ── Handlers — Departments ────────────────────────────────────────────────────
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      await Bridge.addDepartment({ deptName: newDeptName.trim() });
      setShowAddDept(false);
      setNewDeptName("");
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEditDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept || !editDeptName.trim()) return;
    try {
      await Bridge.updateDepartment(editDept.id, { deptName: editDeptName.trim() });
      setShowEditDept(false);
      setEditDept(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteDept = async (id: number) => {
    if (!confirm("Delete this department? Fails if doctors are still assigned.")) return;
    try {
      await Bridge.deleteDepartment(id);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // ── Filtered lists ────────────────────────────────────────────────────────────
  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    String(p.id).includes(patientSearch)
  );

  const filteredDoctors = doctors.filter(d =>
    (d.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
     String(d.id).includes(doctorSearch)) &&
    (doctorDeptFilter === "all" || d.deptName === doctorDeptFilter)
  );

  const filteredAppointments = appointments.filter(a =>
    (a.patientName.toLowerCase().includes(apptSearch.toLowerCase()) ||
     a.doctorName.toLowerCase().includes(apptSearch.toLowerCase()) ||
     String(a.id).includes(apptSearch)) &&
    (apptStatusFilter === "all" || a.status === apptStatusFilter)
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":  return "bg-blue-100 text-blue-700";
      case "COMPLETED":  return "bg-emerald-100 text-emerald-700";
      case "CANCELLED":  return "bg-red-100 text-red-700";
      default:           return "bg-amber-100 text-amber-700";
    }
  };

  const inputCls = "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-600";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {activeSection === "dashboard" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Total Patients</p>
                  <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white">{patients.length}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                {departments.length} department{departments.length !== 1 ? "s" : ""} active
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Active Doctors</p>
                  <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white">{doctors.length}</h3>
                </div>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                  <Stethoscope className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                Across {departments.length} department{departments.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Total Appointments</p>
                  <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white">{appointments.length}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                  <CalendarDays className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                {appointments.filter(a => a.status === "PENDING").length} pending review
              </div>
            </div>
          </div>

          {/* Chart + Status Breakdown */}
          <div className="grid grid-cols-12 gap-6">
            {/* Weekly Bar Chart — built from real DB appointment dates */}
            <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-950 dark:text-white text-base">Appointments by Day of Week</h4>
                <span className="text-xs text-slate-500 font-semibold">{appointments.length} total records</span>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden" style={{ minHeight: "240px" }}>
                <svg viewBox="0 0 756 230" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75, 1].map(ratio => {
                    const y = 200 - ratio * 170;
                    return (
                      <g key={ratio}>
                        <line x1="36" x2="745" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2" />
                        <text x="30" y={y + 4} fontSize="8" fill="#94a3b8" textAnchor="end">
                          {Math.round(maxBarCount * ratio)}
                        </text>
                      </g>
                    );
                  })}
                  {/* Bars */}
                  {weeklyChartData.map((d, i) => {
                    const barW = 72;
                    const gap  = 24;
                    const x    = 40 + i * (barW + gap);
                    const barH = (d.count / maxBarCount) * 170;
                    const y    = 200 - barH;
                    return (
                      <g key={d.day}>
                        {barH > 0 ? (
                          <rect x={x} y={y} width={barW} height={barH} rx="5" fill="#2563eb" opacity="0.85" />
                        ) : (
                          <rect x={x} y={198} width={barW} height={2} rx="1" fill="#e2e8f0" />
                        )}
                        {d.count > 0 && (
                          <text x={x + barW / 2} y={y - 5} fontSize="9" fill="#475569" textAnchor="middle" fontWeight="600">
                            {d.count}
                          </text>
                        )}
                        <text x={x + barW / 2} y="218" fontSize="10" fill="#64748b" textAnchor="middle">{d.day}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Appointment Status Breakdown */}
            <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
              <h4 className="font-bold text-slate-950 dark:text-white text-base mb-6">Status Breakdown</h4>
              <div className="flex flex-col gap-4 flex-1 justify-center">
                {statusBreakdown.map(s => (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${s.dot}`} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.pill}`}>{s.count}</span>
                  </div>
                ))}
                <div className="mt-3 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>{appointments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PATIENTS ── */}
      {activeSection === "patients" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>
            <button onClick={() => setShowAddPatient(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
              <Plus className="w-5 h-5" /><span>Add Patient</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    {["ID", "Full Name", "Blood Type", "Gender", "Phone", "Address", "Actions"].map(h => (
                      <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPatients.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-sm text-slate-400 italic">No patients found.</td></tr>
                  ) : filteredPatients.map(p => {
                    const initials = p.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{p.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs select-none">{initials}</div>
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{p.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-red-600">{p.bloodType || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.gender || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.phone || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-[180px] truncate">{p.address || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeletePatient(p.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete Patient">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCTORS ── */}
      {activeSection === "doctors" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-1 w-full items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input type="text" value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)}
                placeholder="Search by name or ID..."
                className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none" />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select value={doctorDeptFilter} onChange={e => setDoctorDeptFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm py-2 px-3 outline-none">
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.deptName}>{d.deptName}</option>)}
              </select>
              <button onClick={() => setShowAddDoctor(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap">
                <Plus className="w-4 h-4" /><span>Add Doctor</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    {["ID", "Full Name", "Username", "Department", "Actions"].map(h => (
                      <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDoctors.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-sm text-slate-400 italic">No doctors found.</td></tr>
                  ) : filteredDoctors.map(d => {
                    const initials = d.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{d.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs select-none">{initials}</div>
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{d.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{d.username}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                            {d.deptName || "Unassigned"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteDoctor(d.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete Doctor">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── APPOINTMENTS ── */}
      {activeSection === "appointments" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={apptSearch} onChange={e => setApptSearch(e.target.value)}
                placeholder="Search by patient, doctor or ID..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-600 outline-none" />
            </div>
            <div className="flex gap-3">
              <select value={apptStatusFilter} onChange={e => setApptStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm py-2 px-3 outline-none">
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button onClick={() => setShowAddAppt(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
                <Plus className="w-5 h-5" /><span>Schedule</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    {["ID", "Patient", "Doctor", "Date", "Status"].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAppointments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-sm text-slate-400 italic">No appointments found.</td></tr>
                  ) : filteredAppointments.map(a => {
                    const initials = a.patientName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{a.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs select-none">{initials}</div>
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{a.patientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{a.doctorName}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{a.appointmentDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${statusBadge(a.status)}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DEPARTMENTS ── */}
      {activeSection === "departments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h3>
              <p className="text-sm text-slate-500 font-medium">Manage hospital departments and their assigned doctors.</p>
            </div>
            <button onClick={() => setShowAddDept(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
              <Plus className="w-5 h-5" /><span>Add Department</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    {["Dept ID", "Department Name", "Doctor Count", "Actions"].map(h => (
                      <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departments.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-sm text-slate-400 italic">No departments yet. Add one to get started.</td></tr>
                  ) : departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{dept.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{dept.deptName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
                          {dept.doctorCount} doctor{dept.doctorCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditDept(dept); setEditDeptName(dept.deptName); setShowEditDept(true); }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 rounded-lg transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteDept(dept.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* ══ MODALS ══════════════════════════════════════════════════════════════ */}

      {/* ADD PATIENT */}
      {showAddPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Add New Patient</h3>
                <p className="text-xs text-slate-500">Creates a user account and patient profile.</p>
              </div>
              <button onClick={() => setShowAddPatient(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                  <input required type="text" value={newPatient.fullName} placeholder="e.g. John Doe"
                    onChange={e => setNewPatient({...newPatient, fullName: e.target.value})} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Username *</label>
                  <input required type="text" value={newPatient.username} placeholder="johndoe"
                    onChange={e => setNewPatient({...newPatient, username: e.target.value})} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Password *</label>
                  <input required type="password" value={newPatient.password} placeholder="••••••••"
                    onChange={e => setNewPatient({...newPatient, password: e.target.value})} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Blood Type</label>
                  <select value={newPatient.bloodType} onChange={e => setNewPatient({...newPatient, bloodType: e.target.value})} className={inputCls}>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Gender</label>
                  <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} className={inputCls}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Phone</label>
                  <input type="text" value={newPatient.phone} placeholder="(555) 012-3456"
                    onChange={e => setNewPatient({...newPatient, phone: e.target.value})} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Address</label>
                  <input type="text" value={newPatient.address} placeholder="123 Main St"
                    onChange={e => setNewPatient({...newPatient, address: e.target.value})} className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddPatient(false)} className="px-4 py-2 border rounded-lg text-sm text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700">Create Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DOCTOR */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Add New Doctor</h3>
                <p className="text-xs text-slate-500">Creates a doctor account linked to a department.</p>
              </div>
              <button onClick={() => setShowAddDoctor(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddDoctor} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                <input required type="text" value={newDoctor.fullName} placeholder="Dr. Jane Smith"
                  onChange={e => setNewDoctor({...newDoctor, fullName: e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Username *</label>
                <input required type="text" value={newDoctor.username} placeholder="dr.jsmith"
                  onChange={e => setNewDoctor({...newDoctor, username: e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Password *</label>
                <input required type="password" value={newDoctor.password} placeholder="••••••••"
                  onChange={e => setNewDoctor({...newDoctor, password: e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Department *</label>
                <select required value={newDoctor.deptId} onChange={e => setNewDoctor({...newDoctor, deptId: e.target.value})} className={inputCls}>
                  <option value="">Select department...</option>
                  {departments.map(d => <option key={d.id} value={String(d.id)}>{d.deptName}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddDoctor(false)} className="px-4 py-2 border rounded-lg text-sm text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700">Create Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE APPOINTMENT */}
      {showAddAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Schedule Appointment</h3>
                <p className="text-xs text-slate-500">Assign a patient to a doctor on a specific date.</p>
              </div>
              <button onClick={() => setShowAddAppt(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddAppt} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Patient *</label>
                <select required value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})} className={inputCls}>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Doctor *</label>
                <select required value={newAppt.doctorId} onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})} className={inputCls}>
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.deptName}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Appointment Date *</label>
                <input required type="date" value={newAppt.appointmentDate}
                  onChange={e => setNewAppt({...newAppt, appointmentDate: e.target.value})} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddAppt(false)} className="px-4 py-2 border rounded-lg text-sm text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DEPARTMENT */}
      {showAddDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-950 dark:text-white">Add Department</h3>
              <button onClick={() => setShowAddDept(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddDept} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Department Name *</label>
                <input required type="text" value={newDeptName} placeholder="e.g. Cardiology"
                  onChange={e => setNewDeptName(e.target.value)} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddDept(false)} className="px-4 py-2 border rounded-lg text-sm text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEPARTMENT */}
      {showEditDept && editDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-950 dark:text-white">Edit Department</h3>
              <button onClick={() => setShowEditDept(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleEditDept} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Department Name *</label>
                <input required type="text" value={editDeptName}
                  onChange={e => setEditDeptName(e.target.value)} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditDept(false)} className="px-4 py-2 border rounded-lg text-sm text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
