import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String },
    attachments: { type: String, default: "" },
    repliedMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    is_seen: { type: Boolean, default: false, required: true },
    is_edited: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
