import express from "express";
import {
  deleteMessage,
  editMessage,
  getMessages,
  getUnreadMessages,
  getUsers,
  sendMessage,
  setMessageSeen,
} from "../controllers/message.controller.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/users", protectedRoute, getUsers);
router.get("/get-messages/:id", protectedRoute, getMessages);
router.get("/unread", protectedRoute, getUnreadMessages);

router.post("/send-message", protectedRoute, sendMessage);

router.put("/set-seen/:id", protectedRoute, setMessageSeen);
router.put("/edit-message/:id", protectedRoute, editMessage);

router.delete("/delete-message/:id", protectedRoute, deleteMessage);

export default router;
