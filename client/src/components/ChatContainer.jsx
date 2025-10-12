import React, { useContext, useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { formatMessageDate, formatChatDate } from "../lib/utils";
import { 
  FaCheckDouble, 
  FaPaperPlane, 
  FaTrashAlt, 
  FaShare, 
  FaSmile, 
  FaMicrophone, 
  FaCopy, 
  FaEllipsisV,
  FaUsers,
  FaUserPlus,
  FaUserMinus,
  FaShieldAlt,
  FaBellSlash,
  FaReply,
  FaEdit,
  FaRegHeart
} from "react-icons/fa";
import { MdClear, MdClose, MdAttachFile } from "react-icons/md";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { IoClose, IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";

const ChatContainer = ({ onOpenProfile }) => {
  const navigate = useNavigate();
  const {
    messages,
    selectedUser,
    selectedGroup,
    sendMessage,
    sendGroupMessage,
    getMessage,
    setMessages,
    users,
    deleteMessageById,
    forwardMessagesToUser,
    isTyping,
    sendTypingStatus,
    markMessagesAsSeen,
    sendVoiceMessage,
    reactToMessage,
    removeReaction,
    reactions,
    editMessage,
    addMemberToGroup,
    removeMemberFromGroup,
    leaveGroup,
    downloadFile,
    getFileIcon,
    getFileType,
    onlineUsers,
    isGroup
  } = useContext(ChatContext);

  const { authUser, socket, api: authAxios } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [longPressMsg, setLongPressMsg] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isRecordingSupported, setIsRecordingSupported] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showReactions, setShowReactions] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const scrollEnd = useRef();
  const typingTimeout = useRef(null);
  const audioChunks = useRef([]);
  const fileInputRef = useRef(null);

  const currentChat = selectedUser || selectedGroup;

  // Check if recording is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsRecordingSupported(false);
    }
  }, []);

  // Helper: Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Scroll to bottom
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping, replyingTo, editingMessage]);

  // Load messages when chat changes
// Add this ref at the top of ChatContainer component
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;
  
  return () => {
    isMountedRef.current = false;
  };
}, []);

