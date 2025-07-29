import { useState, useCallback } from 'react'
import { validateFiles } from '../utils/file-utils'

export const useFileSelection = () => {
  const [files, setFiles] = useState<File[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const addFiles = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.isArray(selectedFiles) ? selectedFiles : Array.from(selectedFiles)
    const { validFiles, errors } = validateFiles(fileArray)
    
    // Set validation errors
    setValidationErrors(errors)
    
    // Only add valid files
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles])
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(files => files.filter((_, i) => i !== index))
    // Clear validation errors when files are removed
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }, [validationErrors.length])

  const clearFiles = useCallback(() => {
    setFiles([])
    setValidationErrors([])
  }, [])

  return {
    selectedFiles: files,
    validationErrors,
    addFiles,
    removeFile,
    clearFiles
  }
}
