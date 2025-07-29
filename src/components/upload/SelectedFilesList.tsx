import React from 'react'
import { FileText, Image, X } from 'lucide-react'
import { formatFileSize } from '../../utils/file-utils'

interface SelectedFilesListProps {
  files: File[]
  onRemove: (index: number) => void
}

export const SelectedFilesList: React.FC<SelectedFilesListProps> = ({ 
  files, 
  onRemove 
}) => {
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <h3 className="font-medium text-gray-900 mb-2">Selected Files</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center min-w-0 flex-1">
              {getFileIcon(file)}
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="ml-3 p-1 hover:bg-gray-200 rounded-full"
              title="Remove file"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
