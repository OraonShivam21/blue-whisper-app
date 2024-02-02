const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connection = require("./connection.js");
const userRoute = require("./routes/user.route.js");
const chatRoute = require("./routes/chat.route.js");
const messageRoute = require("./routes/message.route.js");
require("dotenv").config({
  path: "./.env",
});

const app = express();
const port = process.env.PORT || 8080;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// using set method to mount the `io` instance on the app to avoid the usage of `global`
app.set("io", io);

// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*"
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/users", userRoute);

app.use("/api/chats", chatRoute);

app.use("/api/messages", messageRoute);

app.get("/api", (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to the blue-whisper API" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

httpServer.listen(port, async () => {
  try {
    await connection;
    console.log("connected to mongodb");
    console.log("listening on port", port);
  } catch (error) {
    console.log("mongodb connection error:", error);
  }
});
