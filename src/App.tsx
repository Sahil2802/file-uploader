import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import EventRegistration from "./components/events/EventRegistration";
import AdminDashboard from "./components/admin/AdminDashboard";

const AppContent: React.FC = () => {
  const { user } = useAuth();

  // If not authenticated, show login page
  if (!user) {
    return <AuthPage />;
  }

  // If authenticated, check current route
  const isAdminRoute = window.location.pathname === "/admin";
  return isAdminRoute ? <AdminDashboard /> : <EventRegistration />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
