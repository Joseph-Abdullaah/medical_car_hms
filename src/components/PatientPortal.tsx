import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Stethoscope,
  FileCheck,
  Trash2,
  Droplet,
  Printer,
  AlertTriangle,
} from "lucide-react";
import { Bridge, User as UserType, Patient, Doctor, Appointment, MedicalRecord, Department } from "../services/bridge";

interface PatientPortalProps {
  user: UserType;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30",
];

export const PatientPortal: React.FC<PatientPortalProps> = ({ user, activeSection, setActiveSection }) => {
  // ── Data ─────────────────────────────────────────────────────────────────────
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [doctors,        setDoctors]        = useState<Doctor[]>([]);
  const [departments,    setDepartments]    = useState<Department[]>([]);
  const [appointments,   setAppointments]   = useState<Appointment[]>([]);
  const [records,        setRecords]        = useState<MedicalRecord[]>([]);
  const [loading,        setLoading]        = useState(false);

  // ── Profile edit state ────────────────────────────────────────────────────────
  const [editFullName,  setEditFullName]  = useState("");
  const [editBloodType, setEditBloodType] = useState("");
  const [editGender,    setEditGender]    = useState("");
  const [editPhone,     setEditPhone]     = useState("");
  const [editAddress,   setEditAddress]   = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState("");

  // ── Booking state ─────────────────────────────────────────────────────────────
  const [bookingStep,   setBookingStep]   = useState(1);
  const [bookingDept,   setBookingDept]   = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [bookingDate,   setBookingDate]   = useState("");
  const [bookingTime,   setBookingTime]   = useState("09:00");

  // ── Custom confirm dialog ─────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showConfirm = (message: string, onConfirm: () => void) =>
    setConfirmDialog({ message, onConfirm });

  // ── Record view modal ─────────────────────────────────────────────────────────
  const [selectedRecord,  setSelectedRecord]  = useState<MedicalRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patList, docList, deptList, apptList, recList] = await Promise.all([
        Bridge.getPatients(),
        Bridge.getDoctors(),
        Bridge.getDepartments(),
        Bridge.getAppointments(),
        Bridge.getMedicalRecords(),
      ]);

      setDoctors(docList);
      setDepartments(deptList);

      const me = patList.find(p => String(p.id) === String(user.id)) ?? null;
      setPatientProfile(me);

      if (me) {
        setEditFullName(me.fullName);
        setEditBloodType(me.bloodType);
        setEditGender(me.gender);
        setEditPhone(me.phone);
        setEditAddress(me.address);
      }

      setAppointments(apptList.filter(a => String(a.patientId) === String(user.id)));
      setRecords(recList.filter(r => String(r.patientId) === String(user.id)));

      if (deptList.length > 0 && !bookingDept) setBookingDept(String(deptList[0].id));
    } catch (err) {
      console.error("PatientPortal fetchData failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":  return "bg-blue-100 text-blue-700";
      case "COMPLETED":  return "bg-emerald-100 text-emerald-700";
      case "CANCELLED":  return "bg-red-100 text-red-700";
      default:           return "bg-amber-100 text-amber-700";
    }
  };

  const doctorsInDept = doctors.filter(d => String(d.deptId) === bookingDept);
  const selectedDoc   = doctors.find(d => String(d.id) === selectedDocId) ?? null;
  const selectedDept  = departments.find(d => String(d.id) === bookingDept) ?? null;

  // ── Profile update ────────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMsg("");
      const ok = await Bridge.updatePatientProfile(
        user.id, editFullName, editBloodType, editGender, editPhone, editAddress,
      );
      setProfileMsg(ok ? "Profile updated successfully." : "Update failed. Please try again.");
      if (ok) fetchData();
    } catch { setProfileMsg("Error saving profile."); }
    finally { setProfileSaving(false); }
  };

  // ── Book appointment ──────────────────────────────────────────────────────────
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !bookingDate) { alert("Please select a doctor and a date."); return; }
    try {
      await Bridge.addAppointment({
        patientId:       String(user.id),
        doctorId:        selectedDocId,
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
      });
      setBookingStep(4);
      setSelectedDocId("");
      setBookingDate("");
      setBookingTime("09:00");
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment. Please try again.");
    }
  };

  // ── Cancel appointment ────────────────────────────────────────────────────────
  const handleCancelAppt = (id: string, doctorName: string, date: string) =>
    showConfirm(`Cancel your appointment with ${doctorName} on ${date}?`, async () => {
      try { await Bridge.updateAppointmentStatus(id, "CANCELLED"); fetchData(); }
      catch (err) { console.error(err); }
      finally { setConfirmDialog(null); }
    });

  const inputCls = "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-1 focus:ring-blue-600";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">

      {/* CUSTOM CONFIRM DIALOG */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Confirm Cancellation</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
                Keep Appointment
              </button>
              <button onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {activeSection === "dashboard" && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-lg">
              <span className="bg-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Patient Portal</span>
              <h2 className="text-3xl font-extrabold mt-4 leading-tight">Hello, {user.fullName}!</h2>
              <p className="text-sm mt-2 opacity-90 leading-relaxed">View your appointments, medical records, and manage your profile.</p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <button onClick={() => setActiveSection("book")}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-1.5">
                  <span>Book Appointment</span><ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveSection("records")}
                  className="border border-white/30 text-white hover:bg-white/10 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
                  My Records
                </button>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:flex items-center justify-center opacity-10 select-none pointer-events-none">
              <Droplet className="w-48 h-48 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl"><Calendar className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Confirmed Visits</p>
                <p className="text-2xl font-extrabold mt-1">{appointments.filter(a => a.status === "CONFIRMED").length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-teal-50 dark:bg-teal-900/40 text-teal-600 rounded-xl"><FileCheck className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Medical Records</p>
                <p className="text-2xl font-extrabold mt-1">{records.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-xl"><Droplet className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Blood Type</p>
                <p className="text-2xl font-extrabold text-red-600 mt-1">{patientProfile?.bloodType || "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-base text-slate-950 dark:text-white">Upcoming Visits</h4>
            </div>
            {appointments.filter(a => a.status !== "CANCELLED" && a.status !== "COMPLETED").length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic text-sm">
                No upcoming appointments.{" "}
                <button onClick={() => setActiveSection("book")} className="text-blue-600 hover:underline font-medium not-italic">Book one now</button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.filter(a => a.status !== "CANCELLED" && a.status !== "COMPLETED").slice(0, 3).map(a => (
                  <div key={a.id} className="flex justify-between items-center px-6 py-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{a.doctorName}</p>
                        <p className="text-xs text-slate-500 font-semibold">{a.appointmentDate} at {a.appointmentTime}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${statusBadge(a.status)}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PROFILE ── */}
      {activeSection === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-extrabold mx-auto mb-4 select-none">
              {(patientProfile?.fullName || user.fullName).split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
            </div>
            <h4 className="font-bold text-xl text-slate-900 dark:text-white">{patientProfile?.fullName || user.fullName}</h4>
            <p className="text-xs text-slate-400 font-bold tracking-widest mt-1 font-mono">ID: {user.id}</p>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-3 text-xs font-semibold">
              {[
                { label: "Blood Type", value: patientProfile?.bloodType || "—", cls: "text-red-600 font-bold" },
                { label: "Gender",     value: patientProfile?.gender    || "—", cls: "text-slate-700 dark:text-slate-300" },
                { label: "Phone",      value: patientProfile?.phone     || "—", cls: "text-slate-700 dark:text-slate-300" },
                { label: "Address",    value: patientProfile?.address   || "—", cls: "text-slate-700 dark:text-slate-300 text-right" },
              ].map(f => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-slate-400 uppercase">{f.label}</span>
                  <span className={f.cls}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">Edit Profile</h3>
              <p className="text-xs text-slate-500 mt-1">Update your personal details stored in the system.</p>
            </div>
            {profileMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium ${profileMsg.includes("success") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                {profileMsg}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="Your full name" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Blood Type</label>
                <select value={editBloodType} onChange={e => setEditBloodType(e.target.value)} className={inputCls}>
                  <option value="">Select...</option>
                  {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
                <select value={editGender} onChange={e => setEditGender(e.target.value)} className={inputCls}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="(555) 012-3456" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="123 Main Street" className={inputCls} />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="submit" disabled={profileSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60">
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── BOOK APPOINTMENT ── */}
      {activeSection === "book" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl mx-auto overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {bookingStep < 4 ? `Step ${bookingStep} of 3` : "Complete"}
            </span>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <span key={s} className={`w-3 h-3 rounded-full transition-colors ${bookingStep >= s ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />
              ))}
            </div>
          </div>

          <form onSubmit={handleBookAppointment} className="p-8">

            {/* Step 1 — Doctor selection */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-950 dark:text-white">Choose a Doctor</h3>
                  <p className="text-xs text-slate-500 mt-1">Select a department then pick an available specialist.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase">Department</label>
                    <select value={bookingDept} onChange={e => { setBookingDept(e.target.value); setSelectedDocId(""); }} className={inputCls}>
                      <option value="">Select department...</option>
                      {departments.map(d => <option key={d.id} value={String(d.id)}>{d.deptName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase">Doctor</label>
                    <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)} className={inputCls} disabled={!bookingDept}>
                      <option value="">{!bookingDept ? "Select a department first..." : doctorsInDept.length === 0 ? "No doctors in this department" : "Select doctor..."}</option>
                      {doctorsInDept.map(d => <option key={d.id} value={String(d.id)}>{d.fullName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button type="button" disabled={!selectedDocId} onClick={() => setBookingStep(2)}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5 transition-all">
                    <span>Next</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Date + time */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-950 dark:text-white">Choose Date &amp; Time</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Booking with <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedDoc?.fullName}</span>
                    {selectedDept && <span> — {selectedDept.deptName}</span>}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase">Appointment Date</label>
                    <input type="date" value={bookingDate} min={new Date().toISOString().split("T")[0]}
                      onChange={e => setBookingDate(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase">Appointment Time</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(t => (
                        <button key={t} type="button" onClick={() => setBookingTime(t)}
                          className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                            bookingTime === t
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button type="button" onClick={() => setBookingStep(1)}
                    className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <button type="button" disabled={!bookingDate} onClick={() => setBookingStep(3)}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5 transition-all">
                    <span>Next</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-950 dark:text-white">Confirm Appointment</h3>
                  <p className="text-xs text-slate-500 mt-1">Review your booking before submitting.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-sm">
                  {[
                    { label: "Doctor",     value: selectedDoc?.fullName ?? "—" },
                    { label: "Department", value: selectedDept?.deptName  ?? "—" },
                    { label: "Date",       value: bookingDate },
                    { label: "Time",       value: bookingTime },
                    { label: "Patient",    value: user.fullName },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-slate-400 font-semibold text-xs uppercase">{r.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{r.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-semibold text-xs uppercase">Status</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">PENDING</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button type="button" onClick={() => setBookingStep(2)}
                    className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <button type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all">
                    Confirm &amp; Book
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Success */}
            {bookingStep === 4 && (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Appointment Booked!</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    Your request has been submitted. It will be confirmed by the doctor or admin.
                  </p>
                </div>
                <button type="button"
                  onClick={() => { setBookingStep(1); setActiveSection("history"); fetchData(); }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all">
                  View My Appointments
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── APPOINTMENT HISTORY ── */}
      {activeSection === "history" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Appointment History</h3>
            <p className="text-sm text-slate-500 font-medium">All your appointments and their current status.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-sm text-slate-400 italic">
                        No appointments yet.{" "}
                        <button onClick={() => setActiveSection("book")} className="text-blue-600 hover:underline font-medium not-italic">Book one now</button>
                      </td>
                    </tr>
                  ) : appointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{a.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{a.doctorName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{a.appointmentDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">{a.appointmentTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${statusBadge(a.status)}`}>{a.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                          <button onClick={() => handleCancelAppt(a.id, a.doctorName, a.appointmentDate)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-lg transition-colors" title="Cancel">
                            <Trash2 className="w-4 h-4" />
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
          <div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">My Medical Records</h3>
            <p className="text-sm text-slate-500 font-medium">Clinical records issued by your doctors.</p>
          </div>
          {records.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic text-sm">No medical records on file yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records.map(r => (
                <div key={r.id} onClick={() => { setSelectedRecord(r); setShowRecordModal(true); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md cursor-pointer transition-all border-t-4 border-t-blue-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-mono text-xs text-slate-400 font-bold block mb-1">RECORD #{r.id}</span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{r.diagnosis}</h4>
                    </div>
                    <Printer className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{r.prescription}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center text-slate-400 font-semibold">
                    <span>Visit: {r.visitDate}</span>
                    <span>Dr. {r.doctorName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RECORD VIEW MODAL ── */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="font-mono text-xs text-slate-400 font-bold">RECORD #{selectedRecord.id}</span>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Printer className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={() => setShowRecordModal(false)} className="text-xl px-2 text-slate-400 hover:text-slate-700 leading-none">×</button>
              </div>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-slate-950 max-h-[65vh] overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm space-y-6 relative">
                <div className="absolute inset-x-0 top-1/3 text-center opacity-[0.04] select-none pointer-events-none rotate-12">
                  <span className="text-6xl font-extrabold text-blue-600 tracking-widest block uppercase">APPROVED</span>
                  <span className="text-xl mt-1 text-blue-600 font-bold tracking-widest block">MEDICARE HMS</span>
                </div>
                <div className="flex justify-between items-start border-b-2 border-blue-100 dark:border-slate-700 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">MediCare HMS</p>
                    <h4 className="text-xl font-bold dark:text-white mt-1">Clinical Record</h4>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Record ID: <span className="text-slate-900 dark:text-white font-semibold">{selectedRecord.id}</span></p>
                    <p className="mt-1">Visit: <span className="text-slate-900 dark:text-white font-semibold">{selectedRecord.visitDate}</span></p>
                  </div>
                </div>
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
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <div>
                    <p className="font-semibold">Dr. {selectedRecord.doctorName}</p>
                    <p>MediCare Hospital Management System</p>
                  </div>
                  <div className="opacity-30 select-none"><FileCheck className="w-10 h-10 text-blue-600" /></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setShowRecordModal(false)}
                className="px-5 py-2 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
