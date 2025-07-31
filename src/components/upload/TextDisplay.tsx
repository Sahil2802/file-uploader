import React, { useState } from 'react'
import { FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import type { UploadedFile } from '../../types'

interface TextDisplayProps {
  file: UploadedFile
}

export const TextDisplay: React.FC<TextDisplayProps> = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const hasText = file.extractedText && file.extractedText.trim().length > 0
  const hasError = file.textExtractionError

  const copyToClipboard = async () => {
    if (file.extractedText) {
      try {
        await navigator.clipboard.writeText(file.extractedText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    }
  }

  if (!hasText && !hasError) {
    return null
  }

  return (
    <div className="mt-3 border border-gray-200 rounded-lg">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
      >
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            {hasError ? 'Text Extraction Failed' : 'Extracted Text'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {hasText && (
            <span className="text-xs text-gray-500">
              {file.extractedText!.length} characters
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 bg-white rounded-b-lg">
          {hasError ? (
            <div className="text-red-600 text-sm">
              <p className="font-medium">Error extracting text:</p>
              <p className="mt-1">{file.textExtractionError}</p>
            </div>
          ) : (
            <div>
              {/* Copy button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-gray-600" />
                      <span className="text-gray-600">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text content */}
              <div className="bg-gray-50 p-3 rounded border max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {file.extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
