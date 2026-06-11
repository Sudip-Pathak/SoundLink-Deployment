import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const OTPVerificationForm = ({ userId, onBack }) => {
  const navigate = useNavigate();
  const { setToken, setUser, setIsEmailVerified } = useContext(AuthContext);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  console.log("OTPVerificationForm mounted with userId:", userId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!userId) {
      setError("User ID is missing. Please try registering again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting OTP verification with userId:", userId);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`,
        {
          userId,
          otp: otp.trim(),
        },
      );

      // console.log("OTP verification response:", response);
      if (response.data.success) {
        // Update auth context
        setToken(response.data.token);
        setUser(response.data.user);
        setIsEmailVerified(true);

        // Set axios default header
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;

        navigate("/");
      } else {
        setError(
          response.data.message || "Verification failed. Please try again.",
        );
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to verify OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");

    if (!userId) {
      setError("User ID is missing. Please try registering again.");
      setResendLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-otp`,
        {
          userId,
        },
      );

      if (response.data.success) {
        setError("New OTP has been sent to your email.");
      } else {
        setError(
          response.data.message || "Failed to resend OTP. Please try again.",
        );
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-2xl p-8 w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        Verify Your Email
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-white">Enter OTP</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
              <FaKey />
            </div>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              className="input input-bordered w-full pl-11 bg-base-200 border-base-300 focus:border-white focus:outline-none focus:ring-0 rounded-md transition-colors"
              required
              maxLength="6"
              pattern="[0-9]{6}"
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-error rounded-md text-sm py-2">
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full rounded-full font-bold text-base bg-primary hover:bg-[#1fdf64] hover:scale-[1.02] border-none text-black transition-transform"
          >
            {loading ? (
              <span className="loading loading-spinner text-black"></span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </div>

        <div className="flex justify-between items-center mt-4 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-white hover:text-primary hover:underline text-sm font-bold transition-colors"
          >
            Back to Login
          </button>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="text-white hover:text-primary hover:underline text-sm font-bold transition-colors disabled:opacity-50 disabled:no-underline"
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerificationForm;
