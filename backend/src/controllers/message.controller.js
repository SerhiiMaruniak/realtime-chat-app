import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketIds, io } from "../lib/socket.js";

export const getUsers = async (req, res) => {
  try {
    const response = await User.find();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments } = req.body;

    let attachmentUrl = "";

    if (attachments) {
      const uploadedImage = await cloudinary.uploader.upload(attachments);
      attachmentUrl = uploadedImage.secure_url;
    }

    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      content,
      attachments: attachmentUrl,
    });

    if (newMessage) {
      await newMessage.save();

      const receiverSocketId = getReceiverSocketIds(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      const senderSocketId = getReceiverSocketIds(req.user._id.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", newMessage);
      }

      return res.status(201).json({
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        content: newMessage.content,
        attachments: newMessage.attachments,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageToDelete } = req.body;

    const message = await Message.findById(messageToDelete);

    if (!message) {
      return res.status(400).json({ error: "Message doesn't exist" });
    }

    if (req.user._id.toString() !== message.senderId) {
      return res.status(400).json({ error: "You aren't the owner of this message" });
    }

    await message.deleteOne();

    const receiverSocketId = getReceiverSocketIds(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", message);
    }

    const senderSocketId = getReceiverSocketIds(req.user._id.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("deleteMessage", message);
    }

    return res.status(204);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.body;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};
