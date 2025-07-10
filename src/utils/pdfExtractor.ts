
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Use CDN worker path (easiest fix for Vite compatibility)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF text extraction:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('File appears to be empty or corrupted');
    }
    
    console.log('File loaded into ArrayBuffer:', arrayBuffer.byteLength, 'bytes');
    
    // Create Uint8Array from ArrayBuffer
    const typedArray = new Uint8Array(arrayBuffer);
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    console.log('PDF document loaded successfully:', {
      numPages: pdf.numPages
    });
    
    let allText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        console.log(`Processing page ${i}/${pdf.numPages}`);
        
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        
        if (pageText.trim().length > 0) {
          allText += pageText + '\n\n';
          console.log(`Page ${i} extracted: ${pageText.length} characters`);
        } else {
          console.warn(`Page ${i} contains no readable text`);
        }
        
      } catch (pageError) {
        console.warn(`Failed to process page ${i}:`, pageError);
        continue;
      }
    }
    
    // Clean up and normalize the extracted text
    const extractedText = allText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s+/g, '\n') // Clean up line breaks
      .trim();
    
    console.log('Text extraction completed:', {
      totalPages: pdf.numPages,
      totalCharacters: extractedText.length,
      preview: extractedText.substring(0, 200) + '...'
    });
    
    // Validate extracted text
    if (!extractedText || extractedText.length === 0) {
      throw new Error('No readable text was found in this PDF. The document may contain only images, be password-protected, or have an unsupported format.');
    }
    
    if (extractedText.length < 20) {
      throw new Error('Very little text was extracted from the PDF. Please ensure the document contains readable text content and is not a scanned image.');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('PDF text extraction error:', error);
    
    // Enhanced error handling
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('invalid pdf') || errorMessage.includes('corrupted')) {
        throw new Error('The uploaded file is not a valid PDF document or may be corrupted. Please try uploading a different PDF file.');
      } else if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
        throw new Error('This PDF is password-protected or encrypted. Please provide an unprotected version of the document.');
      } else if (errorMessage.includes('no readable text') || errorMessage.includes('very little text')) {
        throw error; // Re-throw our custom validation errors
      } else if (errorMessage.includes('empty') || errorMessage.includes('file size')) {
        throw error; // Re-throw file validation errors
      } else {
        throw new Error(`PDF processing failed: ${error.message}. Please try with a different PDF file or contact support if the issue persists.`);
      }
    }
    
    throw new Error('An unexpected error occurred while processing the PDF. Please try again with a different file.');
  }
};
