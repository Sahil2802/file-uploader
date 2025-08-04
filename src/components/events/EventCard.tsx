import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Calendar, MapPin } from "lucide-react";
import ConfirmationModal from "../ui/ConfirmationModal";

interface Event {
  id: string;
  name: string;
  date: string;
  created_at?: string;
}

interface EventCardProps {
  event: Event;
  isRegistered: boolean;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  loading?: boolean;
  isActuallyRegistered?: boolean; // Whether the event is saved in database vs just selected
  onImmediateUnregister?: (eventId: string) => Promise<void>; // For immediate database removal
}

const EventCard: React.FC<EventCardProps> = React.memo(
  ({
    event,
    isRegistered,
    onRegister,
    onUnregister,
    loading = false,
    isActuallyRegistered = false,
    onImmediateUnregister,
  }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleRemoveClick = () => {
      // Only show confirmation for actual registrations, not selections
      if (isActuallyRegistered) {
        setShowConfirmation(true);
      } else {
        // Immediately remove selection without confirmation
        onUnregister(event.id);
      }
    };

    const handleConfirmRemove = async () => {
      if (isActuallyRegistered && onImmediateUnregister) {
        // For actual registrations, use immediate database removal
        try {
          await onImmediateUnregister(event.id);
        } catch (error) {
          console.error("Failed to unregister from event:", error);
        }
      } else {
        // For selections, use regular unregister
        onUnregister(event.id);
      }
      setShowConfirmation(false);
    };

    const handleCancelRemove = () => {
      setShowConfirmation(false);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <>
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl min-h-[3.5rem] flex items-start leading-tight">
              {event.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 flex-1">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{formatDate(event.date)}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">Virtual Event</span>
            </div>
          </CardContent>

          <CardFooter className="pt-4 mt-auto">
            {isRegistered ? (
              <Button
                onClick={handleRemoveClick}
                disabled={loading}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 cursor-pointer"
              >
                {isActuallyRegistered
                  ? "Cancel Registration"
                  : "Remove Selection"}
              </Button>
            ) : (
              <Button
                onClick={() => onRegister(event.id)}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={handleCancelRemove}
          onConfirm={handleConfirmRemove}
          title="Cancel Registration"
          description={`Are you sure you want to cancel your registration for "${event.name}"? This action cannot be undone.`}
          confirmText="Yes, Cancel"
          confirmVariant="destructive"
          loading={loading}
        />
      </>
    );
  }
);

EventCard.displayName = "EventCard";

export default EventCard;
