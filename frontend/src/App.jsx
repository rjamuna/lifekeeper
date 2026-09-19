import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import RemindersPage from "./pages/RemindersPage";
import AIPage from "./pages/AIPage";
import UploadPage from "./pages/UploadPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";

const App = () => (
  <AuthProvider>
    <Navbar />
    <Routes>
      {/* Public-only routes — redirect to / if already logged in */}
      <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route path="/"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
      <Route path="/ai"       element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
      <Route path="/upload"   element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-5xl mb-4">404</p>
              <p>Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  </AuthProvider>
);

export default App;
