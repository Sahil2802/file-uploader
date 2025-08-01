import React from "react";
import { PollManager } from "./poll";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { Button } from "./ui/button";
import { LogOut, User, BarChart3, Shield } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile(user);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if server logout fails, the local state should be cleared
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Polls Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
                {isAdmin && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className=" w-4 h-4" />
                <span className="">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PollManager />
      </main>
    </div>
  );
};

export default Dashboard;
