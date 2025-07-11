
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProcessedData {
  fileName: string;
  rfqContent: string;
  extractedText: string;
}

interface FileUploadProps {
  onFileProcessed: (data: ProcessedData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const { user, subscription, incrementRFQCount } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const canGenerateRFQ = () => {
    if (subscription.subscribed) {
      return subscription.rfq_limit === null || subscription.rfq_count < subscription.rfq_limit;
    }
    // Demo users can only generate 1 RFQ
    return subscription.rfq_count < 1;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!canGenerateRFQ()) {
      toast.error('You have reached your RFQ generation limit. Please upgrade to continue.');
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    processFile(file);
  };

  const processFile = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to process files.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // First increment the usage count
      await incrementRFQCount();

      // Extract text from file (simplified - in real app you'd use proper text extraction)
      const text = await extractTextFromFile(file);
      
      // Process with Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          extractedText: text,
          fileName: file.name
        }
      });

      if (error) {
        throw error;
      }

      if (data) {
        onFileProcessed({
          fileName: file.name,
          rfqContent: data.rfqContent,
          extractedText: data.extractedText
        });
        
        toast.success('Document processed successfully!');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simplified text extraction - in a real app you'd use libraries like pdf-parse, mammoth, etc.
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // For other file types, return filename as placeholder
    return `File: ${file.name}\nThis is a placeholder for extracted text content.`;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in Required</h3>
            <p className="text-gray-600">Please sign in to upload and process documents.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canGenerateRFQ()) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              You have used all your RFQ generations for your current plan.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        {isProcessing ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-900 mb-2">Processing Document...</p>
            <p className="text-gray-600">Please wait while we extract and analyze your document.</p>
          </div>
        ) : uploadedFile ? (
          <div>
            <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-gray-900 mb-2">File Ready</p>
            <p className="text-gray-600">{uploadedFile.name}</p>
          </div>
        ) : (
          <div>
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Your Solicitation Document
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, DOC, DOCX, and TXT files (max 10MB)
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
