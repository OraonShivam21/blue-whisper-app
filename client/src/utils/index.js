// check if the code is running on a browser environment
export const isBrowser = typeof window !== "undefined";

// a utility function for handling API requests with loading, success and error handling
export const requestHandler = async (api, setLoading, onSuccess, onError) => {
  // show loading state if setLoading function is provided
  setLoading && setLoading(true);
  try {
    // make the API request
    const response = await api();
    const { data } = response;
    if (data?.success) onSuccess(data);
  } catch (error) {
    // handle error cases, including unauthorized and forbidden cases
    if ([401, 403].includes(error?.response.data?.statusCode)) {
      localStorage.clear(); // clear local storage on authentication issues
      if (isBrowser) window.location.href = "/login"; // redirect to login page
    }
    onError(error?.response?.data?.message || "Something went wrong");
  } finally {
    // hide loading state if setLoading function is provided
    setLoading && setLoading(false);
  }
};

// a utility function to concatenate CSS class names with proper spacing
export const classNames = (...className) => {
  // filter out any empty class names and join them with a space
  return className.filter(Boolean).join(" ");
};

// utility function generates metadata for chat objects.
// it takes into consideration both group chats and individual chats.
export const getChatObjectMetadata = (
  chat, // chat item for which metadata is being generated
  loggedInUser // currently logged in user details
) => {
  // determine the content of the last message, if any
  // if the last message contains only attachments, indicate their count
  const lastMessage = chat.lastMessage?.content
    ? chat.lastMessage?.content
    : chat.lastMessage
    ? `${chat.lastMessage?.attachments?.length} attachment${
        chat.lastMessage.attachments.length > 1 ? "s" : ""
      }`
    : "No messages yet"; // placeholder text if there are no messages

  if (chat.isGroupChat) {
    // case: group chat
    // return metadata specific to group chats
    return {
      // default avatar for group chats
      avatar: "https://via.placeholder.com/100x100/png",
      title: chat.name,
      description: `${chat.participants.length} members in the chat.`,
      lastMessage: chat.lastMessage
        ? chat.lastMessage?.sender?.username + ": " + lastMessage
        : lastMessage,
    };
  } else {
    // case: individual chat
    // identify the participant other than the logged-in user.
    const participant = chat.participants.find(
      (p) => p._id !== loggedInUser?._id
    );
    // return metadata specific to individuals chats
    return {
      avatar: participant?.avatar.url,
      title: participant?.username,
      description: participant?.email,
      lastMessage,
    };
  }
};

// a class that provides utility functions for working with local storage
export class LocalStorage {
  // get a value from local storage by key
  static get(key) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // set a value in local storage by key
  static set(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // remove a value from local storage by key
  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}
