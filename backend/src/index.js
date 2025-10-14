import express from "express";
import { config } from "dotenv";
config();
import cookieparser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import friendRoute from "./routes/friend.route.js";
import { app, server } from "./lib/socket.js";
import "./jobs/resetToken.js";

app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieparser());

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
app.use("/api/friends", friendRoute);

server.listen(process.env.SERVER_PORT, (err) => {
  if (err) console.error(err);
  else {
    console.log("Server started on port:", process.env.SERVER_PORT);
    connectDB();
  }
});
