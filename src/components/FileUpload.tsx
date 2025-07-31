import React, { useEffect } from 'react'
import { useFileSelection } from '../hooks/useFileSelection'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { useSupabaseStorage } from '../hooks/useSupabaseStorage'
import {
  UploadArea,
  ErrorMessage,
  SelectedFilesList,
  UploadedFilesList
} from './upload'

const FileUpload: React.FC = () => {
  const {
    selectedFiles,
    validationErrors,
    addFiles,
    removeFile,
    clearFiles
  } = useFileSelection()

  const { isDragActive, dragHandlers } = useDragAndDrop({
    onFilesDropped: addFiles
  })

  const {
    uploadedFiles,
    bucketExists,
    error,
    uploading,
    checkBucket,
    uploadFiles,
    downloadFile,
    deleteFile
  } = useSupabaseStorage()

  useEffect(() => {
    checkBucket()
  }, [checkBucket])

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    
    const uploadedFiles = await uploadFiles(selectedFiles)
    if (uploadedFiles.length > 0) {
      clearFiles()
    }
  }

  // Removed bucket check - just show the main interface
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">File Upload</h1>
      
      {/* Upload Area */}
      <UploadArea
        isDragActive={isDragActive}
        onFileSelect={addFiles}
        dragHandlers={dragHandlers}
      />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 space-y-2">
          {validationErrors.map((error, index) => (
            <ErrorMessage 
              key={index} 
              error={error} 
              bucketExists={bucketExists} 
            />
          ))}
        </div>
      )}

      {/* Other Errors */}
      {error && (
        <div className="mt-4">
          <ErrorMessage 
            error={error} 
            bucketExists={bucketExists} 
            onRetry={checkBucket}
          />
        </div>
      )}

      {/* Selected Files */}
      <SelectedFilesList 
        files={selectedFiles} 
        onRemove={removeFile} 
      />

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}

      {/* Uploaded Files */}
      <UploadedFilesList 
        files={uploadedFiles}
        onDownload={downloadFile}
        onDelete={deleteFile}
      />
    </div>
  )
}

export default FileUpload
