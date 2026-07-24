"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Lock, User, KeyRound, Eye, EyeOff, CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/use-auth-store";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "success";

function CustomerLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { loginCustomer } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>("login");

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle Customer Login (Mobile + Password)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 8) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data?.message || "Unable to sign in.");
      }

      loginCustomer(data.user);
      setMode("success");
      toast.success("Customer Sign In successful!");

      setTimeout(() => {
        router.replace(redirectTo);
      }, 1200);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Customer Signup (Create Account)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || fullName.length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    if (!mobileNumber || mobileNumber.length < 8) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter (e.g. A, B, C)");
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter (e.g. a, b, c)");
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number (e.g. 1, 2, 3)");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error("Password must contain at least one special character (e.g. @, #, !)");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!termsAgreed) {
      toast.error("You must agree to the Terms of Service");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/customer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          mobileNumber,
          password,
          confirmPassword,
          terms: termsAgreed,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data?.message || "Unable to create account.");
      }

      loginCustomer(data.user);
      setMode("success");
      toast.success("Customer Account created successfully!");

      setTimeout(() => {
        router.replace(redirectTo);
      }, 1200);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 8) {
      toast.error("Please enter your registered mobile number");
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMode("reset");
      toast.success("Reset code verified. Please set your new password.");
    }, 1000);
  };

  // Handle Reset Password Submit
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setPassword(newPassword);
      setMode("login");
      toast.success("Password updated successfully! Please log in with your new password.");
    }, 1000);
  };

  return (
    <div className="w-full">
      {/* 1. LOGIN CARD */}
      {mode === "login" && (
        <section className="glass-card rounded-[2rem] p-8 md:p-10 shadow-xl border border-white/40">
          {/* Redirect notice — shown when coming from /book */}
          {redirectTo === "/book" && (
            <div className="flex items-start gap-3 mb-6 px-4 py-3 bg-[#dae1ff] border border-[#0050cb]/20 rounded-xl">
              <CalendarCheck className="w-5 h-5 text-[#0050cb] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#001849]">Login required to book a service</p>
                <p className="text-xs text-[#424656] mt-0.5">Please sign in or create an account first. You&apos;ll be taken back to the booking page automatically.</p>
              </div>
            </div>
          )}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-[#191c1e] mb-2">
              Customer Sign In
            </h2>
            <p className="text-[#424656] text-sm">
              Sign in with your customer mobile number and password.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile-login"
                className="block text-xs font-semibold text-[#424656] uppercase tracking-wider mb-2"
              >
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#424656] font-semibold text-sm">
                  +91
                </span>
                <input
                  id="mobile-login"
                  type="tel"
                  placeholder="99999 99999"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  className="w-full pl-14 pr-4 py-3.5 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
                />
              </div>
            </div>

            {/* Password with Forgot Password link */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password-login"
                  className="block text-xs font-semibold text-[#424656] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs font-semibold text-[#0050cb] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  id="password-login"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full text-white font-semibold text-sm primary-gradient-btn shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                "Customer Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#c2c6d8]/30 text-center">
            <p className="text-sm text-[#424656]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-[#0050cb] font-bold hover:underline"
              >
                Create Customer Account
              </button>
            </p>
          </div>
        </section>
      )}

      {/* 2. SIGNUP CARD (CREATE ACCOUNT) */}
      {mode === "signup" && (
        <section className="glass-card rounded-[2rem] p-8 md:p-10 shadow-xl border border-white/40">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-[#191c1e] mb-2">
              Create Customer Account
            </h2>
            <p className="text-[#424656] text-sm">
              Enter your details to set up your customer account.
            </p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full-name"
                className="block text-xs font-semibold text-[#424656] uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  id="full-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile-signup"
                className="block text-xs font-semibold text-[#424656] uppercase tracking-wider mb-1.5"
              >
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#424656] font-semibold text-sm">
                  +91
                </span>
                <input
                  id="mobile-signup"
                  type="tel"
                  placeholder="99999 99999"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  className="w-full pl-14 pr-4 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password-signup"
                className="block text-xs font-semibold text-[#424656] uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  id="password-signup"
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Min 8 chars, A-Z, a-z, 0-9, @#!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#727687] hover:text-[#191c1e] focus:outline-none"
                  title={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-[#727687]">
                Must have: 8+ chars, uppercase (A-Z), lowercase (a-z), number (0-9), special char (@#!)
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password-signup"
                className="block text-xs font-semibold text-[#424656] uppercase tracking-wider mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  id="confirm-password-signup"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#727687] hover:text-[#191c1e] focus:outline-none"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 rounded border-[#c2c6d8] text-[#0050cb] focus:ring-[#0066ff]"
              />
              <label htmlFor="terms" className="text-xs text-[#424656] leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-[#0050cb] hover:underline font-semibold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#0050cb] hover:underline font-semibold">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-full text-white font-semibold text-sm primary-gradient-btn shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#c2c6d8]/30 text-center">
            <p className="text-sm text-[#424656]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[#0050cb] font-bold hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </section>
      )}

      {/* 3. FORGOT PASSWORD CARD */}
      {mode === "forgot" && (
        <section className="glass-card rounded-[2rem] p-8 md:p-10 shadow-xl border border-white/40">
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="flex items-center text-[#0050cb] text-xs font-semibold mb-4 hover:gap-1 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Customer Sign In
            </button>
            <h2 className="font-display text-2xl font-bold text-[#191c1e] mb-2">
              Forgot Password
            </h2>
            <p className="text-[#424656] text-sm">
              Enter your registered mobile number to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="mobile-forgot"
                className="block text-xs font-semibold text-[#424656] uppercase tracking-wider mb-2"
              >
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#424656] font-semibold text-sm">
                  +91
                </span>
                <input
                  id="mobile-forgot"
                  type="tel"
                  placeholder="99999 99999"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  className="w-full pl-14 pr-4 py-3.5 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full text-white font-semibold text-sm primary-gradient-btn shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying Mobile...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        </section>
      )}

      {/* 4. RESET PASSWORD CARD */}
      {mode === "reset" && (
        <section className="glass-card rounded-[2rem] p-8 md:p-10 shadow-xl border border-white/40">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-[#191c1e] mb-2">
              Reset Password
            </h2>
            <p className="text-[#424656] text-sm">
              Enter a new password for your account.
            </p>
          </div>

          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold text-[#424656] uppercase tracking-wider mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#c2c6d8]" />
                <input
                  id="new-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#c2c6d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0050cb] transition-all text-[#191c1e]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full text-white font-semibold text-sm primary-gradient-btn shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Resetting...
                </>
              ) : (
                "Save New Password"
              )}
            </button>
          </form>
        </section>
      )}

      {/* 5. SUCCESS CARD */}
      {mode === "success" && (
        <section className="glass-card rounded-[2rem] p-8 md:p-10 text-center shadow-xl border border-white/40">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#191c1e] mb-2">
            Success!
          </h2>
          <p className="text-[#424656] text-sm mb-8">
            {redirectTo === "/book"
              ? "Redirecting you to the booking page..."
              : "Redirecting to Customer Dashboard..."}
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-[#0050cb] animate-spin" />
          </div>
        </section>
      )}
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[400px] flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-[#0050cb] animate-spin" />
        </div>
      }
    >
      <CustomerLoginFormContent />
    </Suspense>
  );
}
