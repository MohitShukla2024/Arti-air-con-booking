"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Snowflake, User, Lock, ArrowRight, Loader2, CheckCircle2, Shield, KeyRound, Mail, UserPlus, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/use-auth-store";
import { BRAND_INFO } from "@/lib/constants";

type AdminAuthMode = "login" | "create" | "success";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isHydrated, loginAdmin } = useAuthStore();
  const canCreateAdmin = isHydrated && user?.role === "ADMIN";

  const [mode, setMode] = useState<AdminAuthMode>("login");

  // Login Form Fields
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Create Admin Form Fields
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already logged in as ADMIN
  useEffect(() => {
    if (isHydrated && user?.role === "ADMIN") {
      window.location.href = "/admin/dashboard";
    }
  }, [isHydrated, user]);

  // Handle Admin Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      toast.error("Please enter your Admin ID or Email");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Please enter a valid password (at least 6 characters)");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password, remember }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.admin) {
        throw new Error(data?.message || "Unable to authenticate admin.");
      }

      loginAdmin(data.admin);
      setMode("success");
      toast.success("Admin authenticated! Opening Admin Hub...");

      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to authenticate admin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Create Admin Account Submit
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateAdmin) {
      toast.error("Admin account creation is only available to logged-in admins.");
      return;
    }
    if (!fullName || fullName.length < 2) {
      toast.error("Please enter full name for admin profile");
      return;
    }
    if (!mobileNumber || mobileNumber.length < 8) {
      toast.error("Please enter a valid mobile number for admin account");
      return;
    }
    if (!adminEmail) {
      toast.error("Please enter admin email or admin ID");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          mobileNumber,
          adminEmail,
          password: newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.admin) {
        throw new Error(data?.message || "Unable to create admin account.");
      }

      loginAdmin(data.admin);
      setMode("success");
      toast.success("Admin account created successfully! Access granted.");

      setTimeout(() => {
        router.replace("/admin/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create admin account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      {/* Mode Navigation Tabs */}
      <div className="flex bg-[#f2f4f6] p-1.5 rounded-2xl mb-6 border border-[#c2c6d8]/30">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === "login"
              ? "bg-[#0066ff] text-white shadow-md"
              : "text-[#424656] hover:text-[#191c1e]"
          }`}
        >
          Admin Sign In
        </button>
        <button
          onClick={() => setMode("create")}
          disabled={!canCreateAdmin}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            !canCreateAdmin
              ? "cursor-not-allowed bg-white text-[#9aa3b2] opacity-60"
              : mode === "create"
              ? "bg-[#0066ff] text-white shadow-md"
              : "text-[#0050cb] font-extrabold hover:text-[#0066ff]"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Create Admin Account
        </button>
      </div>

      {/* 1. ADMIN SIGN IN CARD */}
      {mode === "login" && (
        <div className="glass-panel rounded-[2rem] shadow-[0px_4px_20px_rgba(0,102,255,0.05)] p-8 md:p-12 border border-white/40">
          {/* Brand & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0066ff] rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto text-white">
              <Snowflake className="w-10 h-10" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#191c1e] mb-1">
              Admin Portal Gateway
            </h1>
            <p className="text-xs text-[#0050cb] font-semibold flex items-center justify-center gap-1 mt-1">
              <Shield className="w-4 h-4" /> Service Management & Operations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {/* Admin ID / Email */}
            <div>
              <label
                htmlFor="admin_id"
                className="block text-xs font-semibold text-[#555f6c] uppercase tracking-wider mb-2"
              >
                Admin ID or Email
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  id="admin_id"
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter admin ID or email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#c2c6d8] rounded-xl text-sm text-[#191c1e] placeholder:text-[#c2c6d8] focus:outline-none focus:border-[#0050cb] focus:ring-2 focus:ring-[#0066ff]/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#555f6c] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast("Password reset request logged for superuser.")}
                  className="text-xs font-semibold text-[#0050cb] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#c2c6d8] rounded-xl text-sm text-[#191c1e] placeholder:text-[#c2c6d8] focus:outline-none focus:border-[#0050cb] focus:ring-2 focus:ring-[#0066ff]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#727687] hover:text-[#191c1e] focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-[#0050cb] border-[#c2c6d8] rounded focus:ring-[#0066ff] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="ml-2.5 text-xs text-[#424656] cursor-pointer select-none"
              >
                Remember this device
              </label>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 primary-gradient-btn text-white rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    <span>Login to Admin Hub</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Prominent Create Admin Account Button */}
          <div className="mt-8 pt-6 border-t border-[#c2c6d8]/20 text-center">
            <p className="text-xs text-[#424656] mb-3">Don&apos;t have an Admin account?</p>
            <button
              type="button"
              onClick={() => setMode("create")}
              className="w-full py-3 px-4 rounded-xl border-2 border-[#0066ff] text-[#0066ff] text-xs font-bold hover:bg-[#0066ff]/5 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create New Admin Account
            </button>
          </div>
        </div>
      )}

      {/* 2. CREATE ADMIN ACCOUNT CARD */}
      {mode === "create" && canCreateAdmin && (
        <div className="glass-panel rounded-[2rem] shadow-[0px_4px_20px_rgba(0,102,255,0.05)] p-8 md:p-12 border border-white/40">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#0066ff] rounded-2xl flex items-center justify-center shadow-lg mb-3 mx-auto text-white">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#191c1e] mb-1">
              Create Admin Account
            </h2>
            <p className="text-xs text-[#424656]">
              Set up new administrator credentials for system access.
            </p>
          </div>

          <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-1">
                Admin Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  type="text"
                  placeholder="e.g. Nitesh Kumar Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:border-[#0050cb]"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-1">
                Admin Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#424656] font-semibold text-xs">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="99999 99999"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:border-[#0050cb]"
                />
              </div>
            </div>

            {/* Email / Admin ID */}
            <div>
              <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-1">
                Admin Email or ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  type="text"
                  placeholder="admin@artiaircon.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:border-[#0050cb]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:border-[#0050cb]"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:border-[#0050cb]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 primary-gradient-btn text-white font-semibold rounded-full text-sm shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Registering Admin...
                </>
              ) : (
                "Create Admin Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#c2c6d8]/20 text-center">
            <p className="text-sm text-[#424656]">
              Already have an Admin account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[#0050cb] font-bold hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      )}

      {/* 3. SUCCESS CARD */}
      {mode === "success" && (
        <div className="glass-panel rounded-[2rem] p-8 md:p-12 text-center shadow-xl border border-white/40">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#191c1e] mb-2">
            Access Granted!
          </h2>
          <p className="text-[#424656] text-sm mb-8">
            Opening Admin Operational Hub...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-[#0050cb] animate-spin" />
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-[#424656] space-y-2">
        <p>© {new Date().getFullYear()} {BRAND_INFO.name}. Secure Admin Gateway v2.4.0</p>
      </div>
    </div>
  );
}
