import express from "express";
import {
  deleteFriend,
  getFriendRequests,
  getFriends,
  getUsers,
  manageFriendRequest,
  sendFriendRequest,
} from "../controllers/friend.controller.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/get-users", protectedRoute, getUsers);
router.get("/friends", protectedRoute, getFriends);
router.get("/requests/:id", protectedRoute, getFriendRequests);

router.post("/send-request/:id", protectedRoute, sendFriendRequest);
router.put("/manage-request/:id", protectedRoute, manageFriendRequest);

router.delete("/delete-friend/:id", protectedRoute, deleteFriend);

export default router;
