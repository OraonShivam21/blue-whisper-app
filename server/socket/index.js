const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const ApiError = require("../utils/ApiError");

// allows user to join the chat represented by chatId (chatId). event happens when user switches between the chats
const mountJoinChatEvent = (socket) => {
  socket.on("joinChat", (chatId) => {
    console.log(`User joined the chat. chatId: ${chatId}`);
    // joining the room with the chatId will allow specific events to be fired where we don't bother about the users like typing events
    // when user types we don't want to emit that event to specific participant. we want to just emit that to the chat where the typing is happening
    socket.join(chatId);
  });
};

// emits the typing event to the other participants of the chat
const mountParticipantTypingEvent = (socket) => {
  socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing", chatId);
  });
};

// emits the stopped typing event to the other participants of the chat
const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on("stopTyping", (chatId) => {
    socket.in(chatId).emit("stopTyping", chatId);
  });
};

const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      // parse the cookies from the handshake headers
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

      // get the access token
      let token = cookies?.accessToken;

      if (!token) {
        // if there is no access token in cookies, check inside the handshake auth
        token = socket.handshake.auth?.token;
      }

      // token is required for the socket to work
      if (!token)
        throw new ApiError(401, "Unauthorized handshake. Token is missing.");

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );

      if (!user)
        throw new ApiError(401, "Unauthorized handshake. Token is invalid");

      // mount the user object to the user
      socket.user = user;

      // creating a room with userId so that if user is joined but does not have any active chat going on
      // still we want to emit some socket events to the user so that the client can catch the event and show the notification.
      socket.join(user._id.toString());
      // emit the connected event so that client is aware
      socket.emit("connected");
      console.log("User connected, userId:", user._id.toString());

      // common events that needs to be mounted on the initialization
      mountJoinChatEvent(socket);
      mountParticipantTypingEvent(socket);
      mountParticipantStoppedTypingEvent(socket);

      // on user disconnection
      socket.on("disconnect", () => {
        console.log("user has disconnected. userId:", socket.user?._id);
        if (socket.user?._id) socket.leave(socket.user._id);
      });
    } catch (error) {
      socket.emit(
        "socketError",
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

// responsible to abstract the logic of socket emission via the io instance
// req - object to access `io` instance set at the entry point
// roomId - room where the event should be emitted
// event - that should be emitted
// payload - data that should be sent when emitting the event
const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};

module.exports = {
  initializeSocketIO,
  emitSocketEvent,
};
