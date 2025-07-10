
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle, CheckCircle2, ArrowRight, Zap, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromPDF } from '@/utils/pdfExtractor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProposalFileUploadProps {
  onProposalGenerated: (result: any) => void;
}

const ProposalFileUpload = ({ onProposalGenerated }: ProposalFileUploadProps) => {
  const { user, subscription, incrementProposalCount, checkSubscription } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rfqFile, setRfqFile] = useState<File | null>(null);
  const [solicitationFile, setSolicitationFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'ready' | 'processing' | 'complete' | 'error'>('idle');

  const proposalCount = subscription.proposal_count || 0;
  const proposalLimit = subscription.proposal_limit;
  const canGenerate = proposalLimit === null || proposalCount < proposalLimit;

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>, fileType: 'rfq' | 'solicitation') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - now including .doc files
      const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, Word (.doc/.docx), or text file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      if (fileType === 'rfq') {
        setRfqFile(file);
      } else {
        setSolicitationFile(file);
      }

      // Check if both files are uploaded
      const bothFilesReady = (fileType === 'rfq' ? file : rfqFile) && (fileType === 'solicitation' ? file : solicitationFile);
      if (bothFilesReady) {
        setProcessingStatus('ready');
      }
    }
  }, [rfqFile, solicitationFile]);

  const extractTextContent = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    } else if (fileName.endsWith('.txt')) {
      return await file.text();
    } else if (fileName.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (fileName.endsWith('.doc')) {
      // For legacy .doc files, try to read as text
      const text = await file.text();
      return text.substring(0, 25000);
    } else {
      const text = await file.text();
      return text.substring(0, 25000);
    }
  };

  const handleGenerateProposal = async () => {
    if (!rfqFile || !solicitationFile) {
      toast.error('Please upload both RFQ and Solicitation documents');
      return;
    }

    if (!user) {
      toast.error('Please sign in to generate proposals');
      return;
    }

    if (!canGenerate) {
      toast.error('Usage limit reached. Please upgrade your plan to continue generating proposals.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('processing');
    setUploadProgress(0);

    try {
      // Double-check usage limit before generation
      if (!canGenerate) {
        throw new Error('Usage limit reached. Please upgrade your plan to continue generating proposals.');
      }

      // Increment usage count FIRST to prevent concurrent usage
      await incrementProposalCount();
      setUploadProgress(10);

      // Extract text from both files
      setUploadProgress(30);
      const rfqText = await extractTextContent(rfqFile);
      
      setUploadProgress(50);
      const solicitationText = await extractTextContent(solicitationFile);

      // Merge the documents
      const mergedText = `RFQ DOCUMENT:\n${rfqText}\n\nSOLICITATION DOCUMENT:\n${solicitationText}`;

      setUploadProgress(70);

      // Call the edge function to generate proposal
      const { data, error } = await supabase.functions.invoke('generate-proposal', {
        body: {
          mergedText,
          rfqFileName: rfqFile.name,
          solicitationFileName: solicitationFile.name
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate proposal');
      }

      setUploadProgress(100);
      setProcessingStatus('complete');
      toast.success('Government proposal generated successfully!');
      
      onProposalGenerated({
        fileName: `Proposal_${rfqFile.name}_${solicitationFile.name}`,
        proposalContent: data.proposalContent,
        mergedText: mergedText
      });
    } catch (error) {
      setProcessingStatus('error');
      toast.error('Failed to generate proposal: ' + (error as Error).message);
      console.error('Processing error:', error);
      
      // If generation failed, refresh subscription to get accurate count
      setTimeout(async () => {
        await checkSubscription();
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (fileType: 'rfq' | 'solicitation') => {
    const file = fileType === 'rfq' ? rfqFile : solicitationFile;
    if (file) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <Upload className="h-5 w-5 text-gray-400" />;
  };

  const getRemainingText = () => {
    if (proposalLimit === null) return 'Unlimited';
    return `${Math.max(0, proposalLimit - proposalCount)} remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Usage Alert */}
      {!subscription.subscribed ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Demo Mode: {proposalCount}/{proposalLimit || 1} proposal generations used.
            {!canGenerate && (
              <span className="text-red-600 font-medium ml-2">
                Upgrade to continue generating proposals.
              </span>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            {subscription.plan} Plan: {getRemainingText()} proposal generations.
          </AlertDescription>
        </Alert>
      )}

      {/* RFQ File Upload */}
      <div className="space-y-3">
        <Label htmlFor="rfq-upload" className="text-sm font-semibold text-gray-700">RFQ Document</Label>
        <div className="relative">
          <Input
            id="rfq-upload"
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => handleFileSelect(e, 'rfq')}
            disabled={isProcessing}
            className="cursor-pointer border-2 border-dashed border-purple-300 rounded-xl p-4 h-auto file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>
        {rfqFile && (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            {getStatusIcon('rfq')}
            <div className="flex-1">
              <p className="font-medium text-green-900">{rfqFile.name}</p>
              <p className="text-xs text-green-700">RFQ document uploaded</p>
            </div>
          </div>
        )}
      </div>

      {/* Solicitation File Upload */}
      <div className="space-y-3">
        <Label htmlFor="solicitation-upload" className="text-sm font-semibold text-gray-700">Government Solicitation</Label>
        <div className="relative">
          <Input
            id="solicitation-upload"
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => handleFileSelect(e, 'solicitation')}
            disabled={isProcessing}
            className="cursor-pointer border-2 border-dashed border-purple-300 rounded-xl p-4 h-auto file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>
        {solicitationFile && (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            {getStatusIcon('solicitation')}
            <div className="flex-1">
              <p className="font-medium text-green-900">{solicitationFile.name}</p>
              <p className="text-xs text-green-700">Solicitation document uploaded</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Supported: PDF, Word (.doc/.docx), Text files • Maximum 10MB per file
      </p>

      {/* Generate Button */}
      {processingStatus === 'ready' && (
        <Button 
          onClick={handleGenerateProposal}
          disabled={isProcessing || !canGenerate}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3"
        >
          {!canGenerate ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Upgrade to Generate Proposal
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Generate Government Proposal
            </>
          )}
        </Button>
      )}

      {/* Processing Progress */}
      {processingStatus === 'processing' && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Generating Proposal...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full h-2" />
        </div>
      )}

      {/* Error State */}
      {processingStatus === 'error' && (
        <Button 
          onClick={handleGenerateProposal}
          variant="outline"
          disabled={!canGenerate}
          className="w-full rounded-xl py-3 border-red-300 text-red-700 hover:bg-red-50"
        >
          {canGenerate ? 'Retry Proposal Generation' : 'Upgrade to Generate Proposals'}
        </Button>
      )}

      {/* Usage limit reached message */}
      {!canGenerate && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <Lock className="h-4 w-4 inline mr-2" />
            You've reached your proposal generation limit. Upgrade your plan to continue generating proposals.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProposalFileUpload;
