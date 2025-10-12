// components/FriendList.jsx
import React from 'react';
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

const FriendList = () => {
  const { friends, removeFriend, setSelectedUser } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-4">Friends ({friends.length})</h3>
      
      <div className="space-y-2">
        {friends.map(friend => (
          <div
            key={friend._id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
            onClick={() => setSelectedUser(friend)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={friend.profilePic || '/default-avatar.png'}
                  alt={friend.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {onlineUsers.includes(friend._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              
              <div>
                <p className="text-white font-medium">{friend.fullName}</p>
                <p className="text-gray-400 text-sm">@{friend.username}</p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Remove ${friend.fullName} from friends?`)) {
                  removeFriend(friend._id);
                }
              }}
              className="text-red-400 hover:text-red-300 p-2"
              title="Remove friend"
            >
              ✕
            </button>
          </div>
        ))}
        
        {friends.length === 0 && (
          <p className="text-gray-400 text-center py-4">No friends yet</p>
        )}
      </div>
    </div>
  );
};

export default FriendList;