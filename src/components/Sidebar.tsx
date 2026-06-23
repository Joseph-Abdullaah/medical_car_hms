import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  CalendarDays, 
  FileText, 
  HelpCircle, 
  LogOut, 
  CheckSquare, 
  UserSquare, 
  CalendarPlus, 
  History
} from "lucide-react";
import { User } from "../services/bridge";

interface SidebarProps {
  user: User;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  activeSection, 
  setActiveSection, 
  onLogout,
  isOpen = false,
  onClose
}) => {
  const role = user.role;

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transitioning-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 gap-2 h-screen fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Branding & Close trigger */}
        <div className="flex items-center justify-between mb-8 px-2 py-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-950 dark:text-white leading-tight">
                MediCare HMS
              </h1>
              <p className="text-xs text-slate-500 font-medium capitalize">
                {role === "admin" ? "Administrative Portal" : role === "doctor" ? "Doctor Portal" : "Patient Portal"}
              </p>
            </div>
          </div>
          {onClose && (
            <button 
              id="close-sidebar-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 lg:hidden focus:outline-none"
              aria-label="Close Sidebar Menu"
            >
              <span className="text-xl font-bold">×</span>
            </button>
          )}
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 flex flex-col gap-1">
          {/* Admin Navigation Options */}
          {role === "admin" && (
            <>
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "dashboard"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick("patients")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "patients"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Patients</span>
              </button>
              <button
                onClick={() => handleNavClick("doctors")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "doctors"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <Stethoscope className="w-5 h-5" />
                <span>Doctors</span>
              </button>
              <button
                onClick={() => handleNavClick("appointments")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "appointments"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span>Appointments</span>
              </button>
            </>
          )}

          {/* Doctor Navigation Options */}
          {role === "doctor" && (
            <>
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "dashboard"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick("patients")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "patients"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>My Patients</span>
              </button>
              <button
                onClick={() => handleNavClick("appointments")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "appointments"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span>Appointments</span>
              </button>
              <button
                onClick={() => handleNavClick("records")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "records"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Medical Records</span>
              </button>
            </>
          )}

          {/* Patient Navigation Options */}
          {role === "patient" && (
            <>
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "dashboard"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "profile"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <UserSquare className="w-5 h-5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => handleNavClick("book")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "book"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <CalendarPlus className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>
              <button
                onClick={() => handleNavClick("history")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "history"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <History className="w-5 h-5" />
                <span>Appointment History</span>
              </button>
              <button
                onClick={() => handleNavClick("records")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "records"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Medical Records</span>
              </button>
            </>
          )}
        </nav>

        {/* Footer Options */}
        <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
