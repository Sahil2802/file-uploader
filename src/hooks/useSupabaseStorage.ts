import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generateUniqueFileName } from '../utils/file-utils'
import { extractTextFromFile } from '../utils/text-extraction'
import type { UploadedFile } from '../types/file-upload'

const FILE_SIZE_LIMIT = 52428800 // 50MB
const BUCKET_NAME = 'uploads'

export const useSupabaseStorage = () => {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check if bucket exists and create it if it doesn't
  const checkBucket = useCallback(async () => {
    try {
      setError(null)
      // Try to list files in the bucket (this will fail if bucket doesn't exist)
      const { error: listError } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1 })
      
      if (listError && listError.message.includes('Bucket not found')) {
        // Try to create the bucket
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: FILE_SIZE_LIMIT,
        })
        
        if (createError) {
          console.error('Failed to create bucket:', createError)
          setBucketExists(false)
          setError(`Failed to create bucket: ${createError.message}. Please create the '${BUCKET_NAME}' bucket manually in your Supabase dashboard.`)
        } else {
          setBucketExists(true)
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
      setError('Failed to check bucket existence. Please check your connection and try again.')
    }
  }, [])

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadedFile[]> => {
    console.log('📤 Starting upload for files:', files.map(f => f.name))
    
    if (files.length === 0) {
      setError('Please select files to upload')
      return []
    }

    setUploading(true)
    setError(null)
    const newUploadedFiles: UploadedFile[] = []

    try {
      for (const file of files) {
        console.log(`📁 Processing file: ${file.name}`)
        const fileName = generateUniqueFileName(file.name)
        console.log(`📝 Generated filename: ${fileName}`)
        
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file)

        if (uploadError) {
          console.error('❌ Upload error:', uploadError)
          // Provide specific error messages for common issues
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error(`Bucket '${BUCKET_NAME}' not found. Please create the '${BUCKET_NAME}' bucket in your Supabase Storage dashboard.`)
          } else if (uploadError.message.includes('The resource was not found')) {
            throw new Error(`Storage bucket '${BUCKET_NAME}' doesn't exist. Please create it in your Supabase dashboard.`)
          } else if (uploadError.message.includes('new row violates row-level security policy')) {
            throw new Error(`Permission denied. Please set up storage policies for the '${BUCKET_NAME}' bucket.`)
          } else {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
          }
        }

        console.log(`✅ File uploaded successfully: ${fileName}`)

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName)

        console.log(`🔗 Public URL generated: ${publicUrl}`)

        // Extract text from PDF/DOCX files
        let extractedText: string | undefined
        let textExtractionError: string | undefined

        const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        const supportedExtensions = ['.pdf', '.docx']
        
        if (supportedTypes.includes(file.type) || supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
          try {
            const textResult = await extractTextFromFile(file)
            if (textResult.success) {
              extractedText = textResult.text
            } else {
              textExtractionError = textResult.error
            }
          } catch (err) {
            textExtractionError = err instanceof Error ? err.message : 'Failed to extract text'
          }
        }

        const uploadedFile: UploadedFile = {
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          ...(extractedText && { extractedText }),
          ...(textExtractionError && { textExtractionError })
        }

        newUploadedFiles.push(uploadedFile)
        console.log(`✨ Added file to uploaded list:`, uploadedFile)
      }

      console.log(`📋 Total files to add to state:`, newUploadedFiles.length)
      setUploadedFiles(prev => {
        console.log(`📊 Previous uploaded files:`, prev.length)
        const updated = [...prev, ...newUploadedFiles]
        console.log(`📊 New uploaded files total:`, updated.length)
        return updated
      })
      return newUploadedFiles
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      return []
    } finally {
      setUploading(false)
    }
  }, [])

  const downloadFile = useCallback(async (file: UploadedFile) => {
    try {
      const response = await fetch(file.url)
      const blob = await response.blob()
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download file')
    }
  }, [])

  const deleteFile = useCallback(async (fileToDelete: UploadedFile) => {
    try {
      // Extract the file path from the URL
      const url = new URL(fileToDelete.url)
      const pathParts = url.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]

      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName])

      if (deleteError) {
        throw new Error(`Failed to delete file: ${deleteError.message}`)
      }

      setUploadedFiles(prev => prev.filter(file => file.url !== fileToDelete.url))
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    }
  }, [])

  return {
    bucketExists,
    uploading,
    uploadedFiles,
    error,
    checkBucket,
    uploadFiles,
    downloadFile,
    deleteFile
  }
}
