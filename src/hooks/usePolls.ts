import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Poll, PollQuestion } from "../types";

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      // Fetch polls with questions, options, and vote counts
      const { data: pollsData, error: pollsError } = await supabase
        .from("polls")
        .select(
          `
          *,
          poll_questions (
            *,
            poll_options (
              *
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (pollsError) throw pollsError;

      // Get vote counts for each option
      const pollsWithVotes = await Promise.all(
        (pollsData || []).map(async (poll) => {
          const questionsWithVotes = await Promise.all(
            poll.poll_questions.map(
              async (
                question: {
                  id: string;
                  poll_options: {
                    id: string;
                    option_text: string;
                    option_order: number;
                  }[];
                } & Record<string, unknown>
              ) => {
                // Get vote counts for each option
                const optionsWithVotes = await Promise.all(
                  question.poll_options.map(
                    async (option: {
                      id: string;
                      option_text: string;
                      option_order: number;
                    }) => {
                      const { count } = await supabase
                        .from("poll_votes")
                        .select("*", { count: "exact", head: true })
                        .eq("option_id", option.id);

                      return {
                        ...option,
                        votes: count || 0,
                      };
                    }
                  )
                );

                // Check if current user has voted (only if authenticated)
                let userVote = null;
                try {
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();
                  if (session?.user) {
                    const { data, error } = await supabase
                      .from("poll_votes")
                      .select("option_id")
                      .eq("question_id", question.id)
                      .eq("user_id", session.user.id)
                      .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no row is found

                    if (error) {
                      console.warn("Error checking user vote:", error);
                    } else {
                      userVote = data;
                    }
                  }
                } catch (error) {
                  // User not authenticated or no vote found - that's okay
                  console.warn("No user vote found:", error);
                }

                return {
                  ...question,
                  options: optionsWithVotes.sort(
                    (a, b) => a.option_order - b.option_order
                  ),
                  user_voted: !!userVote,
                  user_vote_option_id: userVote?.option_id,
                };
              }
            )
          );

          return {
            ...poll,
            questions: questionsWithVotes,
          };
        })
      );

      setPolls(pollsWithVotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch polls");
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (
    title: string,
    questions: Omit<PollQuestion, "id" | "poll_id" | "created_at">[]
  ) => {
    try {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error("User not authenticated - please log in again");
      }

      console.log("Creating poll with user:", session.user.id);

      // Create poll
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .insert({ title, created_by: session.user.id })
        .select()
        .single();

      if (pollError) {
        console.error("Poll creation error:", pollError);
        throw new Error(`Failed to create poll: ${pollError.message}`);
      }

      // Create questions and options
      for (const question of questions) {
        const { data: questionData, error: questionError } = await supabase
          .from("poll_questions")
          .insert({
            poll_id: pollData.id,
            question: question.question,
            description: question.description,
            uploaded_file_url: question.uploaded_file_url,
            uploaded_file_name: question.uploaded_file_name,
            uploaded_file_type: question.uploaded_file_type,
            extracted_text: question.extracted_text,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Create options
        const optionsToInsert = question.options.map((option, index) => ({
          question_id: questionData.id,
          option_text: option.option_text,
          option_order: index,
        }));

        const { error: optionsError } = await supabase
          .from("poll_options")
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      await fetchPolls();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create poll"
      );
    }
  };

  const vote = async (questionId: string, optionId: string) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error("User not authenticated - please log in again");
      }

      // Optimistically update the UI first
      setPolls((prevPolls) =>
        prevPolls.map((poll) => ({
          ...poll,
          questions: poll.questions.map((question) => {
            if (question.id === questionId) {
              // Update vote counts optimistically
              const updatedOptions = question.options.map((option) => {
                if (option.id === optionId) {
                  // Add vote to selected option
                  return {
                    ...option,
                    votes: (option.votes || 0) + (question.user_voted ? 0 : 1),
                  };
                } else if (
                  question.user_vote_option_id === option.id &&
                  question.user_voted
                ) {
                  // Remove vote from previously selected option
                  return {
                    ...option,
                    votes: Math.max(0, (option.votes || 0) - 1),
                  };
                }
                return option;
              });

              return {
                ...question,
                options: updatedOptions,
                user_voted: true,
                user_vote_option_id: optionId,
              };
            }
            return question;
          }),
        }))
      );

      // Then update the database in the background
      const { data: existingVote, error: voteCheckError } = await supabase
        .from("poll_votes")
        .select("id")
        .eq("question_id", questionId)
        .eq("user_id", session.user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (voteCheckError) {
        console.warn("Error checking existing vote:", voteCheckError);
      }

      if (existingVote) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from("poll_votes")
          .update({ option_id: optionId })
          .eq("id", existingVote.id);

        if (updateError) {
          console.error("Error updating vote:", updateError);
        }
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from("poll_votes")
          .insert({
            question_id: questionId,
            option_id: optionId,
            user_id: session.user.id,
          });

        if (insertError) {
          console.error("Error creating vote:", insertError);
        }
      }

      // Refresh data silently in background to sync with actual database state
      fetchPolls(false);
    } catch (err) {
      // If voting fails, revert the optimistic update by refetching
      fetchPolls(false);
      throw new Error(err instanceof Error ? err.message : "Failed to vote");
    }
  };

  // Delete a poll by ID
  const deletePoll = async (pollId: string) => {
    // Optimistically remove poll from UI
    setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
    try {
      const { error } = await supabase.from("polls").delete().eq("id", pollId);
      if (error) throw error;
      // Optionally refresh in background to sync with backend
      fetchPolls(false);
    } catch (err) {
      // If backend fails, revert by refetching
      fetchPolls(false);
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete poll"
      );
    }
  };

  // Update a poll's title by ID
  const updatePoll = async (pollId: string, title: string) => {
    try {
      const { error } = await supabase
        .from("polls")
        .update({ title })
        .eq("id", pollId);
      if (error) throw error;
      await fetchPolls();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update poll"
      );
    }
  };

  // Delete a poll question by ID
  const deletePollQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("poll_questions")
        .delete()
        .eq("id", questionId);
      if (error) throw error;
      await fetchPolls();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete poll question"
      );
    }
  };

  // Update a poll question by ID
  const updatePollQuestion = async (
    questionId: string,
    updates: Partial<{ question: string; description?: string }>
  ) => {
    try {
      const { error } = await supabase
        .from("poll_questions")
        .update(updates)
        .eq("id", questionId);
      if (error) throw error;
      await fetchPolls();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update poll question"
      );
    }
  };

  // Delete a poll option by ID
  const deletePollOption = async (optionId: string) => {
    try {
      const { error } = await supabase
        .from("poll_options")
        .delete()
        .eq("id", optionId);
      if (error) throw error;
      await fetchPolls();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete poll option"
      );
    }
  };

  // Update a poll option by ID
  const updatePollOption = async (
    optionId: string,
    updates: Partial<{ option_text: string }>
  ) => {
    try {
      const { error } = await supabase
        .from("poll_options")
        .update(updates)
        .eq("id", optionId);
      if (error) throw error;
      await fetchPolls();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update poll option"
      );
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return {
    polls,
    loading,
    error,
    createPoll,
    vote,
    refetch: fetchPolls,
    // Admin functions:
    deletePoll,
    updatePoll,
    deletePollQuestion,
    updatePollQuestion,
    deletePollOption,
    updatePollOption,
  };
};
