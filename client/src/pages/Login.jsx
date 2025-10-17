import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, signup, resendVerification } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected from verification page
  useEffect(() => {
    if (location.state?.showResendOption) {
      setVerificationSent(true);
      if (location.state?.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
        setPendingVerificationEmail(location.state.email);
      }
    }
  }, [location]);

  // Handle all input changes - SIMPLIFIED
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      // Only allow letters, numbers, underscores for username
      const filteredValue = value.replace(/[^a-zA-Z0-9_]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: filteredValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (currState === "Sign up") {
      // Full name validation
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      }

      // Username validation
      if (!formData.username) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (currState === "Sign up") {
        result = await signup({ 
          fullName: formData.fullName.trim(),
          username: formData.username,
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        });
        
        if (result.success) {
          setVerificationSent(true);
          setPendingVerificationEmail(formData.email.toLowerCase());
          toast.success(
            <div>
              <div>🎉 Account created successfully!</div>
              <div className="text-sm">Check your email for verification link</div>
            </div>,
            { duration: 6000 }
          );
          resetForm();
        } else {
          if (result.message?.includes("already exists")) {
            setErrors(prev => ({ ...prev, email: "User with this email already exists" }));
          }
          toast.error(result.message || "Failed to create account");
        }
      } else {
        // Login
        result = await login({ 
          email: formData.email.toLowerCase().trim(), 
          password: formData.password 
        });
        
        if (result.success) {
          toast.success("Welcome back! 🎉");
          resetForm();
        } else if (result.needsVerification) {
          setVerificationSent(true);
          setPendingVerificationEmail(formData.email.toLowerCase());
          toast.error(
            <div>
              <div>📧 Email not verified</div>
              <div className="text-sm">Please check your email for verification link</div>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.error(result.message || "Login failed. Please check your credentials.");
        }
      }

    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = pendingVerificationEmail || formData.email;
    
    if (!emailToUse) {
      toast.error("Please enter your email first");
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await resendVerification(emailToUse);
      if (result.success) {
        toast.success("📧 Verification email sent! Check your inbox and spam folder.");
      } else {
        toast.error(result.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    setErrors({});
  };

  const handleStateChange = (newState) => {
    resetForm();
    setVerificationSent(false);
    setPendingVerificationEmail("");
    setCurrState(newState);
  };

  const handleForgotPassword = () => {
    toast("Forgot password feature coming soon!", { icon: "🔜" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ChatApp</h1>
          <p className="text-gray-400">
            {currState === "Sign up" ? "Join the conversation" : "Welcome back to your chats"}
          </p>
        </div>

        <form
          onSubmit={onSubmitHandler}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currState === "Sign up" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-400 text-sm">
              {currState === "Sign up" 
                ? "Start your messaging journey" 
                : "Continue your conversations"
              }
            </p>
          </div>

          {/* Email Verification Notice */}
          {verificationSent && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl mt-1">📧</div>
                <div className="flex-1">
                  <p className="text-yellow-200 text-sm font-medium mb-2">
                    Verification Required
                  </p>
                  <p className="text-yellow-300 text-xs mb-3">
                    We've sent a verification link to <strong>{pendingVerificationEmail || formData.email}</strong>. 
                    Please check your inbox and spam folder.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 text-white text-xs font-medium rounded transition-colors"
                    >
                      {isLoading ? "Sending..." : "Resend Verification"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationSent(false)}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Name Field (Sign up only) */}
          {currState === "Sign up" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                type="text"
                className={`w-full p-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.fullName ? "border-red-500/50 focus:border-red-500" : "border-gray-600 focus:border-violet-500"
                }`}
                placeholder="Enter your full name"
                required
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>
          )}

          {/* Username Field (Sign up only) */}
          {currState === "Sign up" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                type="text"
                className={`w-full p-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.username ? "border-red-500/50 focus:border-red-500" : "border-gray-600 focus:border-violet-500"
                }`}
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={20}
              />
              {errors.username ? (
                <p className="text-red-400 text-xs mt-1">{errors.username}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  Only letters, numbers, and underscores allowed (3-20 characters)
                </p>
              )}
            </div>
          )}
          
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              className={`w-full p-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                errors.email ? "border-red-500/50 focus:border-red-500" : "border-gray-600 focus:border-violet-500"
              }`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          
          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                type={showPassword ? "text" : "password"}
                className={`w-full p-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.password ? "border-red-500/50 focus:border-red-500" : "border-gray-600 focus:border-violet-500"
                }`}
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password Field (Sign up only) */}
          {currState === "Sign up" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full p-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.confirmPassword ? "border-red-500/50 focus:border-red-500" : "border-gray-600 focus:border-violet-500"
                  }`}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
          )}
          
          {/* Forgot Password (Login only) */}
          {currState === "Login" && (
            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (currState === "Sign up" && formData.password !== formData.confirmPassword)}
            className={`w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 ${
              isLoading || (currState === "Sign up" && formData.password !== formData.confirmPassword)
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-violet-700 hover:to-purple-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{currState === "Sign up" ? "Creating Account..." : "Signing In..."}</span>
              </div>
            ) : currState === "Sign up" ? (
              <span className="flex items-center justify-center gap-2">
                <span>🎉</span> Create Account
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🔐</span> Sign In
              </span>
            )}
          </button>

          {/* Switch between Login/Sign up */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            {currState === "Sign up" ? (
              <p className="text-center text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleStateChange("Login")}
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors underline"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p className="text-center text-gray-400">
                New to ChatApp?{" "}
                <button
                  type="button"
                  onClick={() => handleStateChange("Sign up")}
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors underline"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>

          {/* Terms Notice (Sign up only) */}
          {currState === "Sign up" && (
            <p className="text-xs text-gray-500 text-center mt-6">
              By creating an account, you agree to our{" "}
              <button type="button" className="text-violet-400 hover:text-violet-300 underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-violet-400 hover:text-violet-300 underline">
                Privacy Policy
              </button>
            </p>
          )}
        </form>

        {/* Mobile Tips */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 text-center">
            📱 <strong>Mobile Users:</strong> Make sure you're using: 
            <br />
            <code className="bg-black/30 px-2 py-1 rounded mt-1 text-xs">
              https://5d4xmbxq-5173.inc1.devtunnels.ms
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;