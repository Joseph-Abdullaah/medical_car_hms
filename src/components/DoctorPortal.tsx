import React, { useState, useEffect } from "react";
import { 
  Users, 
  Stethoscope, 
  CalendarDays, 
  FileText, 
  Search, 
  Plus, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  BookOpen, 
  Brain, 
  Smile, 
  Calendar,
  AlertTriangle,
  User,
  Check,
  Printer,
  Share2,
  FileCheck
} from "lucide-react";
import { Bridge, User as UserType, Patient, Appointment, MedicalRecord } from "../services/bridge";

interface DoctorPortalProps {
  user: UserType;
  activeSection: string;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ user, activeSection }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  // Selected details state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Modals state
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // New record parameters
  const [newRecord, setNewRecord] = useState({
    patientId: "",
    visitDate: new Date().toISOString().split("T")[0],
    symptoms: "",
    diagnosis: "",
    treatmentPlan: "",
    internalNotes: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patList, apptList, recList] = await Promise.all([
        Bridge.getPatients(),
        Bridge.getAppointments(),
        Bridge.getMedicalRecords()
      ]);
      setPatients(patList);
      setAppointments(apptList);
      setRecords(recList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, state: "Approved" | "Completed" | "Cancelled") => {
    try {
      await Bridge.updateAppointmentStatus(id, state);
      setShowStatusModal(false);
      setSelectedAppt(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.patientId || !newRecord.symptoms || !newRecord.diagnosis || !newRecord.treatmentPlan) {
      alert("Please fill in all clinical required items.");
      return;
    }
    try {
      await Bridge.addMedicalRecord({
        ...newRecord,
        doctorId: "DR-8821",
        signedBy: user.fullName
      });
      setShowAddRecordModal(false);
      setNewRecord({
        patientId: "",
        visitDate: new Date().toISOString().split("T")[0],
        symptoms: "",
        diagnosis: "",
        treatmentPlan: "",
        internalNotes: ""
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter lists specifically for Doctor Portal
  // In the real system, doctors are assigned to active appointments
  const docAppointments = appointments.filter(a => a.doctorId === "DR-8821" || a.doctorName.includes("Smith"));
  const docRecords = records.filter(r => r.doctorId === "DR-8821" || r.signedBy.includes("Smith") || r.doctorName.includes("Smith"));

  return (
    <div className="p-6 space-y-6">
      
      {/* SECTION 1: DASHBOARD */}
      {activeSection === "dashboard" && (
        <>
          {/* Welcome Intro */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
              Good morning, {user.fullName}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              You have {docAppointments.length} appointments scheduled.
            </p>
          </div>

          {/* Stats boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Patients */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-350 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full">
                  +4% vs last mo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {patients.length}
              </h3>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-350 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-xl">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                  Next slot: 10:30 AM
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today's Appointments</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {docAppointments.length}
              </h3>
            </div>

            {/* Pending Medical Records */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-350 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-full font-bold">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Medical Records</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                0{docRecords.length}
              </h3>
            </div>
          </div>

          {/* Table list row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Appointments schedule (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-950 dark:text-white text-base">Today's Appointments</h4>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View Calendar</button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/10 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                      <th className="px-6 py-4">Patient Name</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Type/Reason</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {docAppointments.map(a => {
                      const initials = a.patientName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs select-none">
                                {initials}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{a.patientName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{a.patientId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">{a.appointmentTime}</td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-[180px] truncate">{a.reason}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                              a.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                              a.status === "Approved" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
                            }`}>
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

            {/* Recent alarms / alerts (1/3) */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-950 dark:text-white text-base">Critical Patient Alarms</h4>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 h-[350px]">
                <div className="flex gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/40 rounded-xl items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase">Critical Allergy Alert</h5>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-1">
                      Patient Eleanor Mitchell (#PT-8821) reports severe Penicillin hypersensitivity. Extreme caution advised.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-950/40 rounded-xl items-start">
                  <Activity className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">Vitals Threshold Alert</h5>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-1">
                      James Wilson (#PT-8822) indicates elevated systolic blood pressure readings (145/95 mmHg).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SECTION 2: MY PATIENTS */}
      {activeSection === "patients" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Patients</h3>
              <p className="text-sm text-slate-500 font-medium">Click on any patient card to inspect history or diagnostic files.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map(p => {
              const initials = p.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
              return (
                <div 
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setShowPatientModal(true);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md cursor-pointer transition-all border-l-4 border-l-blue-600 hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm select-none">
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-950 dark:text-white text-base">{p.fullName}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{p.id}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-3 border-t border-slate-100 dark:border-slate-850">
                    <div>
                      <p className="text-slate-400">Gender</p>
                      <p className="text-slate-900 dark:text-white font-bold mt-0.5">{p.gender}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Blood Group</p>
                      <p className="text-red-600 font-bold mt-0.5">{p.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">DOB</p>
                      <p className="text-slate-900 dark:text-white mt-0.5">{p.dob}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <p className="text-emerald-600 font-bold mt-0.5">{p.status}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: APPOINTMENTS */}
      {activeSection === "appointments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Appointments Hub</h3>
              <p className="text-sm text-slate-500 font-medium">Track your schedule, view logs, and update visit status.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                  <th className="px-6 py-4">Appointment ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Reserved Time</th>
                  <th className="px-6 py-4">Department Unit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {docAppointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">{a.id}</td>
                    <td className="px-6 py-4 font-semibold text-sm text-slate-950 dark:text-white">{a.patientName}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{a.appointmentDate}</p>
                      <p className="text-xs text-slate-400 font-semibold">{a.appointmentTime}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">Neurology Center, Wing Level 4</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${
                        a.status === "Approved" ? "bg-blue-100 text-blue-700" :
                        a.status === "Completed" ? "bg-slate-100 text-slate-700" : "bg-red-100 text-red-700"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAppt(a);
                          setShowStatusModal(true);
                        }}
                        className="p-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Update Status
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

      {/* SECTION 4: MEDICAL RECORDS */}
      {activeSection === "records" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Patient History & Registries</h3>
              <p className="text-sm text-slate-500 font-medium font-semibold">Review, add, or download certified clinician summaries.</p>
            </div>
            <button
              onClick={() => setShowAddRecordModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medical Record</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                  <th className="px-6 py-4">Record ID</th>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4">Diagnosis</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {docRecords.map(r => (
                  <tr key={r.id} className="hover:bg-slate-5/50 transition-colors">
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
                        onClick={() => {
                          setSelectedRecord(r);
                          setShowRecordModal(true);
                        }}
                        className="p-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold mr-2"
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

      {/* DETAIL MODAL: PATIENT */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedPatient.fullName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-950 dark:text-white">{selectedPatient.fullName}</h3>
                  <p className="text-xs text-slate-400">ID: {selectedPatient.id} • Registered since {selectedPatient.regDate}</p>
                </div>
              </div>
              <button onClick={() => setShowPatientModal(false)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            
            {/* Bento details columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-150">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Personal Info</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-semibold">Gender</span>
                    <span className="font-semibold">{selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-semibold">Date of birth</span>
                    <span className="font-semibold">{selectedPatient.dob}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-semibold">Blood group</span>
                    <span className="font-bold text-red-600">{selectedPatient.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-semibold">Phone</span>
                    <span className="font-semibold">{selectedPatient.phone}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-semibold">Emergency emergencyContact</span>
                    <span className="font-semibold block">{selectedPatient.emergencyContactName}</span>
                    <span className="text-xs text-slate-400">{selectedPatient.emergencyContactPhone}</span>
                  </div>
                </div>
              </div>

              {/* Patient diagnoses */}
              <div className="md:col-span-8 space-y-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-950 border rounded-xl">
                  <h4 className="font-semibold text-sm mb-3">Diagnoses History</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">Diabetes Type 2</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">Hypertension</span>
                  </div>
                </div>

                <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-extrabold uppercase">Critical alert messages</h5>
                    <p className="text-xs font-semibold mt-1">Known severe allergy response to Penicillin tablets or infusions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: MEDICAL RECORD SUMMARY */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b flex justify-between items-center sm:px-6">
              <span className="font-mono text-xs text-slate-400 font-bold">RECORD {selectedRecord.id}</span>
              <div className="flex gap-2 text-slate-500">
                <button className="p-2 hover:bg-slate-100 rounded-lg"><Printer className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-slate-100 rounded-lg"><Share2 className="w-4 h-4" /></button>
                <button onClick={() => setShowRecordModal(false)} className="text-xl px-2">×</button>
              </div>
            </div>

            {/* Simulated Paper sheet of Clinical record */}
            <div className="p-8 bg-slate-50 dark:bg-slate-950 max-h-[70vh] overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 p-8 border border-slate-150 rounded-xl shadow-sm space-y-6">
                <div className="flex justify-between items-start border-b-2 border-blue-100 pb-4 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">MediCare HMS Systems</p>
                    <h4 className="text-xl font-bold dark:text-white mt-1">Treatment & Clinical Summary</h4>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Case ID: <span className="text-slate-900 font-semibold">{selectedRecord.id}</span></p>
                    <p className="mt-1">Date: {selectedRecord.visitDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                  <div>
                    <span className="text-xs text-slate-400 uppercase block">Patient Name</span>
                    <span className="text-slate-950 dark:text-white font-bold">{selectedRecord.patientName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase block">Diagnosis</span>
                    <span className="text-blue-600 font-bold">{selectedRecord.diagnosis}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-bold mb-1">Presented Symptoms</span>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">{selectedRecord.symptoms}</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-bold mb-1">Treatment & Plan</span>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">{selectedRecord.treatmentPlan}</p>
                  </div>

                  {selectedRecord.internalNotes && (
                    <div className="p-4 bg-slate-50 rounded-xl italic text-xs text-slate-500">
                      <span className="text-xs text-slate-400 block uppercase font-bold not-italic mb-1">Clinical Notes</span>
                      {selectedRecord.internalNotes}
                    </div>
                  )}
                </div>

                {/* E-Signature monogram */}
                <div className="pt-6 border-t flex justify-between items-center text-xs text-slate-400">
                  <div>
                    <p className="italic">Signed digitally by {selectedRecord.signedBy}</p>
                    <p>Senior Clinician Officer</p>
                  </div>
                  <div className="w-16 h-16 opacity-30 select-none pointer-events-none">
                    <FileCheck className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setShowRecordModal(false)}
                className="px-5 py-2 bg-slate-950 text-white text-xs font-semibold rounded-lg"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-950 dark:text-white">Change Appointment Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-450 hover:text-slate-700">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-semibold mb-4">
                Update status for <span className="font-bold text-slate-950">{selectedAppt.patientName}</span>'s session.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAppt.id, "Approved")}
                  className="w-full flex items-center justify-between p-3 border hover:bg-slate-50 rounded-xl transition-all font-semibold text-sm"
                >
                  <span>Approve & Lock Slot</span>
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedAppt.id, "Completed")}
                  className="w-full flex items-center justify-between p-3 border hover:bg-slate-50 rounded-xl transition-all font-semibold text-sm"
                >
                  <span>Mark Visit Finished</span>
                  <Check className="w-5 h-5 text-emerald-600" />
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedAppt.id, "Cancelled")}
                  className="w-full flex items-center justify-between p-3 border hover:bg-slate-55/90 rounded-xl text-red-600 transition-all font-semibold text-sm"
                >
                  <span>Cancel Visitation Request</span>
                  <XCircle className="w-5 h-5 text-red-650" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEDICAL RECORD */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">New Medical Record</h3>
                <p className="text-xs text-slate-500">Certify diagnosis,Symptoms description, and medical therapies prescribed.</p>
              </div>
              <button onClick={() => setShowAddRecordModal(false)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            <form onSubmit={handleAddRecordSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Select Patient *</label>
                  <select
                    required
                    value={newRecord.patientId}
                    onChange={(e) => setNewRecord({ ...newRecord, patientId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Search for Patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Observation Date *</label>
                  <input
                    type="date"
                    required
                    value={newRecord.visitDate}
                    onChange={(e) => setNewRecord({ ...newRecord, visitDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Primary Symptoms Presented *</label>
                <textarea
                  required
                  value={newRecord.symptoms}
                  onChange={(e) => setNewRecord({ ...newRecord, symptoms: e.target.value })}
                  placeholder="Detail cough duration, fever, wheezing indicators..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">ICD-10 Primary Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Bronchitis J20.9"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Treatment Plan / Prescription *</label>
                <textarea
                  required
                  value={newRecord.treatmentPlan}
                  onChange={(e) => setNewRecord({ ...newRecord, treatmentPlan: e.target.value })}
                  placeholder="Medication, dosage interval, hydrology guides..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-24"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Internal Provider notes</label>
                <textarea
                  value={newRecord.internalNotes}
                  onChange={(e) => setNewRecord({ ...newRecord, internalNotes: e.target.value })}
                  placeholder="Confidential notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-16"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700"
                >
                  Finalize Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
