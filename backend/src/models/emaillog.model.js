import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  sentAt: { type: Date, expires: 300 },
});

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
