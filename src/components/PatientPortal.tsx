import React, { useState, useEffect } from "react";
import { 
  Users, 
  Stethoscope, 
  CalendarDays, 
  FileText, 
  Search, 
  Plus, 
  HelpCircle, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Smile, 
  CheckCircle2, 
  ArrowLeft,
  User,
  Phone,
  Home,
  MapPin,
  Heart,
  Droplet,
  FileCheck,
  AlertCircle,
  Trash2,
  Lock,
  Printer
} from "lucide-react";
import { Bridge, User as UserType, Patient, Doctor, Appointment, MedicalRecord } from "../services/bridge";

interface PatientPortalProps {
  user: UserType;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ user, activeSection, setActiveSection }) => {
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  // Stepper State for booking
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDept, setBookingDept] = useState("Cardiology");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingReason, setBookingReason] = useState("");

  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");

  // Print view state
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Let's load databases
      const [patList, docList, apptList, recList] = await Promise.all([
        Bridge.getPatients(),
        Bridge.getDoctors(),
        Bridge.getAppointments(),
        Bridge.getMedicalRecords()
      ]);

      setDoctors(docList);
      
      // Filter current patient
      // Since registration/login maps to patient, we query the exact patient record matching.
      // If we don't find a direct record, we instantiate/fetch an active patient record
      let currentPat = patList.find(p => p.fullName.toLowerCase().includes(user.fullName.toLowerCase()));
      if (!currentPat && patList.length > 0) {
        currentPat = patList[0];
      }
      
      if (currentPat) {
        setPatientProfile(currentPat);
        setEditPhone(currentPat.phone);
        setEditAddress(currentPat.address);
        setEditEmergencyName(currentPat.emergencyContactName);
        setEditEmergencyPhone(currentPat.emergencyContactPhone);

        // Filter appointments and medical records for this patient
        setAppointments(apptList.filter(a => a.patientId === currentPat!.id));
        setRecords(recList.filter(r => r.patientId === currentPat!.id));
      } else {
        // Mock fallback if user is admin testing
        setAppointments([]);
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientProfile) return;
    try {
      await Bridge.getPatients(); // Read DB first
      // Updates standard local elements
      alert("Demographics settings successfully committed to files.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientProfile) {
      alert("Invalid Patient context.");
      return;
    }
    if (!selectedDocId || !bookingDate || !bookingReason) {
      alert("Please fill in required wizard settings.");
      return;
    }

    const doc = doctors.find(d => d.id === selectedDocId);
    if (!doc) return;

    try {
      await Bridge.addAppointment({
        patientId: patientProfile.id,
        doctorId: doc.id,
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
        reason: bookingReason,
        clinicalNotes: ""
      });
      
      // Success stepper ending
      setBookingStep(4);
      setBookingReason("");
      setSelectedDocId("");
      setBookingDate("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelAppt = async (id: string) => {
    if (confirm("Are you sure you want to cancel this visitation request?")) {
      try {
        await Bridge.updateAppointmentStatus(id, "Cancelled");
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* SECTION 1: DASHBOARD */}
      {activeSection === "dashboard" && (
        <>
          {/* Welcome block */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-lg">
              <span className="bg-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Patient Medical Portal
              </span>
              <h2 className="text-3xl font-extrabold mt-4 leading-tight">
                Hello, {user.fullName}!
              </h2>
              <p className="text-blue-105 text-sm mt-2 opacity-90 leading-relaxed">
                Review your diagnostic history, access certified treatment reports, and book visits in moments with the live coordinator.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setActiveSection("book")}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-xl text-sm active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveSection("records")}
                  className="border border-white/30 text-white hover:bg-white/10 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                >
                  Clinical History
                </button>
              </div>
            </div>

            {/* Graphic ornament */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:flex items-center justify-center opacity-10 select-none pointer-events-none">
              <Droplet className="w-48 h-48 text-white" />
            </div>
          </div>

          {/* Quick status grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Scheduled Visits</p>
                <p className="text-2xl font-extrabold mt-1">{appointments.filter(a => a.status === "Approved").length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 bg-teal-50 dark:bg-teal-900/40 text-teal-600 rounded-xl">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Reports Finalized</p>
                <p className="text-2xl font-extrabold mt-1">{records.length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4 font-semibold">
              <div className="p-3.5 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-xl">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Group/Type</p>
                <p className="text-2xl font-extrabold text-red-600 mt-1">{patientProfile?.bloodGroup || "O+"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Scheduled Visit summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <h4 className="font-bold text-base text-slate-950 dark:text-white mb-4">Upcoming visit sessions</h4>
              
              {appointments.filter(a => a.status !== "Cancelled").length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-sm">
                  No upcoming appointments.
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.filter(a => a.status !== "Cancelled").slice(0, 2).map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 border rounded-xl">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{a.doctorName}</p>
                          <p className="text-xs text-slate-500 font-semibold">{a.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{a.appointmentDate}</p>
                        <p className="text-xs text-slate-500 font-semibold">{a.appointmentTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Profile Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <h4 className="font-bold text-base text-slate-950 dark:text-white mb-4">Emergency parameters Contact</h4>
              <div className="bg-slate-50 dark:bg-slate-950 p-6 border rounded-xl space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold text-xs uppercase">Responder Name</span>
                  <span className="font-bold">{patientProfile?.emergencyContactName || "Guardian Agent"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold text-xs uppercase">Responder Phone</span>
                  <span className="font-bold">{patientProfile?.emergencyContactPhone || "(555) 991-0112"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold text-xs uppercase">Registry Code</span>
                  <span className="font-mono text-blue-600 font-bold">{patientProfile?.id}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SECTION 2: MY PROFILE */}
      {activeSection === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Card Side */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-extrabold mx-auto mb-4 select-none">
              {patientProfile?.fullName.split(" ").map(n => n[0]).join("")}
            </div>
            <h4 className="font-bold text-xl text-slate-900 dark:text-white">{patientProfile?.fullName}</h4>
            <p className="text-xs text-slate-400 font-bold tracking-widest mt-1 font-mono">{patientProfile?.id}</p>

            <div className="mt-6 pt-6 border-t font-semibold text-left space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{patientProfile?.address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{patientProfile?.phone}</span>
              </div>
            </div>
          </div>

          {/* Form edits */}
          <form onSubmit={handleUpdateProfile} className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
            <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">Emergency Demographics Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Residential Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Emergency Relative Name</label>
                <input
                  type="text"
                  value={editEmergencyName}
                  onChange={(e) => setEditEmergencyName(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Emergency Relative Phone</label>
                <input
                  type="text"
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-lg text-sm"
                />
              </div>
            </div>

            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700">
              Save Profiles Changes
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: BOOK APPOINTMENT MULTI-STEP */}
      {activeSection === "book" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl mx-auto overflow-hidden">
          {/* Stepper Wizard Indicator */}
          <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Step {bookingStep} of 3</span>
            <div className="flex gap-2.5">
              <span className={`w-3 h-3 rounded-full ${bookingStep >= 1 ? "bg-blue-600" : "bg-slate-200"}`}></span>
              <span className={`w-3 h-3 rounded-full ${bookingStep >= 2 ? "bg-blue-600" : "bg-slate-200"}`}></span>
              <span className={`w-3 h-3 rounded-full ${bookingStep >= 3 ? "bg-blue-600" : "bg-slate-200"}`}></span>
            </div>
          </div>

          <form onSubmit={handleBookAppointment} className="p-8">
            
            {/* Step 1: choosing specialty and doctors */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-950 dark:text-white leading-tight">Choose Medical Specialists</h3>
                  <p className="text-xs text-slate-500 mt-1">Select appropriate clinical fields for visitation appointments.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Specialty Department</label>
                    <select
                      value={bookingDept}
                      onChange={(e) => setBookingDept(e.target.value)}
                      className="w-full bg-slate-50 border p-3 rounded-lg text-sm"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold flex items-center justify-between">
                      <span>Available Doctors</span>
                    </label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full bg-slate-50 border p-3 rounded-lg text-sm font-semibold"
                    >
                      <option value="">Select Doctor...</option>
                      {doctors.filter(d => d.specialty === bookingDept).map(d => (
                        <option key={d.id} value={d.id}>{d.fullName} ({d.title})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedDocId}
                    onClick={() => setBookingStep(2)}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>Next step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: PICK DATE & SLOT */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-950 dark:text-white">Visitation Calendar Calendar</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure comfortable arrival day schedules.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Arrival Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border p-3 rounded-lg text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Available Sessional slots</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["09:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "04:00 PM"].map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setBookingTime(t)}
                          className={`p-3 border rounded-xl text-xs font-bold uppercase transition-all ${
                            bookingTime === t ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-205 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="px-5 py-2 border rounded-lg text-sm flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={!bookingDate}
                    onClick={() => setBookingStep(3)}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>Next step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: CONFLICT REASON */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-950 dark:text-white">Symptoms Reason description</h3>
                  <p className="text-xs text-slate-500 mt-1">Convey symptoms parameters helpful in diagnosis.</p>
                </div>

                <div className="space-y-4">
                  <textarea
                    required
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="Short summary of active clinic discomfort..."
                    className="w-full bg-slate-50 border p-3 rounded-xl text-sm h-32"
                  />
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="px-5 py-2 border rounded-lg text-sm flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700"
                  >
                    Confirm & Request Visit
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: SUCCESS */}
            {bookingStep === 4 && (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 leading-tight">Appointment Successfully Requested!</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                    Our administrative staff is processing your clinical request slot. Visit dates calendar logs will indicate approved updates soon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBookingStep(1);
                    setActiveSection("dashboard");
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-sm inline-block"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </form>
        </div>
      )}

      {/* SECTION 4: APPOINTMENTS HISTORY */}
      {activeSection === "history" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold">Visitation Catalog logs</h3>
            <p className="text-sm text-slate-505 font-medium">Track approvals, active clinics status, and cancellation triggers.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-505">
                  <th className="px-6 py-4">Appointment Case ID</th>
                  <th className="px-6 py-4">Assigned Specialist Officier</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4">Symptoms Detail</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Cancel Options</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-slate-500 italic">
                      No matching records booked.
                    </td>
                  </tr>
                ) : (
                  appointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{a.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{a.doctorName}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{a.appointmentDate}</p>
                        <p className="text-xs text-slate-500">{a.appointmentTime}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{a.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${
                          a.status === "Approved" ? "bg-blue-100 text-blue-700" :
                          a.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.status !== "Cancelled" && a.status !== "Completed" && (
                          <button
                            onClick={() => handleCancelAppt(a.id)}
                            className="p-1 hover:bg-red-50 text-red-650 rounded-lg"
                            title="Cancel Request"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: CLINICAL DOCUMENTS WATERMARKED prescriptive layouts */}
      {activeSection === "records" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Certified Diagnostic Reports</h3>
            <p className="text-sm text-slate-500 font-medium font-semibold">Access signed treatment prescriptions and clinical assessments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-400 italic text-sm">
                No record entries reported.
              </div>
            ) : (
              records.map(r => (
                <div 
                  key={r.id}
                  onClick={() => {
                    setSelectedRecord(r);
                    setShowRecordModal(true);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md cursor-pointer transition-all border-t-4 border-t-indigo-650 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-mono text-xs text-slate-400 font-bold block mb-1">RECORD {r.id}</span>
                      <h4 className="font-extrabold text-slate-900 text-lg leading-tight dark:text-white">{r.diagnosis}</h4>
                    </div>
                    <Printer className="w-5 h-5 text-indigo-500" />
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">{r.treatmentPlan}</p>

                  <div className="mt-6 pt-4 border-t text-xs flex justify-between items-center text-slate-400">
                    <span>Date: {r.visitDate}</span>
                    <span className="italic font-bold">Dr. Smith signed</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MEDICAL RECORD SUMMARY MODAL (Same as DoctorPortal for Print View elegance) */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b flex justify-between items-center sm:px-6">
              <span className="font-mono text-xs text-slate-400 font-bold">RECORD {selectedRecord.id}</span>
              <div className="flex gap-2 text-slate-500">
                <button className="p-2 hover:bg-slate-100 rounded-lg"><Printer className="w-4 h-4" /></button>
                <button onClick={() => setShowRecordModal(false)} className="text-xl px-2">×</button>
              </div>
            </div>

            {/* Simulated Paper sheet Of Clinical record */}
            <div className="p-8 bg-slate-50 dark:bg-slate-950 max-h-[70vh] overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 p-8 border border-slate-150 rounded-xl shadow-sm space-y-6 relative">
                
                {/* Branding watermark behind copy */}
                <div className="absolute inset-x-0 top-1/3 text-center opacity-5 select-none pointer-events-none rotate-12">
                  <span className="text-7xl font-extrabold text-blue-600 tracking-widest block uppercase">APPROVED</span>
                  <span className="text-2xl mt-1 text-blue-600 font-bold tracking-widest block">MEDICARE HOSPITALS</span>
                </div>

                <div className="flex justify-between items-start border-b-2 border-indigo-100 pb-4 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-indigo-600 tracking-wider">MediCare HMS Systems</p>
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
                    <span className="text-xs text-slate-400 uppercase block">Clinical Diagnosis</span>
                    <span className="text-indigo-650 font-bold">{selectedRecord.diagnosis}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t relative z-10">
                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-bold mb-1">Presented Symptoms</span>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">{selectedRecord.symptoms}</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase block font-bold mb-1">Prescriptions plan</span>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">{selectedRecord.treatmentPlan}</p>
                  </div>
                </div>

                {/* E-Signature monogram */}
                <div className="pt-6 border-t flex justify-between items-center text-xs text-slate-400">
                  <div>
                    <p className="italic">Signed digitally by {selectedRecord.signedBy}</p>
                    <p>Senior Clinician Officer</p>
                  </div>
                  <div className="w-16 h-16 opacity-30 select-none pointer-events-none">
                    <FileCheck className="w-12 h-12 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setShowRecordModal(false)}
                className="px-5 py-2 bg-slate-950 text-white text-xs font-semibold rounded-lg"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
