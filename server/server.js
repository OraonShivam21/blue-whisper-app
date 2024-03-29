const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const connection = require("./connection.js");
const userRoute = require("./routes/user.routes.js");
const chatRoute = require("./routes/chat.routes.js");
const messageRoute = require("./routes/message.routes.js");
const errorHandler = require("./middlewares/error.middlewares.js");
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

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")); // configure static file to save images locally

app.use(cookieParser());

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.use(errorHandler);

httpServer.listen(port, async () => {
  try {
    await connection;
    console.log("connected to mongodb");
    console.log("listening on port", port);
  } catch (error) {
    console.log("mongodb connection error:", error);
  }
});
