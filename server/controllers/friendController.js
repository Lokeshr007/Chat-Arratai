import User from "../models/User.js";

// Get friends and incoming friend requests
export const getFriendsAndRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "-password")
      .populate("friendRequests", "-password");

    res.json({
      success: true,
      friends: user.friends,
      friendRequests: user.friendRequests,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    // Prevent sending request to self or existing friend
    if (targetUser._id.equals(req.user._id) || targetUser.friends.includes(req.user._id))
      return res.status(400).json({ success: false, message: "Cannot send request" });

    // Prevent duplicate requests
    if (targetUser.friendRequests.includes(req.user._id))
      return res.status(400).json({ success: false, message: "Request already sent" });

    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();

    res.json({ success: true, message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Accept or reject friend request
export const respondFriendRequest = async (req, res) => {
  const { userId, accept } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const requester = await User.findById(userId);

    if (!user.friendRequests.includes(requester._id))
      return res.status(400).json({ success: false, message: "No such friend request" });

    // Remove request
    user.friendRequests = user.friendRequests.filter(id => !id.equals(requester._id));

    if (accept) {
      // Add each other as friends
      user.friends.push(requester._id);
      requester.friends.push(user._id);
      await requester.save();
    }

    await user.save();

    res.json({ success: true, message: accept ? "Friend request accepted" : "Rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.blockedUsers.includes(req.params.userId)) {
      user.blockedUsers.push(req.params.userId);
      await user.save();
    }
    res.json({ success: true, message: "User blocked" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.blockedUsers = user.blockedUsers.filter(id => !id.equals(req.params.userId));
    await user.save();
    res.json({ success: true, message: "User unblocked" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
