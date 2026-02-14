import bcrypt from "bcrypt";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import handlebars from "handlebars";

import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import { io } from "../lib/socket.js";
import sendMail from "../lib/email.js";
import { getFileMeta } from "../lib/pathUtils.js";
import EmailLog from "../models/emaillog.model.js";

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Fields can't be empty!" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be atleast 6 characters!" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        photoUrl: newUser.photoUrl,
        friendsList: newUser.friendsList,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({ error: "User doesn't exist" });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (!isSamePassword) {
      return res.status(403).json({ error: "Passwords don't match" });
    }

    generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
      photoUrl: user.photoUrl,
      friendsList: user.friendsList,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, username } = req.body;

    if (!profilePic && !username) {
      return res.status(400).json({ error: "Fields can't be empty" });
    }

    let updateFields = {};

    if (profilePic) {
      const existingPhoto = req.user.photoUrl;

      if (existingPhoto && existingPhoto !== "") {
        const filename = existingPhoto.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(filename);
      }

      const uploadedImage = await cloudinary.uploader.upload(profilePic);
      updateFields.photoUrl = uploadedImage.secure_url;
    }

    if (username) {
      updateFields.username = username;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true },
    );

    io.emit("updateUser", updatedUser);

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User doesn't exist" });

    const emails = await EmailLog.find({ senderId: user._id });

    if (emails.length === 5) {
      const lastEmail = emails[emails.length - 1];
      let fiveMinutesLater = new Date(lastEmail.sentAt.getTime() + 3 * 60000);

      if (new Date() < fiveMinutesLater) {
        return res
          .status(400)
          .json({ error: "Maximum 5 emails for a time. Try again later" });
      } else {
        await EmailLog.deleteMany({ senderId: user._id });
      }
    }

    if (emails.length !== 0) {
      const lastEmail = emails[emails.length - 1];

      let oneMinuteLater = new Date(lastEmail.sentAt.getTime() + 1 * 60000);
      if (new Date() < oneMinuteLater)
        return res.status(400).json({ error: "Wait 1 minute before sending another" });
    }

    const token = user.generateResetHash();
    await user.save();

    const link = `${req.protocol}://${
      process.env.FRONTEND_LINK ? process.env.FRONTEND_LINK : "localhost:5173"
    }/reset-password?id=${token}`;

    const { __dirname } = getFileMeta(import.meta.url);

    const source = fs.readFileSync(
      path.join(__dirname, "../../src", "emails", "reset.hbs"),
      "utf-8",
    );
    const template = handlebars.compile(source);
    const htmlToSend = template({ link });

    await sendMail({
      html: htmlToSend,
      subject: "Password Reset",
      text: "",
      to: email,
    });

    const log = new EmailLog({
      senderId: user._id,
      sentAt: new Date(),
    });
    await log.save();

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Field can't be empty" });

    const queryId = req.query.id;
    if (!queryId) return res.status(400).json({ error: "No query param provided" });
    const hashedQueryId = crypto.createHash("sha256").update(queryId).digest("hex");

    const user = await User.findOne({ resetToken: hashedQueryId });
    if (!user) return res.status(400).json({ error: "User doesn't exist" });

    if (new Date() > user.resetTokenExpiresAt) {
      await user.updateOne({ resetToken: null, resetTokenExpiresAt: null });
      return res.status(400).json({ error: "Expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await user.updateOne({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    });

    res.status(200).json({ message: hashedQueryId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      return res.status(400).json({ error: "You aren't authenthificated" });
    }

    res.cookie("jwt", null, { maxAge: 0 });
    res.status(201).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