useEffect(() => {
  if (!currentChat?._id) return;
  
  let isSubscribed = true;
  
  const loadMessages = async () => {
    try {
      await getMessage(currentChat._id);
    } catch (error) {
      if (isSubscribed && isMountedRef.current) {
        console.error("Failed to load messages:", error);
      }
    }
  };
  
  loadMessages();
  
  // Cleanup function
  return () => {
    isSubscribed = false;
  };
}, [currentChat?._id]); // Remove getMessage from dependencies

  // Mark messages as seen when user is active
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      const hasUnseenMessages = messages.some(msg => {
        const isFromOtherUser = msg.senderId?._id !== authUser?._id && msg.senderId !== authUser?._id;
        const isUnseen = !msg.seen && !msg.seenBy?.includes(authUser?._id);
        return isFromOtherUser && isUnseen;
      });
      
      if (hasUnseenMessages) {
        const timer = setTimeout(() => {
          markMessagesAsSeen(currentChat._id);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [messages, currentChat, authUser, markMessagesAsSeen]);

  // Typing listener
  useEffect(() => {
    if (!socket || !currentChat) return;
    
    const handleTyping = ({ senderId, isTyping, receiverId }) => {
      if (currentChat._id === senderId || receiverId === currentChat._id) {
        setPartnerTyping(isTyping);
      }
    };

    const handleGroupTyping = ({ userId, isTyping, groupId }) => {
      if (currentChat._id === groupId && userId !== authUser?._id) {
        setPartnerTyping(isTyping);
      }
    };
    
    socket.on("typing", handleTyping);
    socket.on("groupTyping", handleGroupTyping);
    
    return () => {
      socket.off("typing", handleTyping);
      socket.off("groupTyping", handleGroupTyping);
    };
  }, [socket, currentChat, authUser]);

  // Message seen listener
  useEffect(() => {
    if (!socket) return;
    
    const handleMessageSeen = ({ messageId, seenBy }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { 
          ...msg, 
          seen: true, 
          seenBy: [...(msg.seenBy || []), ...seenBy],
          status: "seen" 
        } : msg
      ));
    };
    
    socket.on("messageSeen", handleMessageSeen);
    return () => socket.off("messageSeen", handleMessageSeen);
  }, [socket, setMessages]);

  // Voice recording with proper cleanup
  useEffect(() => {
    let currentStream = null;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          } 
        });
        currentStream = stream;
        
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        audioChunks.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunks.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            
            if (audioBlob.size === 0) {
              toast.error("No audio recorded");
              return;
            }

            if (currentChat) {
              await sendVoiceMessage(audioBlob, currentChat._id, isGroup ? 'Group' : 'User');
            }
            
          } catch (error) {
            console.error("Voice message processing error:", error);
            toast.error("Failed to process voice message");
          } finally {
            if (currentStream) {
              currentStream.getTracks().forEach(track => track.stop());
            }
          }
        };

        recorder.start(1000);
        setMediaRecorder(recorder);
        
      } catch (err) {
        console.error("Microphone access denied:", err);
        toast.error("Microphone access is required for voice messages");
        setRecording(false);
        setIsRecordingSupported(false);
      }
    };

    if (recording) {
      startRecording();
    } else if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [recording, currentChat, isGroup, sendVoiceMessage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.emoji-picker-react') || 
          e.target.closest('.reaction-picker') ||
          e.target.closest('.dropdown-container')) {
        return;
      }
      
      setDropdownOpen(false);
      setForwardOpen(false);
      setAddMemberOpen(false);
      setRemoveMemberOpen(false);
      setShowEmoji(false);
      setLongPressMsg(null);
      setShowReactions(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Typing input
  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!currentChat || !socket) return;

    sendTypingStatus(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTypingStatus(false), 1200);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !mediaFiles.length) return;
    if (!currentChat) {
      toast.error("Please select a chat first");
      return;
    }

    try {
      let mediaUrls = [];
      
      // Upload media files if any
      if (mediaFiles.length > 0) {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login again");
          navigate('/login');
          return;
        }

        // Validate file sizes
        const maxSize = 10 * 1024 * 1024; // 10MB
        for (const file of mediaFiles) {
          if (file.size > maxSize) {
            toast.error(`File ${file.name} is too large (max 10MB)`);
            return;
          }
        }

        const uploadPromises = Array.from(mediaFiles).map(async (file, index) => {
          try {
            const base64 = await convertToBase64(file);
            const uploadRes = await authAxios.post('/api/upload', { 
              file: base64,
              resourceType: getFileType(file.name)
            }, {
              headers: { Authorization: `Bearer ${token}` },
              onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(prev => ({ ...prev, [index]: progress }));
              }
            });
            return uploadRes.data.url;
          } catch (uploadErr) {
            console.error("Upload error:", uploadErr);
            throw new Error(`Failed to upload ${file.name}`);
          }
        });
        
        mediaUrls = await Promise.all(uploadPromises);
        setUploadProgress({});
      }

      const messageData = {
        text: input.trim(),
        mediaUrls,
        fileType: mediaFiles.length > 0 ? getFileType(mediaFiles[0].name) : 'text',
        replyTo: replyingTo?._id
      };

      if (editingMessage) {
        await editMessage(editingMessage._id, input.trim());
        setEditingMessage(null);
      } else if (isGroup) {
        await sendGroupMessage(messageData);
      } else {
        await sendMessage(messageData);
      }

      setInput("");
      setMediaFiles([]);
      setShowEmoji(false);
      setReplyingTo(null);
      setEditingMessage(null);
      sendTypingStatus(false);
      
    } catch (err) {
      console.error("Send failed:", err);
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  // Voice record toggle
  const toggleVoiceRecord = () => {
    if (!currentChat) {
      toast.error("Please select a chat first");
      return;
    }
    
    if (!isRecordingSupported) {
      toast.error("Voice recording is not supported in your browser");
      return;
    }
    
    setRecording(prev => !prev);
  };

  // Long press for message actions
  const handleMouseDown = (msg) => {
    const timer = setTimeout(() => {
      setLongPressMsg(msg);
      setSelectedMsgs([]);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Select / unselect messages
  const toggleSelect = (msgId, e) => {
    if (e) e.stopPropagation();
    if (longPressMsg) return;
    
    setSelectedMsgs(prev =>
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  // Delete selected
  const deleteSelected = async () => {
    if (!selectedMsgs.length) {
      toast.error("No messages selected");
      return;
    }
    
    try {
      await Promise.all(selectedMsgs.map(deleteMessageById));
      setSelectedMsgs([]);
      setDropdownOpen(false);
      toast.success("Messages deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete messages");
    }
  };

  // Clear chat
  const clearChat = async () => {
    if (!currentChat) return;
    
    if (window.confirm("Are you sure you want to clear this chat? This action cannot be undone.")) {
      try {
        setMessages([]);
        setSelectedMsgs([]);
        setDropdownOpen(false);
        toast.success("Chat cleared");
      } catch (error) {
        console.error("Clear chat error:", error);
        toast.error("Failed to clear chat");
      }
    }
  };

  // Forward selected
  const forwardSelected = async (forwardToUser) => {
    if (!selectedMsgs.length || !forwardToUser) {
      toast.error("No messages or user selected");
      return;
    }
    
    try {
      const msgsToForward = messages.filter(m => selectedMsgs.includes(m._id));
      await forwardMessagesToUser(msgsToForward, [forwardToUser._id]);
      setSelectedMsgs([]);
      setForwardOpen(false);
      toast.success("Messages forwarded");
    } catch (error) {
      console.error("Forward error:", error);
      toast.error("Failed to forward messages");
    }
  };

  // Add member to group
  const handleAddMember = async (memberId) => {
    if (!selectedGroup?._id || !memberId) {
      toast.error("Please select a user to add");
      return;
    }
    
    try {
      await addMemberToGroup(selectedGroup._id, [memberId]);
      setAddMemberOpen(false);
    } catch (error) {
      console.error("Add member error:", error);
    }
  };

  // Remove member from group
  const handleRemoveMember = async (memberId) => {
    if (!selectedGroup?._id || !memberId) {
      toast.error("Please select a member to remove");
      return;
    }
    
    try {
      await removeMemberFromGroup(selectedGroup._id, memberId);
      setRemoveMemberOpen(false);
    } catch (error) {
      console.error("Remove member error:", error);
    }
  };

  // Leave group
  const handleLeaveGroup = async () => {
    if (!selectedGroup?._id) return;
    
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(selectedGroup._id);
        setDropdownOpen(false);
        toast.success("You have left the group");
      } catch (error) {
        console.error("Leave group error:", error);
        toast.error("Failed to leave group");
      }
    }
  };

  // Handle long press actions
  const handleLongPressAction = (action, emoji = null) => {
    if (!longPressMsg) return;

    switch (action) {
      case 'react':
        if (emoji) {
          reactToMessage(longPressMsg._id, emoji);
          toast.success(`Reacted with ${emoji}`);
        } else {
          setShowReactions(longPressMsg._id);
        }
        break;
      case 'forward':
        forwardMessagesToUser([longPressMsg], [currentChat._id]);
        break;
      case 'copy':
        if (longPressMsg.text) {
          navigator.clipboard.writeText(longPressMsg.text);
          toast.success("Message copied to clipboard");
        } else {
          toast.error("No text to copy");
        }
        break;
      case 'reply':
        setReplyingTo(longPressMsg);
        break;
      case 'edit':
        if (longPressMsg.senderId?._id === authUser?._id || longPressMsg.senderId === authUser?._id) {
          setEditingMessage(longPressMsg);
          setInput(longPressMsg.text || '');
        } else {
          toast.error("You can only edit your own messages");
        }
        break;
      case 'delete':
        deleteMessageById(longPressMsg._id);
        break;
    }
    
    setLongPressMsg(null);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    
    setMediaFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick reactions
  const quickReactions = ['❤️', '😂', '😮', '😢', '😠'];

  if (!currentChat) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} className="max-w-16" alt="" />
        <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  let lastMessageDate = null;

  // Use useMemo instead of useEffect
// ✅ FIXED VERSION - Debounced and optimized
useEffect(() => {
  if (messages.length === 0 || !selectedUser) return;

  // Debounce the extraction to prevent too many re-renders
  const timeoutId = setTimeout(() => {
    extractChatContent(messages);
  }, 500); // Wait 500ms after messages change

  return () => clearTimeout(timeoutId);
}, [messages.length, selectedUser?._id]); // Only depend on length and ID, not the entire messages array// Only depend on length and ID

  return (
    <div className="h-full relative flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 bg-[#1c1c2e]">
        <button onClick={() => navigate(-1)} className="text-white md:hidden">
          <FiArrowLeft size={20} />
        </button>
        <img
          src={currentChat.profilePic || currentChat.image || assets.avatar_icon}
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer object-cover"
          onClick={onOpenProfile}
        />
        <div className="flex flex-col flex-1 cursor-pointer" onClick={onOpenProfile}>
          <p className="text-lg text-white flex items-center gap-2 truncate">
            {isGroup ? currentChat.name : currentChat.fullName}
            {!isGroup && onlineUsers.includes(currentChat._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500" title="Online"></span>
            )}
          </p>
          {isGroup && (
            <span className="text-xs text-gray-400">{currentChat.members?.length || 0} members</span>
          )}
          {partnerTyping && <p className="text-xs text-gray-400 italic">typing...</p>}
        </div>

        <div className="relative dropdown-container">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }} 
            className="text-white px-2 py-1 hover:bg-[#333366] rounded"
          >
            <FaEllipsisV size={20} />
          </button>
          {dropdownOpen && (
            <div 
              className="absolute right-0 top-full bg-[#22223b] shadow-lg rounded-md flex flex-col z-40 min-w-48 animate-slide-down border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMsgs.length > 0 && (
                <>
                  <button onClick={deleteSelected} className="flex items-center gap-2 text-red-400 px-4 py-2 hover:bg-[#333366] rounded-t-md">
                    <FaTrashAlt /> Delete Selected
                  </button>
                  <button onClick={() => setForwardOpen(true)} className="flex items-center gap-2 text-blue-400 px-4 py-2 hover:bg-[#333366]">
                    <FaShare /> Forward Selected
                  </button>
                </>
              )}
              
              <button onClick={clearChat} className="flex items-center gap-2 text-yellow-400 px-4 py-2 hover:bg-[#333366]">
                <MdClear /> Clear Chat
              </button>

              {isGroup && (
                <>
                  <button 
                    onClick={() => setShowMembers(!showMembers)} 
                    className="flex items-center gap-2 text-green-400 px-4 py-2 hover:bg-[#333366]"
                  >
                    <FaUsers /> {showMembers ? 'Hide Members' : 'Show Members'}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddMemberOpen(true);
                      setDropdownOpen(false);
                    }} 
                    className="flex items-center gap-2 text-green-400 px-4 py-2 hover:bg-[#333366]"
                  >
                    <FaUserPlus /> Add Member
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setRemoveMemberOpen(true);
                      setDropdownOpen(false);
                    }} 
                    className="flex items-center gap-2 text-red-400 px-4 py-2 hover:bg-[#333366]"
                  >
                    <FaUserMinus /> Remove Member
                  </button>
                  {currentChat.admin === authUser?._id && (
                    <button className="flex items-center gap-2 text-blue-400 px-4 py-2 hover:bg-[#333366]">
                      <FaShieldAlt /> Admin Settings
                    </button>
                  )}
                  <button className="flex items-center gap-2 text-gray-400 px-4 py-2 hover:bg-[#333366]">
                    <FaBellSlash /> Mute Notifications
                  </button>
                  <button 
                    onClick={handleLeaveGroup}
                    className="flex items-center gap-2 text-red-400 px-4 py-2 hover:bg-[#333366] rounded-b-md"
                  >
                    Leave Group
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Forward Selection Modal */}
      {forwardOpen && (
        <div 
          className="absolute top-16 right-4 bg-[#22223b] shadow-lg rounded-md p-4 max-h-60 overflow-y-auto z-50 min-w-64 border border-gray-700 dropdown-container"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-white mb-3 font-medium">Forward to:</h4>
          {users
            .filter(u => u._id !== authUser?._id && u._id !== currentChat._id)
            .map(user => (
              <div 
                key={user._id} 
                onClick={() => forwardSelected(user)} 
                className="flex items-center gap-3 p-2 hover:bg-[#333366] cursor-pointer rounded text-white"
              >
                <img src={user.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full" />
                <span>{user.fullName}</span>
              </div>
            ))
          }
          <button 
            onClick={() => setForwardOpen(false)} 
            className="w-full mt-3 text-gray-400 text-sm hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberOpen && (
        <div 
          className="absolute top-16 right-4 bg-[#22223b] shadow-lg rounded-md p-4 max-h-60 overflow-y-auto z-50 min-w-64 border border-gray-700 dropdown-container"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-white mb-3 font-medium">Add Member:</h4>
          {users
            .filter(user => 
              user._id !== authUser?._id && 
              !currentChat.members?.some(member => member._id === user._id)
            )
            .map(user => (
              <div 
                key={user._id} 
                onClick={() => handleAddMember(user._id)}
                className="flex items-center gap-3 p-2 hover:bg-[#333366] cursor-pointer rounded text-white"
              >
                <img src={user.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full" />
                <span>{user.fullName}</span>
              </div>
            ))
          }
          <button 
            onClick={() => setAddMemberOpen(false)} 
            className="w-full mt-3 text-gray-400 text-sm hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Remove Member Modal */}
      {removeMemberOpen && (
        <div 
          className="absolute top-16 right-4 bg-[#22223b] shadow-lg rounded-md p-4 max-h-60 overflow-y-auto z-50 min-w-64 border border-gray-700 dropdown-container"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-white mb-3 font-medium">Remove Member:</h4>
          {currentChat.members
            ?.filter(member => member._id !== currentChat.admin && member._id !== authUser?._id)
            .map(member => (
              <div 
                key={member._id} 
                onClick={() => handleRemoveMember(member._id)}
                className="flex items-center gap-3 p-2 hover:bg-[#333366] cursor-pointer rounded text-white"
              >
                <img src={member.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full" />
                <span>{member.fullName}</span>
              </div>
            ))
          }
          <button 
            onClick={() => setRemoveMemberOpen(false)} 
            className="w-full mt-3 text-gray-400 text-sm hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#14142b]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <img src={assets.logo_icon} className="max-w-20 opacity-50 mb-4" alt="" />
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start a conversation by sending a message!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderIdStr = msg.senderId?._id ? msg.senderId._id.toString() : msg.senderId?.toString() || '';
            const isSender = senderIdStr === authUser?._id?.toString();
            const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : new Date().toDateString();
            const showDateLabel = lastMessageDate !== msgDate;
            if (showDateLabel) lastMessageDate = msgDate;
            const isSelected = selectedMsgs.includes(msg._id);
            const msgReactions = reactions[msg._id] || [];

            return (
              <React.Fragment key={msg._id || index}>
                {showDateLabel && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-[#282142]/40">
                      {formatChatDate(msg.createdAt)}
                    </span>
                  </div>
                )}
                
                {/* Reply Context */}
                {msg.replyTo && (
                  <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div className="text-xs text-gray-400 bg-[#282142]/30 px-3 py-1 rounded-lg max-w-[70%]">
                      Replying to: {msg.replyTo.text || 'a message'}
                    </div>
                  </div>
                )}

                <div 
                  className={`flex flex-col mb-3 ${isSender ? "items-end" : "items-start"} ${isSelected ? "bg-[#5555aa]/30 rounded-lg p-2" : ""}`} 
                  onClick={(e) => toggleSelect(msg._id, e)}
                  onMouseDown={() => handleMouseDown(msg)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={() => handleMouseDown(msg)}
                  onTouchEnd={handleMouseUp}
                >
                  {/* Sender name for group messages */}
                  {isGroup && !isSender && msg.senderId?.fullName && (
                    <span className="text-xs text-gray-400 mb-1 ml-2">{msg.senderId.fullName}</span>
                  )}

                  {/* Render Media */}
                  {msg.media?.map((file, i) => {
                    if (typeof file !== 'string') return null;
                    const fileType = getFileType(file);
                    
                    return (
                      <div key={i} className="relative my-1">
                        {fileType === 'image' ? (
                          <img 
                            src={file} 
                            className="max-w-[280px] rounded-lg border border-gray-700 cursor-pointer" 
                            alt="Shared media" 
                            onClick={() => window.open(file, '_blank')}
                          />
                        ) : fileType === 'video' ? (
                          <video 
                            src={file} 
                            controls 
                            className="max-w-[280px] rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : fileType === 'audio' ? (
                          <audio 
                            src={file} 
                            controls 
                            className="w-full max-w-xs"
                          >
                            Your browser does not support the audio element.
                          </audio>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-[#282142]/50 rounded-lg">
                            <span className="text-2xl">{getFileIcon(file)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">
                                {file.split("/").pop() || 'Download file'}
                              </p>
                              <button 
                                onClick={() => downloadFile(file, file.split("/").pop())}
                                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-1"
                              >
                                <FiDownload size={12} />
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Render Text */}
                  {msg.text && (
                    <div className="relative max-w-[70%]">
                      <p className={`p-3 break-words text-white rounded-2xl ${isSender ? "bg-violet-600 rounded-br-md" : "bg-[#282142] rounded-bl-md"} ${msg.isEdited ? 'italic' : ''}`}>
                        {msg.text}
                        {msg.isEdited && (
                          <span className="text-xs text-gray-300 ml-2">(edited)</span>
                        )}
                      </p>
                      
                      {/* Reactions */}
                      {msgReactions.length > 0 && (
                        <div className={`flex gap-1 mt-1 ${isSender ? "justify-end" : "justify-start"}`}>
                          {msgReactions.map((r, i) => (
                            <span 
                              key={i} 
                              className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                                r.userId === authUser?._id ? 'bg-violet-600' : 'bg-gray-600'
                              }`}
                              onClick={() => {
                                if (r.userId === authUser?._id) {
                                  removeReaction(msg._id);
                                }
                              }}
                            >
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Status and Time */}
                  <div className={`flex items-center gap-2 text-xs text-gray-400 mt-1 ${isSender ? "justify-end" : "justify-start"}`}>
                    {isSender && (
                      <>
                        {msg.status === "sending" && <span className="text-yellow-400">⏳</span>}
                        {msg.status === "failed" && <span className="text-red-400">❌</span>}
                        <FaCheckDouble 
                          className={msg.seen ? "text-blue-400" : msg.status === "delivered" ? "text-gray-400" : "text-gray-600"} 
                          size={12}
                        />
                      </>
                    )}
                    <span>{formatMessageDate(msg.createdAt)}</span>
                  </div>
                </div>

                {/* Reaction Picker */}
                {showReactions === msg._id && (
                  <div 
                    className={`flex gap-2 p-2 bg-[#22223b] rounded-lg shadow-lg absolute z-50 reaction-picker ${
                      isSender ? 'right-4' : 'left-4'
                    }`}
                    style={{ marginTop: '-40px' }}
                  >
                    {quickReactions.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          reactToMessage(msg._id, emoji);
                          setShowReactions(null);
                        }}
                        className="text-xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Group Members List */}
      {isGroup && showMembers && (
        <div className="absolute bottom-20 left-0 right-0 bg-[#1c1c2e] p-4 rounded-t-lg border-t border-gray-700 shadow-lg z-30">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-white">
              Group Members ({currentChat.members?.length || 0})
            </h4>
            <button 
              onClick={() => setShowMembers(false)} 
              className="text-gray-400 hover:text-white"
            >
              <IoClose size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {currentChat.members?.map(member => (
              <div 
                key={member._id} 
                className="flex items-center gap-2 bg-[#282142]/50 p-2 rounded-lg min-w-0 flex-1 max-w-[48%]"
              >
                <img 
                  src={member.profilePic || assets.avatar_icon} 
                  alt="" 
                  className="w-6 h-6 rounded-full flex-shrink-0" 
                />
                <span className="text-xs text-white truncate">
                  {member.fullName}
                  {member._id === currentChat.admin && " 👑"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Long Press Options */}
      {longPressMsg && (
        <div 
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-[#22223b] rounded-lg p-3 z-50 shadow-xl border border-gray-700 dropdown-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 mb-2">
            <button 
              onClick={() => handleLongPressAction('react')} 
              className="flex flex-col items-center text-sm text-red-400 hover:text-red-300"
            >
              <FaRegHeart size={16} />
              <span>React</span>
            </button>
            <button 
              onClick={() => handleLongPressAction('reply')} 
              className="flex flex-col items-center text-sm text-blue-400 hover:text-blue-300"
            >
              <FaReply size={16} />
              <span>Reply</span>
            </button>
            <button 
              onClick={() => handleLongPressAction('forward')} 
              className="flex flex-col items-center text-sm text-green-400 hover:text-green-300"
            >
              <FaShare size={16} />
              <span>Forward</span>
            </button>
          </div>
          <div className="flex gap-3 border-t border-gray-600 pt-2">
            {(longPressMsg.senderId?._id === authUser?._id || longPressMsg.senderId === authUser?._id) && (
              <button 
                onClick={() => handleLongPressAction('edit')} 
                className="flex flex-col items-center text-sm text-yellow-400 hover:text-yellow-300"
              >
                <FaEdit size={16} />
                <span>Edit</span>
              </button>
            )}
            <button 
              onClick={() => handleLongPressAction('copy')} 
              className="flex flex-col items-center text-sm text-purple-400 hover:text-purple-300"
            >
              <FaCopy size={16} />
              <span>Copy</span>
            </button>
            <button 
              onClick={() => handleLongPressAction('delete')} 
              className="flex flex-col items-center text-sm text-red-400 hover:text-red-300"
            >
              <FaTrashAlt size={16} />
              <span>Delete</span>
            </button>
          </div>
          <button 
            onClick={() => setLongPressMsg(null)} 
            className="w-full mt-2 text-sm text-gray-400 hover:text-white pt-2 border-t border-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Reply/Edit Preview */}
      {(replyingTo || editingMessage) && (
        <div className="bg-[#282142] border-l-4 border-violet-500 p-3 mx-4 mt-2 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-violet-400 font-medium">
              {editingMessage ? 'Editing message' : 'Replying to'}
            </span>
            <button 
              onClick={() => {
                setReplyingTo(null);
                setEditingMessage(null);
                if (editingMessage) setInput('');
              }}
              className="text-gray-400 hover:text-white"
            >
              <MdClose size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-300 truncate">
            {replyingTo?.text || editingMessage?.text}
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#1c1c2e] border-t border-gray-700 p-4">
        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {Array.from(mediaFiles).map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image') ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-[#282142] flex items-center justify-center">
                    <span className="text-xs text-white truncate px-1">
                      {file.name}
                    </span>
                  </div>
                )}
                {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                  <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                    <div className="text-xs text-white">{uploadProgress[index]}%</div>
                  </div>
                )}
                <button 
                  onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== index))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowEmoji(!showEmoji);
            }} 
            className="text-xl text-gray-400 hover:text-white transition-colors"
          >
            <FaSmile />
          </button>
          
          {showEmoji && (
            <div className="absolute bottom-16 left-4 z-50">
              <EmojiPicker 
                onEmojiClick={(emojiObj) => setInput(prev => prev + emojiObj.emoji)}
                width={300}
                height={400}
                className="emoji-picker-react"
              />
            </div>
          )}

          <input
            type="text"
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            value={input}
            onChange={handleTyping}
            className="flex-1 text-sm p-3 border border-gray-600 rounded-lg outline-none text-white placeholder-gray-400 bg-[#282142] focus:border-violet-500 transition-colors"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="mediaUpload"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          />
          <label 
            htmlFor="mediaUpload" 
            className="cursor-pointer text-gray-400 hover:text-white text-xl transition-colors"
            title="Attach files"
          >
            <MdAttachFile size={20} />
          </label>

          {isRecordingSupported && (
            <button 
              type="button"
              onClick={toggleVoiceRecord} 
              className={`text-xl transition-colors ${recording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
              title={recording ? "Stop recording" : "Voice message"}
            >
              <FaMicrophone />
            </button>
          )}

          <button 
            type="submit"
            disabled={!input.trim() && !mediaFiles.length}
            className={`p-3 rounded-full transition-colors ${
              !input.trim() && !mediaFiles.length 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            {editingMessage ? <FaEdit size={16} /> : <IoSend size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;