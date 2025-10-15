import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverType', required: true },
    receiverType: { type: String, enum: ['User', 'Group'], required: true },
    text: { type: String },
    media: [{ type: String }],
    fileType: { 
        type: String, 
        enum: ['text', 'image', 'video', 'audio', 'document', 'emoji', 'other'], // ✅ ADD 'text'
        default: 'text' // ✅ ADD default value
    },
    emojis: [{ type: String }],
    seen: { type: Boolean, default: false },
    seenBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        seenAt: { type: Date, default: Date.now }
    }],
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true },
        reactedAt: { type: Date, default: Date.now }
    }],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
     deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

// 🆕 Indexes for faster queries
messageSchema.index({ senderId: 1, receiverId: 1, receiverType: 1 });
messageSchema.index({ receiverId: 1, receiverType: 1, seen: 1 });
messageSchema.index({ receiverId: 1, receiverType: 1, createdAt: -1 }); // For pagination
messageSchema.index({ "reactions.userId": 1 });
messageSchema.index({ createdAt: -1 }); // General performance

export default mongoose.model("Message", messageSchema);