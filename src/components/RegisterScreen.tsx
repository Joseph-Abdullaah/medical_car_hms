import React, { useState } from "react";
import {
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
} from "lucide-react";
import { Bridge, User as UserType } from "../services/bridge";

interface RegisterScreenProps {
  onRegisterSuccess: (user: UserType) => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  // schema: Patient_Profiles does NOT include emergency contact; handled via phone only
  // emergencyContact removed per schema.

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm  = confirmPassword.trim();
    const trimmedPhone    = phone.trim();
    const trimmedAddress  = address.trim();

    if (!trimmedFullName || !trimmedUsername || !trimmedPassword || !trimmedConfirm) {
      setError("Please fill in all requested fields.");
      return;
    }

    if (!bloodType || !gender || !trimmedPhone || !trimmedAddress) {
      setError("Please fill in all required patient profile fields.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!terms) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const user = await Bridge.register(
        trimmedFullName,
        trimmedUsername,
        trimmedPassword,
        bloodType,
        gender,
        trimmedPhone,
        trimmedAddress,
      );

      onRegisterSuccess(user);
    } catch (err: any) {
      setError(
        err.message ||
          "Registration failed. Try checking username/email availability.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 px-6">
      <div className="w-full max-w-[540px]">
        {/* Header branding */}
        <header className="flex flex-col items-center mb-8 text-center pt-[50px]">
          <div className="inline-flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Join the medicare healthcare management system
          </p>
        </header>

        {/* Card Component */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-md">
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Display Full Name */}
            <div className="space-y-1">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe88"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              />
            </div>

            {/* Blood Type (dropdown) + Gender (male/female) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="bloodType"
                >
                  Blood Type
                </label>
                <select
                  id="bloodType"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white"
                >
                  <option value="">Select blood type...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="space-y-1">
                <label
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="gender"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "Male" | "Female")
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="phone"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="address"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="password"
              >
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
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="confirm_password"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              />
              <label
                className="text-xs text-slate-500 dark:text-slate-400 leading-snug cursor-pointer"
                htmlFor="terms"
              >
                By creating an account, I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Create trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Registering..." : "Create Account"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Bottom footer linking back to login */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <button
              onClick={onNavigateToLogin}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};
