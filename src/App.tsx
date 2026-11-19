import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemedToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { getClientToken, getToken } from "@/services/api";
import AdminDashboard from "./app/pages/AdminDashbaord";
import ChatbotPage from "./app/pages/ChatbotPage";
import LandingPage from "./app/pages/LandinPpage";
import Login from "./app/pages/Login";
import NewRequest from "./app/pages/NewRequest";
import ForgotPassword from "./app/pages/ForgotPassword";
import ResetPassword from "./app/pages/ResetPassword";
import Register from "./app/pages/Register";
import RequestDetails from "./app/pages/RequestDetails";
import UserDashboard from "./app/pages/UserDashboard";

function ClientRoute({ children }: { children: React.ReactNode }) {
  return getClientToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/client-login" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<ClientRoute><UserDashboard /></ClientRoute>} />
            <Route path="/dashboard/requests" element={<ClientRoute><UserDashboard /></ClientRoute>} />
            <Route path="/dashboard/profile" element={<ClientRoute><UserDashboard /></ClientRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/new-request" element={<NewRequest />} />
            <Route path="/requests/new" element={<NewRequest />} />
            <Route path="/request/:id" element={<RequestDetails />} />
            <Route path="/requests/:id" element={<RequestDetails />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
          </Routes>
          <ThemedToaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
