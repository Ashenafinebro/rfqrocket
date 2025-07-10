
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, AlertCircle, CheckCircle2, Eye, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromPDF } from '@/utils/pdfExtractor';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onFileProcessed: (result: any) => void;
}

const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploaded' | 'extracted' | 'processing' | 'complete' | 'error'>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, Word (.docx), or text file');
        return;
      }

      // Check specifically for legacy .doc files
      if (file.name.toLowerCase().endsWith('.doc')) {
        toast.error('Legacy .doc files are not supported. Please save as .docx format and try again.');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
      setExtractedText('');
      setExtractionError(null);
      setProcessingStatus('uploaded');
    }
  }, []);

  const handleExtractText = async () => {
    if (!uploadedFile) return;

    setIsExtracting(true);
    setExtractionError(null);

    try {
      let text = '';
      
      if (uploadedFile.name.toLowerCase().endsWith('.pdf')) {
        text = await extractTextFromPDF(uploadedFile);
      } else if (uploadedFile.name.toLowerCase().endsWith('.docx')) {
        // Use mammoth for .docx files
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        text = await uploadedFile.text();
      }

      setExtractedText(text);
      setProcessingStatus('extracted');
      toast.success('Text extracted successfully! Review it before processing.');
    } catch (error) {
      const errorMessage = (error as Error).message;
      setExtractionError(errorMessage);
      toast.error('Failed to extract text: ' + errorMessage);
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleProcessWithOpenAI = async () => {
    if (!extractedText.trim()) {
      toast.error('No text to process');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('processing');
    setUploadProgress(0);

    try {
      // Simulate progress
      for (let i = 0; i <= 50; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          extractedText,
          fileName: uploadedFile?.name || 'document'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process document');
      }

      setUploadProgress(100);
      setProcessingStatus('complete');
      toast.success('RFQ generated successfully!');
      
      onFileProcessed({
        fileName: data.fileName,
        rfqContent: data.rfqContent,
        extractedText: data.extractedText
      });
    } catch (error) {
      setProcessingStatus('error');
      toast.error('Failed to process with AI: ' + (error as Error).message);
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'extracted':
        return <Eye className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (processingStatus) {
      case 'idle':
        return 'Ready to upload';
      case 'uploaded':
        return 'File uploaded - extract text to preview';
      case 'extracted':
        return 'Text extracted - review before processing';
      case 'processing':
        return 'Processing with AI...';
      case 'complete':
        return 'RFQ generated successfully';
      case 'error':
        return 'Processing failed';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="file-upload" className="text-sm font-semibold text-gray-700">Select Document</Label>
        <div className="relative">
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            disabled={isProcessing || isExtracting}
            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 h-auto file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <p className="text-xs text-gray-500">
          Supported: PDF, Word (.docx), Text files • Maximum 10MB
        </p>
      </div>

      {uploadedFile && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {getStatusIcon()}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>

          {processingStatus === 'uploaded' && (
            <Button 
              onClick={handleExtractText}
              disabled={isExtracting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3"
            >
              {isExtracting ? (
                <>
                  <FileText className="mr-2 h-4 w-4 animate-pulse" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Extract & Preview Text
                </>
              )}
            </Button>
          )}

          {processingStatus === 'extracted' && (
            <Button 
              onClick={handleProcessWithOpenAI}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Generate Professional RFQ
            </Button>
          )}

          {processingStatus === 'processing' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Processing Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full h-2" />
            </div>
          )}
        </div>
      )}

      {processingStatus === 'error' && (
        <Button 
          onClick={handleProcessWithOpenAI}
          variant="outline"
          className="w-full rounded-xl py-3 border-red-300 text-red-700 hover:bg-red-50"
          disabled={!extractedText}
        >
          Retry Processing
        </Button>
      )}

      {extractionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Extraction Failed</h4>
              <p className="text-sm text-red-700 whitespace-pre-line">{extractionError}</p>
            </div>
          </div>
        </div>
      )}

      {processingStatus === 'extracted' && extractedText && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Eye className="h-5 w-5" />
              Extracted Document Content
            </CardTitle>
            <CardDescription>
              Review and edit the extracted text before AI processing
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="min-h-[400px] text-sm font-mono border-gray-300 rounded-xl"
              placeholder="Extracted text will appear here..."
            />
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Characters: {extractedText.length.toLocaleString()}</span>
              <span>Editable before processing</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
