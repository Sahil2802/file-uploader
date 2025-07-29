import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, X, Trash2, Download, File, AlertCircle } from 'lucide-react'

interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
}

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)

  // Check if bucket exists and create it if it doesn't
  const ensureBucketExists = async () => {
    try {
      // Try to list files in the bucket (this will fail if bucket doesn't exist)
      const { error: listError } = await supabase.storage.from('uploads').list('', { limit: 1 })
      
      if (listError && listError.message.includes('Bucket not found')) {
        // Try to create the bucket
        const { error: createError } = await supabase.storage.createBucket('uploads', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        })
        
        if (createError) {
          console.error('Failed to create bucket:', createError)
          setBucketExists(false)
          setError(`Failed to create bucket: ${createError.message}. Please create the 'uploads' bucket manually in your Supabase dashboard.`)
        } else {
          setBucketExists(true)
          setError(null)
        }
      } else if (!listError) {
        setBucketExists(true)
      } else {
        setBucketExists(false)
        setError(`Storage error: ${listError.message}`)
      }
    } catch (err) {
      console.error('Error checking bucket:', err)
      setBucketExists(false)
    }
  }

  // Check bucket on component mount
  React.useEffect(() => {
    ensureBucketExists()
  }, [])

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      setFiles(prevFiles => [...prevFiles, ...fileArray])
      setError(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('Please select files to upload')
      return
    }

    setUploading(true)
    setError(null)
    const newUploadedFiles: UploadedFile[] = []

    try {
      for (const file of files) {
        // Generate unique filename to avoid conflicts
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('uploads') // Using the 'uploads' bucket you created
          .upload(fileName, file)

        if (uploadError) {
          // Provide specific error messages for common issues
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error(`Bucket 'uploads' not found. Please create the 'uploads' bucket in your Supabase Storage dashboard.`)
          } else if (uploadError.message.includes('The resource was not found')) {
            throw new Error(`Storage bucket 'uploads' doesn't exist. Please create it in your Supabase dashboard.`)
          } else if (uploadError.message.includes('new row violates row-level security policy')) {
            throw new Error(`Permission denied. Please set up storage policies for the 'uploads' bucket.`)
          } else {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
          }
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName)

        newUploadedFiles.push({
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        })
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles])
      setFiles([]) // Clear selected files after successful upload
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteUploadedFile = async (file: UploadedFile, index: number) => {
    try {
      // Extract filename from URL
      const urlParts = file.url.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('uploads')
        .remove([fileName])

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`)
      }

      // Remove from local state
      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Upload</h1>
        <p className="text-gray-600">Upload your files to Supabase Storage</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-xl font-medium text-gray-900 mb-2">
            Drag and drop files here
          </p>
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
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-4">
            Support for multiple files. Max file size: 50MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
          {bucketExists === false && (
            <button
              onClick={ensureBucketExists}
              className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-3 mb-6">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.length} file{files.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {file.name}
                      </a>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.uploadedAt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-2 hover:bg-green-100 rounded transition-colors"
                      title="Download file"
                    >
                      <Download className="h-4 w-4 text-green-600" />
                    </a>
                    <button
                      onClick={() => deleteUploadedFile(file, index)}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}

export default FileUpload
