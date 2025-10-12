import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    description: { type: String, default: "" }, // 🆕 Added description
  },
  { timestamps: true }
);

// Indexes for better performance
groupSchema.index({ admin: 1 });
groupSchema.index({ members: 1 });
groupSchema.index({ name: 'text' }); // Text search

export default mongoose.model("Group", groupSchema);