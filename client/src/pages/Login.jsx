import React, { useState, useContext } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [currState, setCurrState] = useState("Sign up"); // "Sign up" | "Login" | "Forgot Password" | "Change Password"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, resetPassword, changePassword, authUser } = useContext(AuthContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (currState === "Forgot Password" && !newPassword) {
        toast.error("Enter new password");
        setIsLoading(false);
        return;
      }

      if (currState === "Change Password" && (!oldPassword || !newPassword)) {
        toast.error("Fill all fields");
        setIsLoading(false);
        return;
      }

      // Handle different states
      if (currState === "Sign up" && !isDataSubmitted) {
        setIsDataSubmitted(true);
        setIsLoading(false);
        return;
      }

      let result;
      if (currState === "Sign up") {
        result = await login("signup", { fullName, email, password, bio });
      } else if (currState === "Login") {
        result = await login("login", { email, password });
      } else if (currState === "Forgot Password") {
        result = await resetPassword({ email, newPassword });
      } else if (currState === "Change Password") {
        result = await changePassword({ oldPassword, newPassword });
      }

      if (result?.success) {
        // Reset form only on success
        setFullName("");
        setEmail("");
        setPassword("");
        setBio("");
        setOldPassword("");
        setNewPassword("");
        setIsDataSubmitted(false);
        
        // Show success message
        if (currState === "Sign up") {
          toast.success("Account created successfully!");
        } else if (currState === "Login") {
          toast.success("Welcome back!");
        } else if (currState === "Forgot Password") {
          toast.success("Password reset successfully!");
          setCurrState("Login");
        } else if (currState === "Change Password") {
          toast.success("Password changed successfully!");
        }
      }

    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setOldPassword("");
    setNewPassword("");
    setIsDataSubmitted(false);
  };

  const handleStateChange = (newState) => {
    resetForm();
    setCurrState(newState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        
        {/* Left Section - Brand/Logo */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md">
          <img 
            src={assets.logo_big} 
            alt="ChatApp Logo" 
            className="w-48 lg:w-64 mb-6 drop-shadow-2xl" 
          />
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Connect with Friends & Communities
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Secure messaging, voice calls, and group chats. Stay connected with your loved ones in real-time.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              End-to-end encrypted
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Real-time messaging
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Group chats
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              Voice messages
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full max-w-md">
          <form
            onSubmit={onSubmitHandler}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {currState}
                {currState === "Change Password" && " 🔒"}
              </h2>
              
              {isDataSubmitted && currState === "Sign up" && (
                <button
                  type="button"
                  onClick={() => setIsDataSubmitted(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                  title="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Step 1: Signup/Login Fields */}
            {!isDataSubmitted && (currState === "Sign up" || currState === "Login") && (
              <div className="space-y-4">
                {currState === "Sign up" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      onChange={(e) => setFullName(e.target.value)}
                      value={fullName}
                      type="text"
                      className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    minLength={6}
                  />
                </div>
                
                {currState === "Login" && (
                  <button
                    type="button"
                    onClick={() => handleStateChange("Forgot Password")}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors text-right w-full mt-2"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Bio for Signup */}
            {currState === "Sign up" && isDataSubmitted && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tell us about yourself
                </label>
                <textarea
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder="Write a short bio about yourself..."
                  rows={4}
                  className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  required
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {bio.length}/500 characters
                </p>
              </div>
            )}

            {/* Forgot Password */}
            {currState === "Forgot Password" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registered Email
                  </label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    placeholder="Enter your registered email"
                    required
                    className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                    type="password"
                    placeholder="Enter your new password"
                    required
                    className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Change Password */}
            {currState === "Change Password" && authUser && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    onChange={(e) => setOldPassword(e.target.value)}
                    value={oldPassword}
                    type="password"
                    placeholder="Enter your current password"
                    required
                    className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                    type="password"
                    placeholder="Enter your new password"
                    required
                    className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium mt-6 transition-all duration-200 ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-violet-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : currState === "Sign up" ? (
                isDataSubmitted ? "Complete Sign Up" : "Continue"
              ) : currState === "Login" ? "Sign In" :
                currState === "Forgot Password" ? "Reset Password" : "Change Password"
              }
            </button>

            {/* Footer Links */}
            {!isDataSubmitted && currState !== "Change Password" && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                {currState === "Sign up" ? (
                  <p className="text-center text-gray-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleStateChange("Login")}
                      className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                ) : currState === "Login" ? (
                  <p className="text-center text-gray-400">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleStateChange("Sign up")}
                      className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStateChange("Login")}
                    className="w-full text-center text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    ← Back to Sign in
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;