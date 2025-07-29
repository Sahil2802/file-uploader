import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker to use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface TextExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Extract text from PDF file
 */
export const extractPdfText = async (file: File): Promise<TextExtractionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      const pageText = textContent.items
        .map((item) => 'str' in item ? item.str : '')
        .join(' ')
      
      fullText += `Page ${pageNum}:\n${pageText}\n\n`
    }
    
    return {
      success: true,
      text: fullText.trim()
    }
  } catch (error) {
    console.error('PDF text extraction error:', error)
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to extract PDF text'
    }
  }
}

/**
 * Extract text from DOCX file
 */
export const extractDocxText = async (file: File): Promise<TextExtractionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    return {
      success: true,
      text: result.value
    }
  } catch (error) {
    console.error('DOCX text extraction error:', error)
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to extract DOCX text'
    }
  }
}

/**
 * Extract text from supported file types
 */
export const extractTextFromFile = async (file: File): Promise<TextExtractionResult> => {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractPdfText(file)
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractDocxText(file)
  } else {
    return {
      success: false,
      text: '',
      error: 'Unsupported file type for text extraction'
    }
  }
}
