import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import ConfirmationModal from "../ui/ConfirmationModal";

interface Event {
  id: string;
  name: string;
  date: string;
  created_at?: string;
}

interface RegisteredEventsListProps {
  events: Event[];
  pendingRegistrations: Set<string>;
  onUnregister: (eventId: string) => void;
  currentRegistrations?: Set<string>; // Current registrations from database
  onImmediateUnregister?: (eventId: string) => Promise<void>; // For immediate database removal
}

const RegisteredEventsList: React.FC<RegisteredEventsListProps> = React.memo(
  ({
    events,
    pendingRegistrations,
    onUnregister,
    currentRegistrations = new Set(),
    onImmediateUnregister,
  }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [eventToRemove, setEventToRemove] = useState<string | null>(null);
    const [isProcessingRemoval, setIsProcessingRemoval] = useState(false);

    const handleRemoveClick = (eventId: string, isRegistered: boolean) => {
      if (isRegistered) {
        // Show confirmation for registered events
        setEventToRemove(eventId);
        setShowConfirmation(true);
      } else {
        // Immediately remove selection without confirmation
        onUnregister(eventId);
      }
    };

    const handleConfirmRemove = async () => {
      if (eventToRemove) {
        setIsProcessingRemoval(true);
        const isRegisteredEvent = currentRegistrations.has(eventToRemove);

        if (isRegisteredEvent && onImmediateUnregister) {
          // For actual registrations, use immediate database removal
          try {
            await onImmediateUnregister(eventToRemove);
          } catch (error) {
            console.error("Failed to unregister from event:", error);
          }
        } else {
          // For selections, use regular unregister
          onUnregister(eventToRemove);
        }

        setIsProcessingRemoval(false);
      }
      setShowConfirmation(false);
      setEventToRemove(null);
    };

    const handleCancelRemove = () => {
      setShowConfirmation(false);
      setEventToRemove(null);
    };
    const allSelectedEvents = events.filter((event) =>
      pendingRegistrations.has(event.id)
    );

    // Separate registered vs selected events
    const registeredEvents = allSelectedEvents.filter((event) =>
      currentRegistrations.has(event.id)
    );

    const selectedEvents = allSelectedEvents.filter(
      (event) => !currentRegistrations.has(event.id)
    );

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (allSelectedEvents.length === 0) {
      return (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">
            No events registered yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Select events to get started
          </p>
        </div>
      );
    }

    const renderEventList = (
      eventList: Event[],
      bgColor: string,
      isRegistered: boolean = false
    ) =>
      eventList.map((event) => (
        <div
          key={event.id}
          className={`flex items-start justify-between p-4 ${bgColor} border border-blue-200 rounded-xl hover:shadow-md transition-all duration-200`}
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate mb-2">
              {event.name}
            </h4>
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(event.date)}</span>
            </div>
          </div>

          <button
            onClick={() => handleRemoveClick(event.id, isRegistered)}
            className="ml-3 p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Remove from registration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ));

    return (
      <div className="space-y-4">
        {/* Registered Events Section */}
        {registeredEvents.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <h5 className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Registered ({registeredEvents.length})
              </h5>
            </div>
            <div className="space-y-3">
              {renderEventList(
                registeredEvents,
                "bg-gradient-to-r from-green-50 to-emerald-50",
                true
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        {registeredEvents.length > 0 && selectedEvents.length > 0 && (
          <div className="flex items-center py-2">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-3 text-xs text-gray-400 font-medium">
              PENDING
            </div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        )}

        {/* Selected (Pending) Events Section */}
        {selectedEvents.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <h5 className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Selected ({selectedEvents.length})
              </h5>
            </div>
            <div className="space-y-3">
              {renderEventList(
                selectedEvents,
                "bg-gradient-to-r from-blue-50 to-indigo-50",
                false
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            {registeredEvents.length > 0 && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <p className="text-xs font-medium">
                  {registeredEvents.length} registered
                </p>
              </div>
            )}
            {selectedEvents.length > 0 && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <p className="text-xs font-medium">
                  {selectedEvents.length} selected
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onConfirm={handleConfirmRemove}
          onClose={handleCancelRemove}
          title="Cancel Registration"
          description="Are you sure you want to cancel your registration for this event? This action cannot be undone."
          confirmText="Yes, Cancel Registration"
          confirmVariant="destructive"
          loading={isProcessingRemoval}
        />
      </div>
    );
  }
);

RegisteredEventsList.displayName = "RegisteredEventsList";

export default RegisteredEventsList;
