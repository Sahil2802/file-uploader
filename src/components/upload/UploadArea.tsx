import React from 'react'
import { Upload } from 'lucide-react'
import { ALLOWED_EXTENSIONS } from '../../types/file-upload'

interface UploadAreaProps {
  isDragActive: boolean
  onFileSelect: (files: FileList) => void
  dragHandlers: {
    onDragEnter: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
  }
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  isDragActive,
  onFileSelect,
  dragHandlers
}) => {
  const { onDragEnter, onDragLeave, onDragOver, onDrop } = dragHandlers

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileSelect(e.target.files)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-xl font-medium text-gray-900 mb-2">
          Drag and drop files here
        </p>
        <p className="text-sm text-gray-500 mb-4">PDF, DOCX, PNG files only</p>
        <div className="flex justify-center space-x-2 mb-4">
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">PDF</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">DOCX</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">PNG</span>
        </div>
        <p className="text-gray-600 mb-4">or</p>
        <label htmlFor="file-input">
          <div className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </div>
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <p className="text-sm text-gray-500 mt-4">
          Only PDF, DOCX, and PNG files allowed. Max file size: 50MB
        </p>
        <p className="text-xs text-gray-400 mt-2">
          ✨ Text will be automatically extracted from PDF and DOCX files
        </p>
      </div>
    </div>
  )
}
