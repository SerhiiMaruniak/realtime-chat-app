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
    const { receiverId, content, attachments, replyId: messageToReply } = req.body;

    const replyMessage = await Message.findById(messageToReply);

    let attachmentUrl = "";

    if (attachments) {
      const uploadedImage = await cloudinary.uploader.upload(attachments);
      attachmentUrl = uploadedImage.secure_url;
    }

    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      content,
      repliedMessage: replyMessage ? replyMessage._id : null,
      attachments: attachmentUrl,
      is_seen: false,
    });

    if (newMessage) {
      const populatedMessage = await newMessage.populate(
        "repliedMessage",
        "_id senderId content attachments"
      );

      await newMessage.save();

      const receiverSocketIds = getReceiverSocketIds(receiverId);
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessage", newMessage);
      });

      const senderSocketIds = getReceiverSocketIds(req.user._id.toString());
      senderSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessage", newMessage);
      });

      return res.status(201).json({
        senderId: populatedMessage.senderId,
        receiverId: populatedMessage.receiverId,
        content: populatedMessage.content,
        repliedMessage: populatedMessage.repliedMessage,
        attachments: populatedMessage.attachments,
        is_seen: populatedMessage.is_seen,
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

    const receiverSocketIds = getReceiverSocketIds(message.receiverId);
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("deleteMessage", message);
    });

    const senderSocketIds = getReceiverSocketIds(req.user._id.toString());
    senderSocketIds.forEach((socketId) => {
      io.to(socketId).emit("deleteMessage", message);
    });

    return res.status(204);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id: messageToEdit, content } = req.body;

    if (!messageToEdit || !content)
      return res.status(400).json({ error: "Fields can't be empty" });

    const message = await Message.findById(messageToEdit);

    if (!message) {
      return res.status(400).json({ error: "Message doesn't exist" });
    }

    if (req.user._id.toString() !== message.senderId) {
      return res.status(400).json({ error: "You aren't the owner of this message" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageToEdit,
      { content, is_edited: true },
      { new: true }
    );

    const receiverSocketIds = getReceiverSocketIds(updatedMessage.receiverId);
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("editMessage", updatedMessage);
    });

    const senderSocketIds = getReceiverSocketIds(req.user._id.toString());
    senderSocketIds.forEach((socketId) => {
      io.to(socketId).emit("editMessage", updatedMessage);
    });
    res.status(201).send();
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
    }).populate("repliedMessage", "_id content senderId attachments");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const setMessageSeen = async (req, res) => {
  try {
    const { id: messageId } = req.body;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (req.user._id.toString() !== message.receiverId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    message.is_seen = true;
    await message.save();

    const senderSocketIds = getReceiverSocketIds(message.senderId);
    senderSocketIds.forEach((socketId) => {
      io.to(socketId).emit("messageSeen", { messageId });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};
