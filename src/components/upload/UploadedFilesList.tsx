import React from 'react'
import { FileText, Image, Download, Trash2 } from 'lucide-react'
import type { UploadedFile } from '../../types/file-upload'
import { formatFileSize } from '../../utils/file-utils'
import { TextDisplay } from './TextDisplay'

interface UploadedFilesListProps {
  files: UploadedFile[]
  onDownload: (file: UploadedFile) => void
  onDelete: (file: UploadedFile) => void
}

export const UploadedFilesList: React.FC<UploadedFilesListProps> = ({
  files,
  onDownload,
  onDelete
}) => {
  const getFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="font-medium text-gray-900 mb-4">Uploaded Files</h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center min-w-0 flex-1">
                {getFileIcon(file)}
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • Uploaded {file.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={() => onDownload(file)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(file)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Text Display Component */}
            <div className="px-4 pb-4">
              <TextDisplay file={file} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
