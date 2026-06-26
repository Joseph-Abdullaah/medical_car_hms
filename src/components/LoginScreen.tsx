import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Stethoscope, UserCheck } from "lucide-react";
import { Bridge, User } from "../services/bridge";

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [role, setRole] = useState<"admin" | "doctor" | "patient">("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!trimmedUsername || !trimmedPassword) {
      setError("Please fill in all requested fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const user = await Bridge.login(trimmedUsername, trimmedPassword, role);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Invalid authentication credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 px-6">
      <div className="w-full max-w-[480px]">
        {/* Header branding */}
        <header className="flex flex-col items-center mb-8 text-center">
          <img
            alt="MediCare HMS Logo"
            className="w-16 h-16 mb-4 rounded-2xl object-cover shadow-sm bg-white"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUoYlB_OP0QfWYmXMLqqhQcY9Ju59ZS2wc46y8X7CcB3tfl7mV3Cr1T77uC66ho0CNBio42pcOGnniCeNabihxCijnzwePOqvAlwhXcZIJwnyTJB3Ubj8HSBvcCKFRBlZQmgqKVHgMvgPdmxQ58LT9WSP1-tWMP7FEoSYtIN794lk-eybBnI_F7QvlfYbcSaBn7orOwgPmkzR4F8uLdSMb0lCIVm4prjWaP1A3P8ZuToQYuYlXp3DSoL-XG5YqCq3oeOGGlgeNxksI"
          />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Hospital Management System Portal
          </p>
        </header>

        {/* Card Component */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-md">
          
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Select Your Role
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Admin Selector */}
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all group ${
                  role === "admin"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 font-semibold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <ShieldCheck className={`w-6 h-6 mb-2 ${role === "admin" ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
                <span className="text-[11px] uppercase tracking-wider font-semibold">Admin</span>
              </button>

              {/* Doctor Selector */}
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all group ${
                  role === "doctor"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 font-semibold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <Stethoscope className={`w-6 h-6 mb-2 ${role === "doctor" ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
                <span className="text-[11px] uppercase tracking-wider font-semibold">Doctor</span>
              </button>

              {/* Patient Selector */}
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all group ${
                  role === "patient"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 font-semibold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <UserCheck className={`w-6 h-6 mb-2 ${role === "patient" ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
                <span className="text-[11px] uppercase tracking-wider font-semibold">Patient</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Username/Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="username">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your registered account"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-11 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700">
                  Remember Me
                </span>
              </label>
              <a href="#" className="text-xs text-blue-600 hover:underline font-semibold">
                Forgot Password?
              </a>
            </div>

            {/* Sign in Trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Navigation bottom */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <button
              onClick={onNavigateToRegister}
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};
