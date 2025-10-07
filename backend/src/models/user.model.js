import mongoose, { Schema } from "mongoose";
import crypto from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    photoUrl: { type: String, default: "" },
    friendsList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    resetToken: { type: String },
    resetTokenExpiresAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.generateResetHash = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetTokenExpiresAt = Date.now() + 5 * 60 * 1000;

  return rawToken;
};

const User = mongoose.model("User", userSchema);

export default User;
