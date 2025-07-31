// File upload types
export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  extractedText?: string;
  textExtractionError?: string;
}

export interface FileValidationResult {
  validFiles: File[];
  invalidFiles: File[];
  errors: string[];
}

// User and role types
export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export const ALLOWED_FILE_TYPES = [
  "application/pdf", // PDF files
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
  "image/png", // PNG files
  "image/jpeg", // JPEG files
  "image/jpg", // JPG files
  "image/gif", // GIF files
  "image/webp", // WebP files
];

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Polling system types
export interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  votes?: number; // Calculated field
}

export interface PollQuestion {
  id: string;
  poll_id: string;
  question: string;
  description?: string;
  uploaded_file_url?: string;
  uploaded_file_name?: string;
  uploaded_file_type?: string;
  extracted_text?: string;
  options: PollOption[];
  created_at: string;
  user_voted?: boolean; // Calculated field
  user_vote_option_id?: string; // Calculated field
}

export interface Poll {
  id: string;
  title: string;
  questions: PollQuestion[];
  created_by: string;
  created_at: string;
  updated_at: string;
}
