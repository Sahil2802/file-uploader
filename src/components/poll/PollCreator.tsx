import React, { useState } from 'react';
import type { PollQuestion } from '../../types';
import { Button } from '../ui/button';
import { useSupabaseStorage } from '../../hooks/useSupabaseStorage';
import { validateFiles } from '../../utils/file-utils';
import { Upload, X, FileText, Image, ChevronDown, ChevronUp } from 'lucide-react';

interface PollCreatorProps {
  onCreatePoll: (title: string, questions: Omit<PollQuestion, 'id' | 'poll_id' | 'created_at'>[]) => Promise<void>;
  onCancel: () => void;
}

export const PollCreator: React.FC<PollCreatorProps> = ({ onCreatePoll, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  
  const { uploadFiles } = useSupabaseStorage();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Validate file
      const validation = validateFiles([file]);
      if (validation.invalidFiles.length > 0) {
        alert(validation.errors.join('\n'));
        return;
      }

      // Upload file to Supabase
      const uploadedFiles = await uploadFiles([file]);
      if (uploadedFiles.length === 0) {
        throw new Error('File upload failed');
      }
      
      const uploadedFileData = uploadedFiles[0];
      setUploadedFile(file);
      setFileUrl(uploadedFileData.url);

      // Use extracted text if available, or show image in description
      if (uploadedFileData.extractedText) {
        setExtractedText(uploadedFileData.extractedText);
        setDescription(uploadedFileData.extractedText); // Auto-set as description
        setShowExtractedText(true); // Show the accordion
      } else if (file.type.startsWith('image/')) {
        // For images, use the filename as description and show the accordion
        setExtractedText('');
        setDescription(`Image: ${file.name}`);
        setShowExtractedText(true); // Show the accordion to display the image
      } else if (uploadedFileData.textExtractionError) {
        console.error('Text extraction failed:', uploadedFileData.textExtractionError);
        setExtractedText('');
      } else {
        setExtractedText('');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileUrl('');
    setExtractedText('');
    setDescription(''); // Clear description when file is removed
    setShowExtractedText(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (options.some(opt => !opt.trim())) {
      alert('Please fill in all four options');
      return;
    }

    try {
      setIsCreating(true);
      
      const pollQuestion: Omit<PollQuestion, 'id' | 'poll_id' | 'created_at'> = {
        question: question.trim(),
        description: description.trim() || undefined,
        uploaded_file_url: fileUrl || undefined,
        uploaded_file_name: uploadedFile?.name || undefined,
        uploaded_file_type: uploadedFile?.type || undefined,
        extracted_text: extractedText || undefined,
        options: options.map((text, index) => ({
          id: '', // Will be set by database
          option_text: text.trim(),
          option_order: index
        }))
      };

      await onCreatePoll('', [pollQuestion]);
      
      // Reset form
      setQuestion('');
      setDescription('');
      setOptions(['', '', '', '']);
      removeFile();
    } catch (error) {
      console.error('Failed to create poll:', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderFilePreview = () => {
    if (!uploadedFile) return null;

    const isImage = uploadedFile.type.startsWith('image/');
    const isPdf = uploadedFile.type === 'application/pdf';
    const isDocx = uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return (
      <div className="mt-4 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isImage && <Image className="w-5 h-5 text-blue-500" />}
            {(isPdf || isDocx) && <FileText className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-medium text-gray-700">{uploadedFile.name}</span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isImage && fileUrl && (
          <div className="mt-2">
            <img
              src={fileUrl}
              alt="Uploaded preview"
              className="max-w-full h-auto max-h-64 rounded border"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create a New Poll</h2>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your poll question..."
          />
        </div>

        {/* Accordion for extracted text description or image */}
        {(extractedText || (uploadedFile && uploadedFile.type.startsWith('image/'))) && (
          <div className="border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setShowExtractedText(!showExtractedText)}
              className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {extractedText ? 'Description (from uploaded file)' : 'Uploaded Image'}
              </span>
              {showExtractedText ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {showExtractedText && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                {extractedText ? (
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-600 whitespace-pre-wrap">
                    {extractedText}
                  </div>
                ) : uploadedFile && uploadedFile.type.startsWith('image/') && fileUrl ? (
                  <div className="text-center">
                    <img
                      src={fileUrl}
                      alt="Uploaded image"
                      className="max-w-full h-auto max-h-64 rounded border mx-auto"
                    />
                    <p className="text-sm text-gray-600 mt-2">{uploadedFile.name}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.png,.jpg,.jpeg,.gif,.webp,image/*"
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload PDF, DOCX, or Image files'}
              </span>
            </label>
          </div>
          {renderFilePreview()}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options (4 required)
          </label>
          {options.map((option, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors" 
          disabled={isCreating || isUploading}
        >
          {isCreating ? 'Creating Poll...' : 'Create Poll'}
        </Button>
      </form>
    </div>
  );
};
