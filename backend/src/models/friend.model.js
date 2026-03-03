import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true, ref: "User" },
    receiverId: { type: String, required: true, ref: "User" },
  },
  { timestamps: true },
);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
