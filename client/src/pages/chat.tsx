import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { getChatMessages, getUserChats, sendMessage } from "../api";
import AddChatModal from "../components/chat/AddChatModal";
import ChatItem from "../components/chat/ChatItem";
import MessageItem from "../components/chat/MessageItem";
import Typing from "../components/chat/Typing";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  ChatListItemInterface,
  ChatMessageInterface,
} from "../interfaces/chat";
import {
  LocalStorage,
  classNames,
  getChatObjectMetadata,
  requestHandler,
} from "../utils";

const ChatPage = () => {
  // Import the 'useAuth' and 'useSocket' hooks from their respective contexts
  const { user } = useAuth();
  const { socket } = useSocket();

  // Craete a reference using 'useRef' to hold the currently selected chat
  // useRef is used here to ensure that the currentChat value within socket event callbacks will always refer to the latest value, even if the component re-renders
  const currentChat = useRef<ChatListItemInterface | null>(null);

  // To keep track of the setTimeout function
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define state variables and their initial values using useState
  // For tracking socket connection
  const [isConnected, setIsConnected] = useState(false);
  // To control the Add Chat modal
  const [openAddChat, setOpenAddChat] = useState(false);
  // To indicate loading of chats
  const [loadingChats, setLoadingChats] = useState(false);
  // To indicate loading of messages
  const [loadingMessages, setLoadingMessages] = useState(false);
  // To store user's chats
  const [chats, setChats] = useState<ChatListItemInterface[]>([]);
  // To store chat messages
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
  // To track unread messages
  const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>(
    []
  );

  // To track if someone is currently typing
  const [isTyping, setIsTyping] = useState(false);
  // To track if the current user if typing
  const [selfTyping, setSelfTyping] = useState(false);

  // To store the currently typed message
  const [message, setMessage] = useState("");
  // For local searc functionality
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // To store files attached to message
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // A function to update the last message of a specified chat to update the chat list
  const updateChatLastMessage = (
    chatToUpdateId: string,
    message: ChatMessageInterface // The new message to be set as the last message
  ) => {
    // Search for the chat with the given ID in the chats array
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;

    // Update the 'lastMessage' field of the found chat with the new message
    chatToUpdate.lastMessage = message;

    // Update the updateAt field of the chat with the udpateAt field from the message
    chatToUpdate.updatedAt = message?.updatedAt;

    // Update the state of the chats, placing the updated chat at the beginning of the array
    setChats([
      chatToUpdate, // Place the updated chat first
      ...chats.filter((chat) => chat._id !== chatToUpdateId), // Include all other chats except the updated on
    ]);
  };

  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => {
        const { data } = res;
        setChats(data || []);
      },
      alert
    );
  };

  const getMessage = async () => {
    // Check if a chat is selected, if not, show an alert
    if (!currentChat.current?._id) return alert("No chat is selected");

    // Check if socket is available, if not, show an alert
    if (!socket) return alert("Socket not available");

    // Emit an event to join the current chat
    socket.emit("joinChat", currentChat.current?._id);

    // Filter out unread messages from the current chat as those will be read
    setUnreadMessages(
      unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id)
    );

    // Make an async request to fetch chat messages for the current chat
    requestHandler(
      // Fetching messages for the current chat
      async () => await getChatMessages(currentChat.current?._id || ""),
      // Set the state to loading while fetching the messages
      setLoadingMessages,
      // After fetching, set the chat messagse to the state if available
      (res) => {
        const { data } = res;
        setMessages(data || []);
      },
      // Display any error alerts if they occur during the fetch
      alert
    );
  };

  // Function to send a chat message
  const sendChatMessage = async () => {
    // If no current chat ID exists or there's no socket connection, exit the function
    if (!currentChat.current?._id || !socket) return;

    // Emit a stopTyping event to inform other users or participants that typing has stopped
    socket.emit("stopTyping", currentChat.current?._id);
  };
};
