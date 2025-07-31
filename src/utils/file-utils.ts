import {
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  type FileValidationResult,
} from "../types";

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateFiles = (fileArray: File[]): FileValidationResult => {
  const validFiles: File[] = [];
  const invalidFiles: File[] = [];
  const errors: string[] = [];

  for (const file of fileArray) {
    const isValidType = (ALLOWED_FILE_TYPES as readonly string[]).includes(
      file.type
    );
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (isValidType || hasValidExtension) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name}: File too large. Maximum size is 50MB.`);
        invalidFiles.push(file);
      } else {
        validFiles.push(file);
      }
    } else {
      errors.push(
        `${file.name}: File type not allowed. Only PDF, DOCX, and Image files are accepted.`
      );
      invalidFiles.push(file);
    }
  }

  return { validFiles, invalidFiles, errors };
};

export const generateUniqueFileName = (originalName: string): string => {
  const fileExt = originalName.split(".").pop();
  return `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
};
