import { createContext, useContext, useEffect, useState } from "react";
import socketio from "socket.io-client";
import { LocalStorage } from "../utils";

// function to establish a socket connection with authorization token
const getSocket = () => {
  const token = LocalStorage.get("token"); // retrieve jwt token from local storage

  // create a socket connection with the provided URI and authentication
  return socketio(import.meta.env.VITE_SOCKET.URI, {
    withCredentials: true,
    auth: { token },
  });
};

// create a context to hold the socket instance
const SocketContext = createContext({
  socket: null,
});

// custom hook to access the socket instance from the context
const useSocket = () => useContext(SocketContext);

// SocketProvider component to manage the socket instance and provide it through context
const SocketProvider = ({ children }) => {
  // state to store the socket instance
  const [socket, setSocket] = useState(null);

  // set up the socket connection when the component mounts
  useEffect(() => {
    setSocket(getSocket());
  }, []);

  return (
    // provide the socket instance through context to its children
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// export SocketProvider component and useSocket hook for other components
export { SocketProvider, useSocket };
