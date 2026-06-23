import { getReceiverSocketIds, io } from "../lib/socket.js";
import FriendRequest from "../models/friend.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (
      sender.friendsList.includes(receiverId) ||
      receiver.friendsList.includes(req.user._id)
    ) {
      return res.status(400).json({ error: "Already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderId: req.user._id, receiverId },
        { senderId: receiverId, receiverId: req.user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already exists" });
    }

    const newFriendRequest = new FriendRequest({
      senderId: req.user._id,
      receiverId,
    });

    await newFriendRequest.save();

    const populatedRequest = await FriendRequest.findById(newFriendRequest._id)
      .populate("senderId", "_id username user_id email photoUrl")
      .populate("receiverId", "_id username user_id email photoUrl");

    const receiverSocketId = getReceiverSocketIds(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("addFriend", populatedRequest);
    }

    const senderSocketId = getReceiverSocketIds(req.user._id.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("addFriend", populatedRequest);
    }

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    let type = req.query.type;
    type = typeof type === "string" ? type.trim().toLowerCase() : undefined;

    if (!type || (type !== "received" && type !== "sent")) {
      return res.status(400).json({ error: "Make sure that the type is right" });
    }

    let requests = null;

    if (type === "received") {
      const request = await FriendRequest.find({ receiverId: req.user._id }).populate(
        "senderId",
        "_id username user_id photoUrl",
      );
      requests = request;
    } else if (type === "sent") {
      requests = await FriendRequest.find({ senderId: req.user._id }).populate(
        "receiverId",
        "_id username user_id photoUrl",
      );
    }

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const manageFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { action } = req.body;

    switch (action) {
      case "accept": {
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
          return res.status(400).json({ error: "Request doesn't exist" });
        }

        const { senderId, receiverId } = friendRequest;

        if (req.user._id.toString() !== receiverId) {
          return res.status(400).json({ error: "You aren't the receiver" });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!receiver || !sender) {
          return res.status(400).json({ error: "User not found" });
        }

        if (
          sender.friendsList.includes(receiverId) ||
          receiver.friendsList.includes(senderId)
        ) {
          return res.status(400).json({ error: "Already friends" });
        }

        await sender.updateOne({ $push: { friendsList: receiver._id } });
        await receiver.updateOne({ $push: { friendsList: sender._id } });

        await friendRequest.deleteOne();

        const populatedSender = await User.findById(senderId).select(
          "_id username user_id email photoUrl",
        );
        const populatedReceiver = await User.findById(receiverId).select(
          "_id username user_id email photoUrl",
        );

        const receiverSocketId = getReceiverSocketIds(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("acceptRequest", populatedSender, friendRequest);
        }

        const senderSocketId = getReceiverSocketIds(senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("acceptRequest", populatedReceiver, friendRequest);
        }

        res.status(201).json(populatedReceiver);
        break;
      }

      case "decline": {
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
          return res.status(400).json({ error: "Request doesn't exist" });
        }

        const { receiverId, senderId } = friendRequest;

        if (req.user._id.toString() !== receiverId) {
          return res.status(400).json({ error: "You aren't the receiver" });
        }

        await friendRequest.deleteOne();

        const receiverSocketId = getReceiverSocketIds(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("declineRequest", friendRequest);
        }

        const senderSocketId = getReceiverSocketIds(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("declineRequest", friendRequest);
        }

        res.status(201).json({ message: "Successfully declined request" });
        break;
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friendsList",
      "_id username user_id photoUrl",
    );

    res.status(200).json(user.friendsList);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const deleteFriend = async (req, res) => {
  try {
    const friendToDelete = req.params.id;

    const myUser = await User.findById(req.user._id);
    const friendUser = await User.findById(friendToDelete);

    if (!myUser || !friendUser) {
      return res.status(400).json({ error: "User doesn't exist" });
    }

    if (
      !myUser.friendsList.includes(friendUser._id) ||
      !friendUser.friendsList.includes(myUser._id)
    ) {
      return res.status(400).json({ error: "You aren't friends" });
    }

    await myUser.updateOne({ $pull: { friendsList: friendUser._id } });
    await friendUser.updateOne({ $pull: { friendsList: myUser._id } });

    await Message.deleteMany({
      $or: [
        { senderId: myUser._id, receiverId: friendUser._id },
        { senderId: friendUser._id, receiverId: myUser._id },
      ],
    });

    const receiverSocketId = getReceiverSocketIds(friendUser._id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteFriend", myUser._id);
    }

    const senderSocketId = getReceiverSocketIds(myUser._id.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("deleteFriend", friendUser._id);
    }

    res.status(201).json({ message: "Deleted friend successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const getUsers = async (req, res) => {
  try {
    const { id, username, page = "1", limit = "5" } = req.query;

    if (!id && !username) {
      return res.status(400).json({ error: "ID or name can't be empty" });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 5);
    const skip = (pageNum - 1) * limitNum;

    const excludeIds = [req.user._id, ...(req.user.friendsList || [])];

    let query = null;
    if (id) {
      query = {
        $and: [{ user_id: id }, { _id: { $nin: excludeIds } }],
      };
    } else {
      const usernameRegexp = new RegExp(username, "ig");
      query = {
        $and: [{ username: usernameRegexp }, { _id: { $nin: excludeIds } }],
      };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query).skip(skip).limit(limitNum);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    res.status(200).json({ users, totalPages, page: pageNum, total });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};
