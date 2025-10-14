import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { login, signup, resendVerificationEmail } = useContext(AuthContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (currState === "Sign up") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        if (username.length < 3) {
          toast.error("Username must be at least 3 characters");
          setIsLoading(false);
          return;
        }
      }

      let result;

      if (currState === "Sign up") {
        result = await signup({ fullName, username, email, password });
        
        if (result.success) {
          setVerificationSent(true);
          toast.success("Account created! Please check your email for verification link.");
          resetForm();
        } else {
          toast.error(result.message || "Failed to create account");
        }
      } else if (currState === "Login") {
        // AuthContext.login expects a credentials object: { email, password }
        result = await login({ email, password });
        
        if (result.success) {
          toast.success("Login successful!");
          resetForm();
        } else if (result.needsVerification) {
          setVerificationSent(true);
          toast.error("Please verify your email before logging in");
        } else {
          toast.error(result.message || "Login failed");
        }
      }

    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }
    
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        setVerificationSent(true);
        toast.success("Verification email sent!");
      } else {
        toast.error(result.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email");
    }
  };

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setVerificationSent(false);
  };

  const handleStateChange = (newState) => {
    resetForm();
    setCurrState(newState);
  };

  const handleForgotPassword = () => {
    toast.success("Forgot password feature coming soon!");
    // You can implement forgot password logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={onSubmitHandler}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currState === "Sign up" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-400 text-sm">
              {currState === "Sign up" 
                ? "Join our community today" 
                : "Sign in to your account"
              }
            </p>
          </div>

          {/* Email Verification Notice */}
          {verificationSent && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-200 text-sm">
                📧 Verification email sent! Check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-yellow-300 hover:text-yellow-200 text-xs mt-1 underline"
              >
                Didn't receive? Resend verification
              </button>
            </div>
          )}

          {/* Full Name Field (Sign up only) */}
          {currState === "Sign up" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
                type="text"
                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter your full name"
                required
                minLength={2}
                maxLength={50}
              />
            </div>
          )}

          {/* Username Field (Sign up only) */}
          {currState === "Sign up" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              <input
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                value={username}
                type="text"
                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers and underscores"
              />
              <p className="text-xs text-gray-400 mt-1">
                Only letters, numbers, and underscores allowed
              </p>
            </div>
          )}
          
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
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
          
          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password *
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

          {/* Confirm Password Field (Sign up only) */}
          {currState === "Sign up" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                type="password"
                placeholder="Confirm your password"
                required
                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                minLength={6}
              />
              {password !== confirmPassword && confirmPassword && (
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
            disabled={isLoading || (currState === "Sign up" && password !== confirmPassword)}
            className={`w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 ${
              isLoading || (currState === "Sign up" && password !== confirmPassword)
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-violet-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {currState === "Sign up" ? "Creating Account..." : "Signing In..."}
              </div>
            ) : currState === "Sign up" ? "Create Account" : "Sign In"}
          </button>

          {/* Switch between Login/Sign up */}
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
            ) : (
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
            )}
          </div>

          {/* Terms Notice (Sign up only) */}
          {currState === "Sign up" && (
            <p className="text-xs text-gray-500 text-center mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;