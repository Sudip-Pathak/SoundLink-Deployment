import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUser, FaLock, FaEnvelope, FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import ForgotPasswordForm from "./ForgotPasswordForm";
import OTPVerificationForm from "./OTPVerificationForm";

// Default avatars for user selection
const DEFAULT_AVATARS = [
  "/avatars/avatar1.svg",
  "/avatars/avatar2.svg",
  "/avatars/avatar3.svg",
  "/avatars/avatar4.svg",
  "/avatars/avatar5.svg",
  "/avatars/avatar6.svg",
];

const AuthForm = ({ mode = "login", returnTo }) => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRegistration = location.pathname.startsWith('/admin') || location.state?.isAdminLogin;
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customAvatar, setCustomAvatar] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatars, setShowAvatars] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [userId, setUserId] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomAvatar(file);
      setSelectedAvatar(URL.createObjectURL(file));
      setShowAvatars(false);
    }
  };

  const handleSelectAvatar = (avatarPath) => {
    setSelectedAvatar(avatarPath);
    setCustomAvatar(null);
    setShowAvatars(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (currentMode === "login") {
        const result = await login(form.email, form.password);
        
        if (result.success) {
          setSuccess("Welcome back!");
          const destination = isAdminRegistration ? location.pathname : (returnTo || "/");
          setTimeout(() => navigate(destination), 500);
        } else if (result.requiresVerification) {
          setUserId(result.userId);
          setCurrentMode("verify-otp");
          setError("Please verify your email to continue.");
        } else {
          setError(result.message || "Invalid credentials");
        }
      } else if (currentMode === "register") {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        let avatarFile = customAvatar;
        
        // If a default avatar was selected (not a custom upload)
        if (selectedAvatar && !customAvatar) {
          // Fetch the selected default avatar as a file
          try {
            const response = await fetch(selectedAvatar);
            const blob = await response.blob();
            const fileName = selectedAvatar.split('/').pop();
            avatarFile = new File([blob], fileName, { type: blob.type });
          } catch (err) {
            console.error("Error fetching default avatar:", err);
          }
        }
        
        const result = await register({
          username: form.username,
          email: form.email,
          password: form.password,
          avatar: avatarFile,
          role: isAdminRegistration ? "admin" : "user"
        });
        console.log("Registration result:", result); // Add logging to debug
        if (result.success) {
          console.log("Registration successful, userId:", result.userId); // Add logging
          setUserId(result.userId);
          setCurrentMode("verify-otp");
        } else {
          setError(result.message || "Registration failed");
        }
      } else if (currentMode === "verify-otp") {
        // OTP verification logic
        // This is a placeholder and should be implemented
        setError("OTP verification logic not implemented");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (currentMode === "forgot-password") {
    return <ForgotPasswordForm onBack={() => setCurrentMode("login")} />;
  }

  if (currentMode === "verify-otp") {
    console.log("Rendering OTP form with userId:", userId); // Add logging
    return <OTPVerificationForm userId={userId} onBack={() => setCurrentMode("login")} />;
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
      
      <div className="card bg-base-100 shadow-2xl p-8 w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          {currentMode === "login" ? (isAdminRegistration ? "Admin Log in to SoundLink" : "Log in to SoundLink") : "Sign up for free"}
        </h2>
        
        {/* Avatar selection (register only) */}
        {currentMode === "register" && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <div 
              className="relative w-24 h-24 rounded-full bg-base-200 flex items-center justify-center border-2 border-primary cursor-pointer overflow-hidden shadow-lg hover:shadow-primary/20 transition"
              onClick={() => setShowAvatars(prev => !prev)}
            >
              {selectedAvatar ? (
                <img 
                  src={selectedAvatar} 
                  alt="Selected avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-primary opacity-50" size={50} />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium px-2 py-1 rounded-full bg-primary/70">Choose</span>
              </div>
            </div>
            
            {/* Avatar options */}
            {showAvatars && (
              <div className="bg-base-200 rounded-xl p-4 border border-base-300 shadow-xl animate-fadeIn">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {DEFAULT_AVATARS.map((avatar, index) => (
                    <div 
                      key={index}
                      className={`relative w-16 h-16 rounded-full cursor-pointer overflow-hidden transition-transform ${selectedAvatar === avatar ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'}`}
                      onClick={() => handleSelectAvatar(avatar)}
                    >
                      <img 
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <label className="btn btn-sm btn-outline btn-primary rounded-full cursor-pointer">
                    Upload Custom
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field (register only) */}
          {currentMode === "register" && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-white">What should we call you?</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
                  <FaUser />
                </div>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter a profile name."
                  value={form.username}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-11 bg-base-200 border-base-300 focus:border-white focus:outline-none focus:ring-0 rounded-md transition-colors"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          )}
          
          {/* Email field */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-white">Email address</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
                <FaEnvelope />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full pl-11 bg-base-200 border-base-300 focus:border-white focus:outline-none focus:ring-0 rounded-md transition-colors"
                required
                autoComplete="email"
              />
            </div>
          </div>
          
          {/* Password field */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-white">Password</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
                <FaLock />
              </div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input input-bordered w-full pl-11 bg-base-200 border-base-300 focus:border-white focus:outline-none focus:ring-0 rounded-md transition-colors"
                required
                autoComplete={currentMode === "login" ? "current-password" : "new-password"}
              />
            </div>
          </div>
          
          {/* Confirm Password field */}
          {currentMode === "register" && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-white">Confirm Password</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
                  <FaLock />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-11 bg-base-200 border-base-300 focus:border-white focus:outline-none focus:ring-0 rounded-md transition-colors"
                  required
                  minLength="6"
                />
              </div>
            </div>
          )}
          
          {/* Forgotten password link (login only) */}
          {currentMode === "login" && (
            <div className="text-left mt-2">
              <button
                type="button"
                onClick={() => setCurrentMode("forgot-password")}
                className="text-white hover:text-primary hover:underline text-sm font-bold transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}
          
          {/* Messages */}
          {error && (
            <div className="alert alert-error rounded-md text-sm py-2">
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success rounded-md text-sm py-2">
              <span>{success}</span>
            </div>
          )}
          
          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full rounded-full font-bold text-base bg-primary hover:bg-[#1fdf64] hover:scale-[1.02] border-none text-black transition-transform"
            >
              {loading ? (
                <span className="loading loading-spinner text-black"></span>
              ) : (
                currentMode === "login" ? "Log In" : "Sign Up"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AuthForm; 