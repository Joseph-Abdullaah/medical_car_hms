import React, { useState, useEffect } from "react";
import {
  Users,
  CalendarDays,
  FileText,
  Plus,
  ChevronRight,
  CheckCircle,
  XCircle,
  Check,
  Printer,
  Share2,
  FileCheck,
} from "lucide-react";
import { Bridge, User as UserType, Patient, Appointment, MedicalRecord } from "../services/bridge";

interface DoctorPortalProps {
  user: UserType;
  activeSection: string;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ user, activeSection }) => {
  const [patients,     setPatients]     = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records,      setRecords]      = useState<MedicalRecord[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedRecord,  setSelectedRecord]  = useState<MedicalRecord | null>(null);
  const [selectedAppt,    setSelectedAppt]    = useState<Appointment | null>(null);

  const [showPatientModal,    setShowPatientModal]    = useState(false);
  const [showRecordModal,     setShowRecordModal]     = useState(false);
  const [showAddRecordModal,  setShowAddRecordModal]  = useState(false);
  const [showStatusModal,     setShowStatusModal]     = useState(false);

  // Add Record form — only schema fields: diagnosis + prescription
  const [newRecord, setNewRecord] = useState({
    patientId: "",
    visitDate: new Date().toISOString().split("T")[0],
    diagnosis: "",
    prescription: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patList, apptList, recList] = await Promise.all([
        Bridge.getPatients(),
        Bridge.getAppointments(),
        Bridge.getMedicalRecords(),
      ]);
      setPatients(patList);
      setAppointments(apptList);
      setRecords(recList);
    } catch (err) {
      console.error("DoctorPortal fetchData failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtered data for this doctor only ───────────────────────────────────────
  const doctorId = String(user.id);

  const docAppointments = appointments.filter(a => String(a.doctorId) === doctorId);
  const docRecords      = records.filter(r => String(r.doctorId) === doctorId);

  // Patients who have at least one appointment with this doctor
  const docPatientIds = new Set(docAppointments.map(a => String(a.patientId)));
  const docPatients   = patients.filter(p => docPatientIds.has(String(p.id)));

  // ── Status badge ─────────────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":  return "bg-teal-100 text-teal-700";
      case "COMPLETED":  return "bg-emerald-100 text-emerald-700";
      case "CANCELLED":  return "bg-red-100 text-red-700";
      default:           return "bg-amber-100 text-amber-700"; // PENDING
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    try {
      await Bridge.updateAppointmentStatus(id, status);
      setShowStatusModal(false);
      setSelectedAppt(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.patientId || !newRecord.diagnosis || !newRecord.prescription) {
      alert("Patient, diagnosis and prescription are required.");
      return;
    }
    try {
      await Bridge.addMedicalRecord({
        patientId:    newRecord.patientId,
        doctorId:     doctorId,
        diagnosis:    newRecord.diagnosis,
        prescription: newRecord.prescription,
        visitDate:    newRecord.visitDate,
      });
      setShowAddRecordModal(false);
      setNewRecord({ patientId: "", visitDate: new Date().toISOString().split("T")[0], diagnosis: "", prescription: "" });
      fetchData();
    } catch (err) { console.error(err); }
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

      {/* ── DASHBOARD ── */}
      {activeSection === "dashboard" && (
        <>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
              Good day, {user.fullName}
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              You have {docAppointments.length} appointment{docAppointments.length !== 1 ? "s" : ""} on record.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">My Patients</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{docPatients.length}</h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-xl">
                  <CalendarDays className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Appointments</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{docAppointments.length}</h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Medical Records</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{docRecords.length}</h3>
            </div>
          </div>

          {/* Recent appointments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-950 dark:text-white text-base">Recent Appointments</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {docAppointments.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-sm text-slate-400 italic">No appointments yet.</td></tr>
                  ) : docAppointments.slice(0, 5).map(a => {
                    const initials = a.patientName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs select-none">{initials}</div>
                            <div>
                              <p className="font-semibold text-sm text-slate-900 dark:text-white">{a.patientName}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">ID: {a.patientId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{a.appointmentDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${statusBadge(a.status)}`}>
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
        </>
      )}

      {/* ── MY PATIENTS ── */}
      {activeSection === "patients" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">My Patients</h3>
            <p className="text-sm text-slate-500 font-medium">Patients who have appointments assigned to you.</p>
          </div>

          {docPatients.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic text-sm">
              No patients assigned yet. Patients appear here once an appointment is scheduled with you.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docPatients.map(p => {
                const initials = p.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                // Count records and appointments for this patient
                const patAppts   = docAppointments.filter(a => String(a.patientId) === String(p.id));
                const patRecords = docRecords.filter(r => String(r.patientId) === String(p.id));
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedPatient(p); setShowPatientModal(true); }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md cursor-pointer transition-all border-l-4 border-l-blue-600 hover:scale-[1.01]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm select-none">{initials}</div>
                        <div>
                          <h4 className="font-bold text-slate-950 dark:text-white text-base leading-tight">{p.fullName}</h4>
                          <p className="text-xs text-slate-400 font-semibold">ID: {p.id}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-slate-400">Gender</p>
                        <p className="text-slate-900 dark:text-white font-bold mt-0.5">{p.gender || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Blood Type</p>
                        <p className="text-red-600 font-bold mt-0.5">{p.bloodType || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Appointments</p>
                        <p className="text-slate-900 dark:text-white font-bold mt-0.5">{patAppts.length}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Records</p>
                        <p className="text-slate-900 dark:text-white font-bold mt-0.5">{patRecords.length}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── APPOINTMENTS ── */}
      {activeSection === "appointments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">My Appointments</h3>
              <p className="text-sm text-slate-500 font-medium">View and update the status of your scheduled visits.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {docAppointments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-sm text-slate-400 italic">No appointments found.</td></tr>
                  ) : docAppointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{a.id}</td>
                      <td className="px-6 py-4 font-semibold text-sm text-slate-950 dark:text-white">{a.patientName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{a.appointmentDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${statusBadge(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.status !== "COMPLETED" && a.status !== "CANCELLED" && (
                          <button
                            onClick={() => { setSelectedAppt(a); setShowStatusModal(true); }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Update Status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MEDICAL RECORDS ── */}
      {activeSection === "records" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Medical Records</h3>
              <p className="text-sm text-slate-500 font-medium">Create and review clinical records for your patients.</p>
            </div>
            <button
              onClick={() => setShowAddRecordModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Record</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-4">Record ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Visit Date</th>
                    <th className="px-6 py-4">Diagnosis</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {docRecords.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-sm text-slate-400 italic">No records yet. Create one using the button above.</td></tr>
                  ) : docRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500 font-mono">{r.id}</td>
                      <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-white">{r.patientName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{r.visitDate}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {r.diagnosis}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setSelectedRecord(r); setShowRecordModal(true); }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Record
                        </button>
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

      {/* PATIENT DETAIL MODAL */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg select-none">
                  {selectedPatient.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-950 dark:text-white">{selectedPatient.fullName}</h3>
                  <p className="text-xs text-slate-400 font-semibold">User ID: {selectedPatient.id}</p>
                </div>
              </div>
              <button onClick={() => setShowPatientModal(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Full Name",   value: selectedPatient.fullName   },
                  { label: "Gender",      value: selectedPatient.gender || "—"     },
                  { label: "Blood Type",  value: selectedPatient.bloodType || "—", accent: "text-red-600 font-bold" },
                  { label: "Phone",       value: selectedPatient.phone || "—"      },
                  { label: "Address",     value: selectedPatient.address || "—"    },
                  { label: "Username",    value: selectedPatient.username || "—"   },
                ].map(field => (
                  <div key={field.label} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{field.label}</p>
                    <p className={`font-semibold ${field.accent || "text-slate-900 dark:text-white"}`}>{field.value}</p>
                  </div>
                ))}
              </div>

              {/* Appointment summary for this patient */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Appointments with you</p>
                <div className="space-y-2">
                  {docAppointments.filter(a => String(a.patientId) === String(selectedPatient.id)).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">None yet.</p>
                  ) : docAppointments.filter(a => String(a.patientId) === String(selectedPatient.id)).map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{a.appointmentDate}</span>
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full ${statusBadge(a.status)}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setShowPatientModal(false)} className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-950 dark:text-white">Update Appointment Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4">
                Appointment for <span className="font-bold text-slate-950 dark:text-white">{selectedAppt.patientName}</span> on {selectedAppt.appointmentDate}
              </p>

              <button
                onClick={() => handleUpdateStatus(selectedAppt.id, "CONFIRMED")}
                className="w-full flex items-center justify-between p-3.5 border hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all font-semibold text-sm"
              >
                <span>Confirm Appointment</span>
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedAppt.id, "COMPLETED")}
                className="w-full flex items-center justify-between p-3.5 border hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all font-semibold text-sm"
              >
                <span>Mark as Completed</span>
                <Check className="w-5 h-5 text-emerald-600" />
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedAppt.id, "CANCELLED")}
                className="w-full flex items-center justify-between p-3.5 border hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-red-600 transition-all font-semibold text-sm"
              >
                <span>Cancel Appointment</span>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICAL RECORD MODAL */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">New Medical Record</h3>
                <p className="text-xs text-slate-500">Record a diagnosis and prescription for a patient.</p>
              </div>
              <button onClick={() => setShowAddRecordModal(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Patient *</label>
                  <select required value={newRecord.patientId}
                    onChange={e => setNewRecord({...newRecord, patientId: e.target.value})} className={inputCls}>
                    <option value="">Select patient...</option>
                    {docPatients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Visit Date *</label>
                  <input required type="date" value={newRecord.visitDate}
                    onChange={e => setNewRecord({...newRecord, visitDate: e.target.value})} className={inputCls} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Diagnosis *</label>
                <input required type="text" value={newRecord.diagnosis}
                  onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})}
                  placeholder="e.g. Acute Bronchitis J20.9"
                  className={inputCls} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Prescription *</label>
                <textarea required value={newRecord.prescription}
                  onChange={e => setNewRecord({...newRecord, prescription: e.target.value})}
                  placeholder="Medication, dosage, duration..."
                  className={`${inputCls} h-28 resize-none`} />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddRecordModal(false)} className="px-4 py-2 border rounded-lg text-sm text-slate-600">Discard</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MEDICAL RECORD MODAL */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="font-mono text-xs text-slate-400 font-bold">RECORD #{selectedRecord.id}</span>
              <div className="flex gap-2 text-slate-500">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Printer className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={() => setShowRecordModal(false)} className="text-xl px-2 leading-none hover:text-slate-700">×</button>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-950 max-h-[65vh] overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm space-y-6 relative">
                {/* Watermark */}
                <div className="absolute inset-x-0 top-1/3 text-center opacity-[0.04] select-none pointer-events-none rotate-12">
                  <span className="text-7xl font-extrabold text-blue-600 tracking-widest block uppercase">CERTIFIED</span>
                  <span className="text-2xl mt-1 text-blue-600 font-bold tracking-widest block">MEDICARE HMS</span>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-blue-100 dark:border-slate-700 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">MediCare HMS</p>
                    <h4 className="text-xl font-bold dark:text-white mt-1">Clinical Record Summary</h4>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Record ID: <span className="text-slate-900 dark:text-white font-semibold">{selectedRecord.id}</span></p>
                    <p className="mt-1">Visit Date: <span className="text-slate-900 dark:text-white font-semibold">{selectedRecord.visitDate}</span></p>
                  </div>
                </div>

                {/* Patient / Doctor info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-semibold mb-1">Patient</span>
                    <span className="font-bold text-slate-950 dark:text-white">{selectedRecord.patientName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-semibold mb-1">Attending Doctor</span>
                    <span className="font-bold text-slate-950 dark:text-white">{selectedRecord.doctorName}</span>
                  </div>
                </div>

                {/* Clinical details */}
                <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-bold mb-2">Diagnosis</span>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-3">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{selectedRecord.diagnosis || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-bold mb-2">Prescription</span>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedRecord.prescription || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <div>
                    <p className="font-semibold">Dr. {selectedRecord.doctorName}</p>
                    <p>MediCare Hospital Management System</p>
                  </div>
                  <div className="opacity-30 select-none">
                    <FileCheck className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setShowRecordModal(false)} className="px-5 py-2 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
