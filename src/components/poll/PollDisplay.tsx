import React, { useState } from 'react';
import type { PollQuestion } from '../../types';
import { ChevronDown, ChevronUp, Pencil, Trash, Download } from 'lucide-react';
import { ChartContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from '../ui/chart';
import { usePolls } from '../../hooks/usePolls';
import { supabase } from '../../lib/supabase';

interface PollDisplayProps {
  question: PollQuestion;
  onVote: (questionId: string, optionId: string) => Promise<void>;
  isAdmin?: boolean;
  onDeleteQuestion?: (questionId: string) => void;
}

export const PollDisplay: React.FC<PollDisplayProps> = ({ question, onVote, isAdmin, onDeleteQuestion }) => {
  const { updatePollQuestion, deletePollQuestion, updatePollOption } = usePolls();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'vote' | 'results'>('vote');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(question.question);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [optionInput, setOptionInput] = useState('');

  const handleVote = async (optionId: string) => {
    try {
      // Call the vote function without waiting or showing loading
      onVote(question.id, optionId).catch((error) => {
        console.error('Vote failed:', error);
        // Optionally show a subtle error message without blocking the UI
      });
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleDownload = async () => {
    if (!question.uploaded_file_url) return;
    
    try {
      // Extract the file path from the URL
      const url = new URL(question.uploaded_file_url);
      const path = url.pathname.split('/').slice(-2).join('/'); // Get user_id/filename
      
      // Download the file from Supabase storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .download(path);
      
      if (error) {
        console.error('Download error:', error);
        alert('Failed to download file');
        return;
      }
      
      // Create a download link
      const blob = new Blob([data]);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = question.uploaded_file_name || 'downloaded-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const totalVotes = question.options.reduce((sum, option) => sum + (option.votes || 0), 0);

  // Prepare data for the chart
  const chartData = question.options.map(option => ({
    name: option.option_text,
    votes: option.votes || 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-200">
      {/* Poll Header - Always visible */}
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1">
          {editingTitle ? (
            <form
              onSubmit={async e => {
                e.preventDefault();
                await updatePollQuestion(question.id, { question: titleInput });
                setEditingTitle(false);
                // Update the question object to reflect the change immediately
                question.question = titleInput;
              }}
              className="flex gap-2 items-center"
              onClick={e => e.stopPropagation()}
            >
              <input
                className="border rounded px-2 py-1 text-lg font-semibold text-gray-900"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="text-blue-600 text-sm cursor-pointer">Save</button>
              <button type="button" className="text-red-500 text-sm cursor-pointer" onClick={e => { e.stopPropagation(); setEditingTitle(false); setTitleInput(question.question); }}>Cancel</button>
            </form>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Created on {new Date(question.created_at).toLocaleDateString()} • {totalVotes} votes
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {isAdmin && !editingTitle && (
            <>
              <button
                className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                aria-label="Edit question"
                onClick={e => { e.stopPropagation(); setEditingTitle(true); }}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                aria-label="Delete question"
                onClick={e => { e.stopPropagation(); setDeletingQuestion(true); }}
              >
                <Trash className="w-4 h-4" />
              </button>
            </>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
          )}
        </div>
      </div>
      {/* Delete confirmation dialog for poll question */}
      {isAdmin && deletingQuestion && (
        <div className="p-4 bg-red-50 border-t border-b border-red-200 flex items-center justify-between">
          <span>Are you sure you want to delete this poll?</span>
          <div className="flex gap-2">
            <button className="text-xs text-red-600" onClick={async e => {
              e.stopPropagation();
              if (onDeleteQuestion) {
                await onDeleteQuestion(question.id);
              }
              setDeletingQuestion(false);
            }}>Delete</button>
            <button className="text-xs text-gray-600" onClick={e => { e.stopPropagation(); setDeletingQuestion(false); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Poll Content - Collapsible */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Description Section */}
          {question.description && (
            <div className="p-4 border-b border-gray-100">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                {/* Show image if it's an image file */}
                {question.uploaded_file_url && question.uploaded_file_type?.startsWith('image/') && (
                  <div className="mb-3">
                    <img
                      src={question.uploaded_file_url}
                      alt="Uploaded image"
                      className="max-w-full h-auto max-h-64 rounded border mx-auto"
                    />
                  </div>
                )}
                <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {question.description}
                </div>
                {question.uploaded_file_url && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Attached file:</span>
                        <span className="text-xs font-medium text-gray-700">{question.uploaded_file_name}</span>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="flex items-center space-x-1 text-xs text-blue-600 hover:underline cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'vote' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('vote')}
            >
              Vote
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'results' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('results')}
            >
              Results
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'vote' && (
            <div className="p-4">
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div key={option.id} className={`border border-gray-200 rounded-lg p-3 flex items-center justify-between ${question.user_voted && question.user_vote_option_id === option.id ? 'bg-blue-50 border-blue-500' : ''}`}>
                    <div className="flex-1">
                      {editingOptionId === option.id ? (
                        <form
                          onSubmit={async e => {
                            e.preventDefault();
                            await updatePollOption(option.id, { option_text: optionInput });
                            setEditingOptionId(null);
                            // Update the option object to reflect the change immediately
                            option.option_text = optionInput;
                          }}
                          className="flex gap-2 items-center"
                        >
                          <input
                            className="border rounded px-2 py-1 text-gray-900"
                            value={optionInput}
                            onChange={e => setOptionInput(e.target.value)}
                            autoFocus
                          />
                          <button type="submit" className="text-blue-600 text-xs cursor-pointer">Save</button>
                          <button type="button" className="text-gray-500 text-xs cursor-pointer" onClick={() => setEditingOptionId(null)}>Cancel</button>
                        </form>
                      ) : !question.user_voted ? (
                        <button
                          onClick={() => handleVote(option.id)}
                          className="w-full text-left hover:bg-gray-50 transition-colors rounded p-2"
                        >
                          <span className="text-gray-700">{option.option_text}</span>
                        </button>
                      ) : (
                        <span className="text-gray-700">{option.option_text}</span>
                      )}
                    </div>
                    {isAdmin && editingOptionId !== option.id && (
                      <div className="flex gap-2 ml-2">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                          aria-label="Edit option"
                          onClick={() => { setEditingOptionId(option.id); setOptionInput(option.option_text); }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {question.user_voted && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-green-600 font-medium">
                    Thank you for voting! Total votes: {totalVotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="p-4">
              {/* Results Chart */}
              <ChartContainer className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="text-center text-xs text-gray-500 mt-2">
                Total votes: {totalVotes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
