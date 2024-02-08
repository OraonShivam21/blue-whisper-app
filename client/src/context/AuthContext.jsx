import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser, registerUser } from "../api";
import { LocalStorage, requestHandler } from "../utils";
import { Loader } from "../components/Loader";

// create a context to manage authentication-related data and functions
const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// create a hook to access te AuthContext
const useAuth = () => useContext(AuthContext);

// create a component that provides authentication-related data and functions
const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  // function to handle user login
  const login = async (data) => {
    await requestHandler(
      async () => await loginUser(data),
      setIsLoading,
      (res) => {
        const { data } = res;
        setUser(data.user);
        setToken(data.accessToken);
        LocalStorage.set("user", data.user);
        LocalStorage.set("token", data.accessToken);
        navigate("/chat"); // redirect to chat page after successful login
      },
      alert // display error alerts on request failures
    );
  };

  // function to handle user registration
  const register = async (data) => {
    await requestHandler(
      async () => await registerUser(data),
      setIsLoading,
      () => {
        alert("Account created successfully! Go ahead and login.");
        navigate("/login"); // redirect to login page after successful registration
      },
      alert // display error alerts on request failures
    );
  };

  // funciton to handle user logout
  const logout = async () => {
    await requestHandler(
      async () => await logoutUser(),
      setIsLoading,
      () => {
        setUser(null), setToken(null), LocalStorage.clear(), navigate("/login");
      },
      alert
    );
  };

  // check for saved user and token in local storage during component initialization
  useEffect(() => {
    setIsLoading(true);
    const _token = LocalStorage.get("token");
    const _user = LocalStorage.get("user");
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, token }}>
      {isLoading ? <Loader /> : children}
      {/* display a loader while loading */}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, useAuth };
