import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const Notfound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        
        {/* Animated 404 Graphic */}
        <div className="relative mb-8">
          <div className="w-48 h-48 mx-auto mb-6 relative">
            {/* Outer Circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 animate-pulse"></div>
            
            {/* Middle Circle */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-400/40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Inner Circle with Icon */}
            <div className="absolute inset-16 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
              <FiAlertTriangle className="text-white text-4xl" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-4 -right-4 w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-white mb-4 bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
            The page you're looking for seems to have wandered off into the digital void. 
            It might have been moved, deleted, or never existed in the first place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-gray-600 text-gray-300 rounded-lg hover:bg-white/10 hover:border-violet-500 hover:text-white transition-all duration-200 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <FiHome className="group-hover:scale-110 transition-transform" />
            Back to Home
          </button>
        </div>

        {/* Additional Help */}
        <div className="text-gray-400 text-sm">
          <p className="mb-2">If you believe this is an error, please contact support.</p>
          <div className="flex justify-center gap-6 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Status: 404
            </span>
            <span>•</span>
            <span>Page Not Found</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 opacity-20">
          <div className="w-32 h-32 border-2 border-violet-500 rounded-full animate-spin-slow"></div>
        </div>
        
        <div className="absolute top-8 right-8 opacity-20">
          <div className="w-24 h-24 border-2 border-purple-500 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-400 rounded-full opacity-60 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Add custom animations to your CSS or Tailwind config */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Notfound;