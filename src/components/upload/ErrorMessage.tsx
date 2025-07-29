import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  error: string
  bucketExists: boolean | null
  onRetry?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  bucketExists, 
  onRetry 
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
        <p className="text-red-700">{error}</p>
      </div>
      {bucketExists === false && onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
