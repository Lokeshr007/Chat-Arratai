import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link - no token found');
        toast.error('Invalid verification link');
        return;
      }

      try {
        console.log('🔐 Verifying email with token:', token);
        
        // Use the backend URL from environment variables
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://5d4xmbxq-5000.inc1.devtunnels.ms';
        const { data } = await axios.get(`${backendUrl}/api/users/verify-email?token=${token}`);
        
        console.log('📨 Verification response:', data);
        
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          toast.success('🎉 Email verified! You can now login.');
          
          // Start countdown for redirect
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/login');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
          toast.error('Verification failed');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        
        let errorMessage = 'Verification failed. Please try again.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please try again later.';
        }
        
        setStatus('error');
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    try {
      // You might want to get the email from context or localStorage
      // For now, we'll redirect to login where they can request resend
      navigate('/login', { 
        state: { 
          showResendOption: true,
          message: 'Please login to request a new verification email' 
        } 
      });
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend verification email');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        {/* Verifying State */}
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h2>
            <p className="text-gray-400">Please wait while we verify your email address...</p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
            >
              Go to Login Now
            </button>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleGoToLogin}
                className="w-full py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                Go to Login
              </button>
              
              <button
                onClick={handleResendVerification}
                className="w-full py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Resend Verification Email
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                💡 <strong>Mobile Users:</strong> Make sure you're using the correct app URL: 
                <br />
                <code className="text-xs bg-black/30 p-1 rounded">https://5d4xmbxq-5173.inc1.devtunnels.ms</code>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;