import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom' 
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail' // Add this import
import Notfound from './pages/Notfound'
import { Toaster } from "react-hot-toast"
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const { authUser, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading ChatApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c1c2e',
            color: 'white',
            border: '1px solid #374151',
            borderRadius: '12px',
          },
        }}
      />

      <Routes>
        <Route 
          path="/" 
          element={authUser ? <Home /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/login" 
          element={!authUser ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/profile" 
          element={authUser ? <Profile /> : <Navigate to="/login" replace />} 
        />
        {/* Add this new route */}
        <Route 
          path="/verify-email" 
          element={<VerifyEmail />} 
        />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </div>
  );
}

export default App;