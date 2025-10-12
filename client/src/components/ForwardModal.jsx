import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";
import { FiX, FiSend, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ForwardModal = ({ selectedMsgs, onClose }) => {
  const { users, getUsers, forwardMessagesToUser, groups } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [searchInput, setSearchInput] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users
    .filter((u) => u._id !== authUser._id)
    .filter((u) =>
      u.fullName.toLowerCase().includes(searchInput.toLowerCase())
    );

  const toggleRecipient = (userId) => {
    setSelectedRecipients((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleForward = async () => {
    if (selectedRecipients.length === 0) return;
    await forwardMessagesToUser(selectedMsgs, selectedRecipients);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center"
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          className="bg-[#0f0f1a]/90 backdrop-blur-xl w-[400px] max-w-full rounded-xl p-4 flex flex-col gap-3 relative"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Forward Messages</h3>
            <FiX
              className="text-gray-400 cursor-pointer hover:text-white"
              onClick={onClose}
            />
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#1b1b3a] rounded-full px-3 py-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search friends or groups..."
              className="bg-transparent outline-none text-white placeholder-gray-400 flex-1 text-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleRecipient(user._id)}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-[#282142]/50 ${
                    selectedRecipients.includes(user._id)
                      ? "bg-purple-500/30"
                      : ""
                  }`}
                >
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 text-white text-sm">
                    {user.fullName}
                  </div>
                  {onlineUsers.includes(user._id) && (
                    <span className="text-green-400 text-xs">Online</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center mt-3 text-sm">
                No users found
              </p>
            )}
          </div>

          {/* Selected recipients */}
          {selectedRecipients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedRecipients.map((id) => {
                const user = users.find((u) => u._id === id);
                return (
                  <span
                    key={id}
                    className="bg-purple-500/30 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {user?.fullName}
                    <FiX
                      onClick={() => toggleRecipient(id)}
                      className="cursor-pointer"
                    />
                  </span>
                );
              })}
            </div>
          )}

          {/* Forward Button */}
          <button
            onClick={handleForward}
            disabled={selectedRecipients.length === 0}
            className="mt-3 w-full bg-gradient-to-r from-purple-400 to-violet-600 py-2 rounded-full text-white disabled:opacity-50"
          >
            <FiSend className="inline mr-2" /> Forward
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForwardModal;
