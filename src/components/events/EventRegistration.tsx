import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import EventCard from "./EventCard";
import RegisteredEventsList from "./RegisteredEventsList";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { LogOut, User, Calendar, ChevronDown } from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string;
  created_at?: string;
}

interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  event: Event;
}

const EventRegistration: React.FC = () => {
  const { user, signOut } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<Set<string>>(
    new Set()
  );
  const [submitLoading, setSubmitLoading] = useState(false);
  const [immediateUnregisterLoading, setImmediateUnregisterLoading] =
    useState(false);
  const [error, setError] = useState<string>("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch events and user registrations
  useEffect(() => {
    const fetchEventsAndRegistrations = async () => {
      try {
        setError("");

        // Fetch all events
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (eventsError) throw eventsError;

        // Fetch user's registrations
        const { data: registrationsData, error: registrationsError } =
          await supabase
            .from("registrations")
            .select(
              `
            *,
            event:events(*)
          `
            )
            .eq("user_id", user?.id);

        if (registrationsError) throw registrationsError;

        setEvents(eventsData || []);
        setRegistrations(registrationsData || []);

        // Set initial pending registrations based on current registrations
        const currentRegistrationIds = new Set(
          (registrationsData || []).map((r) => r.event_id)
        );
        setPendingRegistrations(currentRegistrationIds);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load events";
        setError(errorMessage);
      }
    };

    if (user) {
      fetchEventsAndRegistrations();
    }
  }, [user]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRegister = (eventId: string) => {
    setPendingRegistrations((prev) => new Set(prev).add(eventId));
  };

  const handleUnregister = (eventId: string) => {
    setPendingRegistrations((prev) => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  const handleImmediateUnregister = async (eventId: string) => {
    if (!user) return;

    try {
      setImmediateUnregisterLoading(true);
      setError("");

      // Remove from pending registrations first
      setPendingRegistrations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });

      // Delete from database immediately
      const { error: deleteError } = await supabase
        .from("registrations")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventId);

      if (deleteError) throw deleteError;

      // Refresh registrations data
      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("registrations")
          .select(
            `
            *,
            event:events(*)
          `
          )
          .eq("user_id", user?.id);

      if (registrationsError) throw registrationsError;
      setRegistrations(registrationsData || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel registration";
      setError(errorMessage);

      // Restore the registration in case of error
      setPendingRegistrations((prev) => new Set(prev).add(eventId));
    } finally {
      setImmediateUnregisterLoading(false);
    }
  };

  const handleSubmitRegistrations = async () => {
    if (!user) return;

    try {
      setSubmitLoading(true);
      setError("");

      // Get current registrations
      const currentRegistrationIds = new Set(
        registrations.map((r) => r.event_id)
      );

      // Determine what to add and remove
      const toAdd = Array.from(pendingRegistrations).filter(
        (eventId) => !currentRegistrationIds.has(eventId)
      );
      const toRemove = Array.from(currentRegistrationIds).filter(
        (eventId) => !pendingRegistrations.has(eventId)
      );

      // Add new registrations
      if (toAdd.length > 0) {
        const newRegistrations = toAdd.map((eventId) => ({
          user_id: user.id,
          event_id: eventId,
        }));

        const { error: insertError } = await supabase
          .from("registrations")
          .insert(newRegistrations);

        if (insertError) throw insertError;
      }

      // Remove cancelled registrations
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("registrations")
          .delete()
          .eq("user_id", user.id)
          .in("event_id", toRemove);

        if (deleteError) throw deleteError;
      }

      // Refresh data
      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("registrations")
          .select(
            `
          *,
          event:events(*)
        `
          )
          .eq("user_id", user?.id);

      if (registrationsError) throw registrationsError;
      setRegistrations(registrationsData || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save registrations";
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const isRegistered = (eventId: string) => {
    return pendingRegistrations.has(eventId);
  };

  const isActuallyRegistered = (eventId: string) => {
    return registrations.some((r) => r.event_id === eventId);
  };

  const hasChanges = () => {
    // Don't show submit button when immediate unregister is in progress
    if (immediateUnregisterLoading) return false;

    const currentRegistrationIds = new Set(
      registrations.map((r) => r.event_id)
    );
    return (
      pendingRegistrations.size !== currentRegistrationIds.size ||
      Array.from(pendingRegistrations).some(
        (id) => !currentRegistrationIds.has(id)
      )
    );
  };

  const getUserInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Event Registration
                </h1>
              </div>
            </button>
            <div className="flex items-center space-x-3">
              {(user?.user_metadata?.role === "admin" ||
                user?.email?.includes("admin") ||
                user?.email === "admin@example.com") && (
                <Button
                  onClick={() => (window.location.href = "/admin")}
                  variant="default"
                  size="sm"
                  className="flex items-center bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1 h-7 font-medium cursor-pointer"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </Button>
              )}

              {/* Profile Avatar Dropdown */}
              <div className="relative " ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-full pl-2 pr-3 cursor-pointer py-1 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.email ? getUserInitials(user.email) : "U"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Account
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 ">
              Discover Amazing Events
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-8 max-w-4xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Available Events - Takes up more space */}
            <div className="xl:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Available Events
                </h3>
                <div className="text-sm text-gray-500">
                  {events.length} event{events.length !== 1 ? "s" : ""}{" "}
                  available
                </div>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    No Events Available
                  </h4>
                  <p className="text-gray-500">
                    Check back later for upcoming events.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isRegistered={isRegistered(event.id)}
                      onRegister={handleRegister}
                      onUnregister={handleUnregister}
                      loading={submitLoading}
                      isActuallyRegistered={isActuallyRegistered(event.id)}
                      onImmediateUnregister={handleImmediateUnregister}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Registration Summary - Sticky sidebar */}
            <div className="xl:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    Your Registrations
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <RegisteredEventsList
                    events={events}
                    pendingRegistrations={pendingRegistrations}
                    onUnregister={handleUnregister}
                    currentRegistrations={
                      new Set(registrations.map((r) => r.event_id))
                    }
                    onImmediateUnregister={handleImmediateUnregister}
                  />

                  {hasChanges() && (
                    <Button
                      onClick={handleSubmitRegistrations}
                      disabled={submitLoading}
                      className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
                    >
                      {submitLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        "Submit Registration"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventRegistration;
