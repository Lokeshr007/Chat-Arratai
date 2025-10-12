import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { 
  X, 
  Image, 
  Info, 
  User, 
  UserPlus, 
  UserX, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  Mic,
  Video,
  MapPin,
  Link,
  Download,
  FileText
} from "lucide-react";
import { FiUsers, FiSettings, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const RightSidebar = ({ onClose }) => {
  const { 
    selectedUser, 
    selectedGroup,
    blockUser, 
    unblockUser, 
    blockedUsers = [], 
    messages, 
    addMemberToGroup, 
    removeMemberFromGroup,
    users,
    leaveGroup,
    updateGroupInfo
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("info");
  const [chatMedia, setChatMedia] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberSearch, setNewMemberSearch] = useState("");
  const [showRemoveMember, setShowRemoveMember] = useState(null);
  const [editGroupInfo, setEditGroupInfo] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [sharedLinks, setSharedLinks] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [voiceCallModal, setVoiceCallModal] = useState(false);
  const [videoCallModal, setVideoCallModal] = useState(false);

  const currentChat = selectedUser || selectedGroup;

  if (!currentChat) {
    return (
      <div className="bg-[#1c1c2e] h-full w-full sm:w-80 border-l border-gray-700 flex flex-col">
        <div className="flex items-center justify-center h-full text-gray-400">
          No chat selected
        </div>
      </div>
    );
  }

  const isGroup = !!selectedGroup;
  const isBlocked = Array.isArray(blockedUsers) && blockedUsers.includes(currentChat._id);
  const isAdmin = isGroup && currentChat.admin?.toString() === authUser?._id?.toString();
  const isMember = isGroup && currentChat.members?.some(member => member._id === authUser?._id);

  // Extract media from messages
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      const chatMessages = messages.filter(msg => 
        msg.receiverId === currentChat._id || msg.senderId === currentChat._id
      );
      
      const media = chatMessages
        .filter(msg => msg.media && msg.media.length > 0)
        .flatMap(msg => msg.media)
        .filter(url => typeof url === 'string' && url.includes('http'));
      setChatMedia([...new Set(media)]);
    } else {
      setChatMedia([]);
    }
  }, [currentChat, messages]);

  // Extract shared links and documents from messages
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      const chatMessages = messages.filter(msg => 
        msg.receiverId === currentChat._id || msg.senderId === currentChat._id
      );

      // Extract links
      const links = chatMessages
        .filter(msg => msg.text && typeof msg.text === 'string')
        .map(msg => {
          const urlRegex = /https?:\/\/[^\s]+/g;
          const links = msg.text.match(urlRegex);
          return links ? links.map(link => ({ 
            link, 
            timestamp: msg.createdAt,
            sender: msg.senderId === authUser?._id ? 'You' : (isGroup ? msg.senderName : currentChat.fullName)
          })) : [];
        })
        .flat();
      setSharedLinks([...new Set(links)]);

      // Extract documents
      const docs = chatMessages
        .filter(msg => msg.media && msg.media.length > 0)
        .flatMap(msg => 
          msg.media.map(mediaUrl => ({
            url: mediaUrl,
            name: mediaUrl.split('/').pop(),
            timestamp: msg.createdAt,
            type: getFileType(mediaUrl),
            sender: msg.senderId === authUser?._id ? 'You' : (isGroup ? msg.senderName : currentChat.fullName)
          }))
        )
        .filter(doc => doc.type === 'document');
      setSharedDocs(docs);
    } else {
      setSharedLinks([]);
      setSharedDocs([]);
    }
  }, [currentChat, messages, authUser?._id, isGroup]);

  // Initialize group info
  useEffect(() => {
    if (currentChat && isGroup) {
      setGroupName(currentChat.name || "");
      setGroupDescription(currentChat.description || "");
    }
  }, [currentChat, isGroup]);

  const getFileType = (url) => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (docExtensions.includes(extension)) return 'document';
    return 'other';
  };

  const handleAddMember = async (userId) => {
    try {
      await addMemberToGroup(currentChat._id, [userId]);
      setShowAddMember(false);
      setNewMemberSearch("");
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Add member error:", error);
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMemberFromGroup(currentChat._id, userId);
      setShowRemoveMember(null);
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(currentChat._id);
        onClose();
        toast.success("You have left the group");
      } catch (error) {
        console.error("Leave group error:", error);
        toast.error("Failed to leave group");
      }
    }
  };

  const handleUpdateGroupInfo = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      await updateGroupInfo(currentChat._id, {
        name: groupName.trim(),
        description: groupDescription.trim()
      });
      setEditGroupInfo(false);
      toast.success("Group info updated successfully");
    } catch (error) {
      console.error("Update group info error:", error);
      toast.error("Failed to update group info");
    }
  };

  const handleVoiceCall = () => {
    setVoiceCallModal(true);
    toast.success(`Calling ${currentChat.fullName}...`);
  };

  const handleVideoCall = () => {
    setVideoCallModal(true);
    toast.success(`Starting video call with ${currentChat.fullName}...`);
  };

  const downloadFile = async (url, filename) => {
    try {
      toast.loading('Downloading file...');
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.dismiss();
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error('Failed to download file');
    }
  };

  const getSharedLocations = () => {
    const chatMessages = messages.filter(msg => 
      msg.receiverId === currentChat._id || msg.senderId === currentChat._id
    );
    
    return chatMessages
      .filter(msg => msg.location)
      .map(msg => ({
        location: msg.location,
        timestamp: msg.createdAt,
        sender: msg.senderId === authUser?._id ? 'You' : (isGroup ? msg.senderName : currentChat.fullName)
      }));
  };

  const getJoinDate = () => {
    return currentChat.createdAt ? new Date(currentChat.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : "January 2024";
  };

  const getMediaCount = () => {
    const chatMessages = messages.filter(msg => 
      msg.receiverId === currentChat._id || msg.senderId === currentChat._id
    );
    return chatMessages.filter(msg => msg.media && msg.media.length > 0).length;
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'zip':
      case 'rar':
        return '📦';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  const filteredUsers = users?.filter(user => 
    user._id !== authUser?._id && 
    !currentChat.members?.some(member => member._id === user._id) &&
    user.fullName?.toLowerCase().includes(newMemberSearch.toLowerCase())
  ) || [];

  const sharedLocations = getSharedLocations();

  return (
    <div className="bg-[#1c1c2e] h-full w-full sm:w-80 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white truncate">
          {isGroup ? currentChat.name : currentChat.fullName || "User Profile"}
        </h2>
        <div className="flex items-center gap-2">
          {!isGroup && !isBlocked && (
            <>
              <button 
                onClick={handleVoiceCall}
                className="text-gray-400 hover:text-green-400 transition-colors p-1"
                title="Voice Call"
              >
                <Mic size={18} />
              </button>
              <button 
                onClick={handleVideoCall}
                className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                title="Video Call"
              >
                <Video size={18} />
              </button>
            </>
          )}
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 overflow-x-auto">
        <button
          className={`flex items-center gap-2 flex-1 py-3 px-4 text-sm font-medium transition-colors min-w-max ${
            activeTab === "info" 
              ? "text-violet-400 border-b-2 border-violet-400" 
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("info")}
        >
          <Info size={16} />
          <span>Info</span>
        </button>
        <button
          className={`flex items-center gap-2 flex-1 py-3 px-4 text-sm font-medium transition-colors min-w-max ${
            activeTab === "media" 
              ? "text-violet-400 border-b-2 border-violet-400" 
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("media")}
        >
          <Image size={16} />
          <span>Media</span>
        </button>
        <button
          className={`flex items-center gap-2 flex-1 py-3 px-4 text-sm font-medium transition-colors min-w-max ${
            activeTab === "links" 
              ? "text-violet-400 border-b-2 border-violet-400" 
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("links")}
        >
          <Link size={16} />
          <span>Links</span>
        </button>
        <button
          className={`flex items-center gap-2 flex-1 py-3 px-4 text-sm font-medium transition-colors min-w-max ${
            activeTab === "docs" 
              ? "text-violet-400 border-b-2 border-violet-400" 
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("docs")}
        >
          <FileText size={16} />
          <span>Docs</span>
        </button>
        {sharedLocations.length > 0 && (
          <button
            className={`flex items-center gap-2 flex-1 py-3 px-4 text-sm font-medium transition-colors min-w-max ${
              activeTab === "locations" 
                ? "text-violet-400 border-b-2 border-violet-400" 
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("locations")}
          >
            <MapPin size={16} />
            <span>Locations</span>
          </button>
        )}
        {isGroup && (
          <button
            className={`flex items-center gap-2 flex-1 py-3 px-4 text-sm font-medium transition-colors min-w-max ${
              activeTab === "members" 
                ? "text-violet-400 border-b-2 border-violet-400" 
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("members")}
          >
            <FiUsers size={16} />
            <span>Members</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center">
              <img
                src={currentChat.profilePic || currentChat.image || assets.avatar_icon}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-violet-500/30 mb-3"
              />
              <h3 className="text-xl font-semibold text-white mb-1">
                {isGroup ? currentChat.name : currentChat.fullName}
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                {isGroup ? `Group • ${currentChat.members?.length || 0} members` : `@${currentChat.username || 'user'}`}
              </p>
              {!isGroup && onlineUsers.includes(currentChat._id) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </span>
              )}
            </div>

            {/* Bio */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Bio</h4>
              <p className="text-white text-sm">
                {currentChat.bio || (isGroup ? "No group description" : "No bio available")}
              </p>
            </div>

            {/* Group Info */}
            {isGroup && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-2xl font-bold text-white">{currentChat.members?.length || 0}</p>
                    <p className="text-xs text-gray-400">Members</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-2xl font-bold text-white">{getMediaCount()}</p>
                    <p className="text-xs text-gray-400">Media</p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setEditGroupInfo(true)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiSettings size={16} />
                    Edit Group Info
                  </button>
                )}

                {isMember && !isAdmin && (
                  <button
                    onClick={handleLeaveGroup}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <UserX size={16} />
                    Leave Group
                  </button>
                )}
              </div>
            )}

            {/* User Actions */}
            {!isGroup && (
              <div className="space-y-2">
                {isBlocked ? (
                  <button
                    onClick={() => unblockUser(currentChat._id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Unblock User
                  </button>
                ) : (
                  <button
                    onClick={() => blockUser(currentChat._id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Block User
                  </button>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-300">{currentChat.email || "Not available"}</span>
              </div>
              {!isGroup && currentChat.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-300">{currentChat.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-300">Joined {getJoinDate()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Shared Media ({chatMedia.length})
            </h4>
            {chatMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {chatMedia.map((media, index) => (
                  <img
                    key={index}
                    src={media}
                    alt={`Shared media ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(media, '_blank')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No media shared yet</p>
              </div>
            )}
          </div>
        )}

        {/* Links Tab */}
        {activeTab === "links" && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Shared Links ({sharedLinks.length})
            </h4>
            {sharedLinks.length > 0 ? (
              <div className="space-y-3">
                {sharedLinks.map((linkObj, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <a 
                      href={linkObj.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 text-sm break-all block mb-1"
                    >
                      {linkObj.link.length > 50 ? linkObj.link.substring(0, 50) + '...' : linkObj.link}
                    </a>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Shared by {linkObj.sender}</span>
                      <span>{new Date(linkObj.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Link size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No links shared yet</p>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "docs" && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Shared Documents ({sharedDocs.length})
            </h4>
            {sharedDocs.length > 0 ? (
              <div className="space-y-3">
                {sharedDocs.map((doc, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{getFileIcon(doc.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {doc.name}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>Shared by {doc.sender}</span>
                          <span>{new Date(doc.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => downloadFile(doc.url, doc.name)}
                      className="text-gray-400 hover:text-white transition-colors p-2 ml-2"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No documents shared yet</p>
              </div>
            )}
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Shared Locations ({sharedLocations.length})
            </h4>
            <div className="space-y-3">
              {sharedLocations.map((locationObj, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={16} className="text-red-400" />
                    <p className="text-white text-sm font-medium">
                      Shared Location
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                    <span>Shared by {locationObj.sender}</span>
                    <span>{new Date(locationObj.timestamp).toLocaleString()}</span>
                  </div>
                  <a 
                    href={`https://maps.google.com/?q=${locationObj.location.lat},${locationObj.location.lng}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 text-sm inline-flex items-center gap-1"
                  >
                    <MapPin size={14} />
                    View on Google Maps
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && isGroup && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-300">
                Members ({currentChat.members?.length || 0})
              </h4>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                >
                  <UserPlus size={16} />
                  Add
                </button>
              )}
            </div>

            <div className="space-y-2">
              {currentChat.members?.map(member => (
                <div 
                  key={member._id} 
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img 
                      src={member.profilePic || assets.avatar_icon} 
                      alt={member.fullName} 
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {member.fullName}
                        {member._id === currentChat.admin && (
                          <span className="ml-2 text-yellow-400 text-xs" title="Group Admin">👑 Admin</span>
                        )}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {onlineUsers.includes(member._id) ? (
                          <span className="text-green-400">Online</span>
                        ) : (
                          'Offline'
                        )}
                      </p>
                    </div>
                  </div>

                  {isAdmin && member._id !== authUser?._id && (
                    <button 
                      onClick={() => setShowRemoveMember(member._id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove member"
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c2e] rounded-lg max-w-md w-full border border-gray-600 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Add Member to Group</h3>
            </div>
            
            <div className="p-4">
              <input
                type="text"
                placeholder="Search users..."
                value={newMemberSearch}
                onChange={(e) => setNewMemberSearch(e.target.value)}
                className="w-full p-3 bg-[#282142] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 mb-4"
              />
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredUsers.map(user => (
                  <div 
                    key={user._id} 
                    onClick={() => handleAddMember(user._id)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#333366] transition-colors"
                  >
                    <img 
                      src={user.profilePic || assets.avatar_icon} 
                      alt={user.fullName} 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{user.fullName}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                    {onlineUsers.includes(user._id) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
                    )}
                  </div>
                ))}
                
                {filteredUsers.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    {newMemberSearch ? "No users found" : "No users available to add"}
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button 
                onClick={() => {
                  setShowAddMember(false);
                  setNewMemberSearch("");
                }} 
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c2e] rounded-lg max-w-sm w-full border border-gray-600">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Remove Member</h3>
            </div>
            
            <div className="p-4">
              <p className="text-gray-300 text-sm mb-4">
                Are you sure you want to remove this member from the group?
              </p>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button 
                onClick={() => setShowRemoveMember(null)} 
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRemoveMember(showRemoveMember)} 
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Info Modal */}
      {editGroupInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c2e] rounded-lg max-w-md w-full border border-gray-600">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Edit Group Info</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-3 bg-[#282142] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                  placeholder="Enter group name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full p-3 bg-[#282142] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 resize-none"
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button 
                onClick={() => setEditGroupInfo(false)} 
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateGroupInfo} 
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Call Modal */}
      {voiceCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c2e] rounded-lg max-w-sm w-full border border-gray-600">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Voice Call</h3>
            </div>
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic size={32} className="text-green-400" />
              </div>
              <p className="text-gray-300 mb-2">Calling {currentChat.fullName}</p>
              <p className="text-gray-400 text-sm">Connecting...</p>
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button 
                onClick={() => setVoiceCallModal(false)} 
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {videoCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c2e] rounded-lg max-w-md w-full border border-gray-600">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Video Call</h3>
            </div>
            <div className="p-6 text-center">
              <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={48} className="text-blue-400" />
              </div>
              <p className="text-gray-300 mb-2">Video calling {currentChat.fullName}</p>
              <p className="text-gray-400 text-sm">Waiting for response...</p>
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button 
                onClick={() => setVideoCallModal(false)} 
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;