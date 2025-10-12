import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import toast from "react-hot-toast";
import { FiArrowLeft, FiUser, FiLock, FiShield, FiCamera, FiCheck, FiMail, FiGlobe } from 'react-icons/fi';

const Profile = () => {
  const { authUser, updateProfile, changePassword, logout } = useContext(AuthContext);
  const { getUsers } = useContext(ChatContext);
  const [activeTab, setActiveTab] = useState("edit");
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [username, setUsername] = useState(authUser?.username || '');
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    readReceipts: true,
    profileVisibility: 'everyone',
    allowFriendRequests: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    setLoading(true);

    try {
      let body = { 
        fullName: name.trim(), 
        bio: bio.trim(),
        username: username.trim() || undefined
      };

      if (selectedImg) {
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedImg);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        body.profilePic = base64Image;
      }

      const data = await updateProfile(body);
      if (data.success) {
        toast.success("Profile updated successfully!");
        setSelectedImg(null);
        // Refresh users list to show updated profile
        await getUsers();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (oldPassword === newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    setLoading(true);
    try {
      const data = await changePassword({ oldPassword, newPassword });
      if (data.success) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Password change failed");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySave = async () => {
    setLoading(true);
    try {
      // Here you would typically send privacy settings to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Privacy settings updated!");
    } catch (error) {
      toast.error("Failed to update privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      setSelectedImg(file);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      toast.error("Account deletion feature coming soon");
      // Implement account deletion logic here
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden'>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <FiArrowLeft size={20} />
              <span>Back to Chat</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row min-h-[600px]'>
          {/* Left Sidebar - Navigation */}
          <div className='lg:w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col'>
            <div className="space-y-2 flex-1">
              <button 
                onClick={() => setActiveTab("edit")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeTab === "edit" 
                    ? "bg-violet-600 text-white shadow-lg" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiUser size={18} />
                <span>Edit Profile</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeTab === "password" 
                    ? "bg-violet-600 text-white shadow-lg" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiLock size={18} />
                <span>Password</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeTab === "privacy" 
                    ? "bg-violet-600 text-white shadow-lg" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiShield size={18} />
                <span>Privacy</span>
              </button>
            </div>

            {/* User Info Card */}
            <div className="mt-auto p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  {selectedImg ? (
                    <img 
                      src={URL.createObjectURL(selectedImg)} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/50"
                    />
                  ) : authUser?.profilePic ? (
                    <img 
                      src={authUser.profilePic} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-violet-500/50">
                      {getInitials(authUser?.fullName)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c2e]"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white text-sm truncate">{authUser?.fullName}</p>
                  <p className="text-gray-400 text-xs truncate">{authUser?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={logout}
                  className="w-full text-red-400 hover:text-red-300 text-sm py-2 hover:bg-red-500/10 rounded transition-colors"
                >
                  Sign Out
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full text-gray-400 hover:text-red-400 text-xs py-1 hover:bg-red-500/10 rounded transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className='flex-1 p-8 overflow-y-auto max-h-[600px]'>
            {/* Edit Profile Tab */}
            {activeTab === "edit" && (
              <form onSubmit={handleSubmit} className="max-w-md">
                <h2 className='text-xl font-bold text-white mb-6'>Edit Profile</h2>
                
                {/* Profile Picture Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl relative overflow-hidden border-2 border-violet-500/50">
                        {selectedImg ? (
                          <img 
                            src={URL.createObjectURL(selectedImg)} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : authUser?.profilePic ? (
                          <img 
                            src={authUser.profilePic} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(authUser?.fullName)
                        )}
                      </div>
                      <label 
                        htmlFor='avatar'
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors border-2 border-[#1c1c2e]"
                      >
                        <FiCamera size={14} />
                      </label>
                    </div>
                    <div className="flex-1">
                      <input
                        onChange={handleImageChange}
                        type='file'
                        id='avatar'
                        accept='.png, .jpg, .jpeg, .webp'
                        hidden
                      />
                      <p className="text-sm text-gray-400">
                        Click the camera icon to upload a new profile picture
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: Square image, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type='text'
                    required
                    placeholder='Enter your full name'
                    className='w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors'
                    disabled={loading}
                  />
                </div>

                {/* Username Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    type='text'
                    placeholder='Choose a username'
                    className='w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors'
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This will be your unique identifier
                  </p>
                </div>

                {/* Email Display */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-gray-600 rounded-lg text-gray-400">
                    <FiMail size={16} />
                    <span>{authUser?.email}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Contact support to change your email
                  </p>
                </div>

                {/* Bio Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                    placeholder='Tell us about yourself...'
                    className='w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none'
                    rows={4}
                    disabled={loading}
                    maxLength={500}
                  ></textarea>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {bio.length}/500 characters
                  </p>
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className={`w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-violet-700 hover:to-purple-700 hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FiCheck size={18} />
                      Save Changes
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordChange} className="max-w-md">
                <h2 className='text-xl font-bold text-white mb-6'>Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password *
                    </label>
                    <input
                      type='password'
                      placeholder='Enter your current password'
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className='w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors'
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password *
                    </label>
                    <input
                      type='password'
                      placeholder='Enter new password (min 6 characters)'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className='w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors'
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type='password'
                      placeholder='Confirm new password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors'
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    <strong>Tip:</strong> Use a strong password with letters, numbers, and symbols for better security.
                  </p>
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className={`w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium mt-6 transition-all duration-200 ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-violet-700 hover:to-purple-700 hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="max-w-md">
                <h2 className='text-xl font-bold text-white mb-6'>Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Account Privacy</h3>
                    
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-gray-600 hover:border-violet-500/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-white">Show Online Status</p>
                        <p className="text-sm text-gray-400">Let others see when you're online</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={privacySettings.showOnlineStatus}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          showOnlineStatus: e.target.checked
                        }))}
                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-gray-600 hover:border-violet-500/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-white">Read Receipts</p>
                        <p className="text-sm text-gray-400">Show when you've read messages</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={privacySettings.readReceipts}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          readReceipts: e.target.checked
                        }))}
                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-gray-600 hover:border-violet-500/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-white">Allow Friend Requests</p>
                        <p className="text-sm text-gray-400">Let others send you friend requests</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={privacySettings.allowFriendRequests}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          allowFriendRequests: e.target.checked
                        }))}
                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                      />
                    </label>

                    <div className="p-3 bg-white/5 rounded-lg border border-gray-600">
                      <label className="block text-sm font-medium text-white mb-2">
                        Profile Visibility
                      </label>
                      <select 
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          profileVisibility: e.target.value
                        }))}
                        className="w-full p-2 bg-[#282142] border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-violet-500"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="contacts">Contacts Only</option>
                        <option value="nobody">Nobody</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        Control who can see your profile information
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      <FiGlobe className="inline mr-1" />
                      <strong>Note:</strong> These settings affect how others interact with your profile and see your activity.
                    </p>
                  </div>

                  <button
                    onClick={handlePrivacySave}
                    disabled={loading}
                    className={`w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 ${
                      loading 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:from-violet-700 hover:to-purple-700 hover:shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Privacy Settings"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;