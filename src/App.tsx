import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "./app/pages/AdminDashbaord";
import ChatbotPage from "./app/pages/ChatbotPage";
import LandingPage from "./app/pages/LandinPpage";
import Login from "./app/pages/Login";
import NewRequest from "./app/pages/NewRequest";
import RequestDetails from "./app/pages/RequestDetails";
import UserDashboard from "./app/pages/UserDashboard";

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/requests" element={<UserDashboard />} />
          <Route path="/dashboard/profile" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/new-request" element={<NewRequest />} />
          <Route path="/requests/new" element={<NewRequest />} />
          <Route path="/request/:id" element={<RequestDetails />} />
          <Route path="/requests/:id" element={<RequestDetails />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
