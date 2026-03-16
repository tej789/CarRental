import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

// OTP Verification UI component
// Frontend-only: talks to backend APIs that use Brevo to send emails.
// Props:
// - email: user's email address
// - isPasswordReset: if true, component is used in the forgot-password flow
// - onSuccess: callback with token (signup) or otp (password reset)
// - onBack: callback to go back to previous screen
const OtpVerification = ({ email, isPasswordReset = false, onSuccess, onBack }) => {
  const { axios } = useAppContext();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      toast.error("Please enter the OTP sent to your email");
      return;
    }

    // Password reset flow: just return OTP to parent
    if (isPasswordReset) {
      onSuccess && onSuccess(otp);
      return;
    }

    // Registration flow: verify OTP via backend
    setLoading(true);
    try {
      const { data } = await axios.post("/api/user/verify-otp", { email, otp });

      if (data.success) {
        toast.success("OTP verified successfully");
        onSuccess && onSuccess(data.token);
      } else {
        toast.error(data.message || "Failed to verify OTP");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing");
      return;
    }

    try {
      const { data } = await axios.post("/api/user/resend-otp", { email });
      if (data.success) {
        toast.success(data.message || "OTP resent to your email");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const inputClass =
    "w-full mt-1 px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition";

  const buttonClass =
    "bg-primary hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition disabled:bg-gray-400";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="text-2xl font-semibold text-center">
        <span className="text-primary">User</span> OTP Verification
      </h2>

      <div>
        <label className="text-sm font-medium">OTP</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className={inputClass}
          maxLength={6}
          required
        />
      </div>

      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "Verifying..." : isPasswordReset ? "Continue" : "Verify OTP"}
      </button>

      <p className="text-center text-sm">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          className="text-primary hover:underline"
        >
          Resend OTP
        </button>
      </p>

      <p className="text-center text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-primary hover:underline"
        >
          Back
        </button>
      </p>
    </form>
  );
};

export default OtpVerification;