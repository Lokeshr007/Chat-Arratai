import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverType', required: true },
    receiverType: { type: String, enum: ['User', 'Group'], required: true },
    callType: { type: String, enum: ['audio', 'video'], required: true },
    status: { 
        type: String, 
        enum: ['initiated', 'ringing', 'answered', 'rejected', 'missed', 'ended'],
        default: 'initiated'
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds
}, { timestamps: true });

callSchema.index({ callerId: 1, receiverId: 1 });
callSchema.index({ createdAt: -1 });

export default mongoose.model("Call", callSchema);