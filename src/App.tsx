import { useState, useEffect } from "react";
import { User, Bridge } from "./services/bridge";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AdminPortal } from "./components/AdminPortal";
import { DoctorPortal } from "./components/DoctorPortal";
import { PatientPortal } from "./components/PatientPortal";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"login" | "register" | "portal">("login");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if session exists in storage
    const storedUser = localStorage.getItem("hms_session");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setView("portal");
        // Set standard start section
        setActiveSection("dashboard");
      } catch (err) {
        localStorage.removeItem("hms_session");
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem("hms_session", JSON.stringify(authenticatedUser));
    setView("portal");
    setActiveSection("dashboard");
  };

  const handleRegisterSuccess = (registeredUser: User) => {
    setUser(registeredUser);
    localStorage.setItem("hms_session", JSON.stringify(registeredUser));
    setView("portal");
    setActiveSection("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hms_session");
    setView("login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 mt-4">Loading healthcare session...</p>
      </div>
    );
  }

  // Render Authentication flows
  if (view === "login") {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setView("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterScreen
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={() => setView("login")}
      />
    );
  }

  // Main App portal layout
  if (view === "portal" && user) {
    return (
      <div className="min-h-screen bg-slate-5 w-full bg-slate-50 dark:bg-slate-950">
        {/* Render Sidebar on the left column */}
        <Sidebar 
          user={user} 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content pane containing header and active section */}
        <div className="lg:pl-64 flex flex-col min-h-screen w-full">
          <Header 
            user={user} 
            title={activeSection} 
            onMenuClick={() => setSidebarOpen(true)} 
          />

          <main className="flex-1 w-full max-w-7xl mx-auto pb-12 px-4 sm:px-6">
            {user.role === "admin" && (
              <AdminPortal 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
              />
            )}

            {user.role === "doctor" && (
              <DoctorPortal 
                user={user}
                activeSection={activeSection}
              />
            )}

            {user.role === "patient" && (
              <PatientPortal 
                user={user}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  return null;
}
