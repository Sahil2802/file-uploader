import React, { useState, useEffect } from "react";
import type { PollQuestion } from "../../types";
import { PollCreator } from "./PollCreator";
import { PollDisplay } from "./PollDisplay";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { usePolls } from "../../hooks/usePolls";

export const PollManager: React.FC = () => {
  const [showCreator, setShowCreator] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserProfile(user);
  const {
    polls: fetchedPolls,
    loading,
    error,
    createPoll,
    vote,
    deletePollQuestion,
  } = usePolls();
  const [polls, setPolls] = useState(fetchedPolls);

  // Sync local polls state with fetchedPolls
  useEffect(() => {
    setPolls(fetchedPolls);
  }, [fetchedPolls]);

  const handleCreatePoll = async (
    title: string,
    questions: Omit<PollQuestion, "id" | "poll_id" | "created_at">[]
  ) => {
    try {
      await createPoll(title, questions);
      setShowCreator(false);
    } catch (error) {
      console.error("Failed to create poll:", error);
      throw error;
    }
  };

  const handleVote = async (questionId: string, optionId: string) => {
    try {
      await vote(questionId, optionId);
    } catch (error) {
      console.error("Failed to vote:", error);
      throw error;
    }
  };

  // Handler to delete a poll question and update UI instantly
  const handleDeleteQuestion = async (questionId: string) => {
    // Remove question from local state instantly
    setPolls((prevPolls) =>
      prevPolls.map((poll) => ({
        ...poll,
        questions: poll.questions.filter((q) => q.id !== questionId),
      }))
    );
    // Call backend delete
    await deletePollQuestion(questionId);
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          Please log in to view and participate in polls.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading polls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Poll System</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreator(!showCreator)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {showCreator ? "Cancel" : "Create New Poll"}
          </button>
        )}
      </div>

      {showCreator && isAdmin && (
        <PollCreator
          onCreatePoll={handleCreatePoll}
          onCancel={() => setShowCreator(false)}
        />
      )}

      <div className="space-y-6">
        {polls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No polls yet
            </h3>
            <p className="text-gray-600">
              {isAdmin
                ? "Create your first poll to get started!"
                : "Check back later for new polls!"}
            </p>
          </div>
        ) : (
          polls.map((poll) => (
            <div key={poll.id} className="space-y-4">
              {poll.questions.map((question) => (
                <PollDisplay
                  key={question.id}
                  question={question}
                  onVote={handleVote}
                  isAdmin={isAdmin}
                  onDeleteQuestion={handleDeleteQuestion}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
