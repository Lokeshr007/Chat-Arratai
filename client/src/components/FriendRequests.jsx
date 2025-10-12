// components/FriendRequests.jsx
import React from 'react';
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const FriendRequests = () => {
  const { friendRequests, acceptFriendRequest, rejectFriendRequest } = useContext(ChatContext);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        Friend Requests ({friendRequests.length})
      </h3>
      
      <div className="space-y-3">
        {friendRequests.map(request => (
          <div key={request._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={request.profilePic || '/default-avatar.png'}
                alt={request.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-white font-medium">{request.fullName}</p>
                <p className="text-gray-400 text-sm">@{request.username}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => acceptFriendRequest(request._id)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => rejectFriendRequest(request._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        
        {friendRequests.length === 0 && (
          <p className="text-gray-400 text-center py-4">No pending requests</p>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;