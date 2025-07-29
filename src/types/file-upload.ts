export interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
  extractedText?: string
  textExtractionError?: string
}

export interface FileValidationResult {
  validFiles: File[]
  invalidFiles: File[]
  errors: string[]
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',                    // PDF files
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
  'image/png'                          // PNG files
] as const

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png'] as const

export const FILE_SIZE_LIMIT = 52428800 // 50MB
