import { useAuth } from "./context/AuthContext";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import ChatPage from "./pages/chat";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// main App component
const App = () => {
  // extracting 'token' and 'user' from the authentication context
  const { token, user } = useAuth();
  return (
    <Routes>
      {/* Root route: redirects to chat if the user is logged in, else to the login page */}
      <Route
        path="/"
        element={
          token && user?._id ? (
            <Navigate to="/chat" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Private chat route: can only be accessed by authenticated users */}
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />

      {/* Public login route: accessible by everyone */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Public register route: accessible by everyone */}
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Wildcard route for unefined paths. Show a 404 error */}
      <Route path="*" element={<p>404 Not Found</p>} />
    </Routes>
  );
};

// exporting the App component to be used in other parts of the application
export default App;
