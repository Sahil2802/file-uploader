import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { useFileSelection } from '../hooks/useFileSelection'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { useSupabaseStorage } from '../hooks/useSupabaseStorage'
import {
  UploadArea,
  ErrorMessage,
  SetupInstructions,
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

  if (bucketExists === false) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">File Upload</h1>
        <SetupInstructions />
        {error && (
          <div className="mt-4">
            <ErrorMessage 
              error={error} 
              bucketExists={bucketExists} 
              onRetry={checkBucket}
            />
          </div>
        )}
      </div>
    )
  }

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
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
          </Button>
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
