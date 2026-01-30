import express from "express";
import {
  deleteMessage,
  editMessage,
  getMessages,
  getUsers,
  sendMessage,
  setMessageSeen,
} from "../controllers/message.controller.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/users", protectedRoute, getUsers);

router.post("/get-messages", protectedRoute, getMessages);
router.post("/send-message", protectedRoute, sendMessage);
router.post("/set-seen", protectedRoute, setMessageSeen);

router.put("/edit-message", protectedRoute, editMessage);

router.delete("/delete-message", protectedRoute, deleteMessage);

export default router;
