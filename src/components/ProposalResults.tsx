
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalData {
  fileName: string;
  proposalContent: string;
  mergedText: string;
}

interface ProposalResultsProps {
  data: ProposalData;
}

const ProposalResults = ({ data }: ProposalResultsProps) => {
  const [proposalContent, setProposalContent] = useState(data.proposalContent || '');

  const downloadProposalAsWord = () => {
    if (!proposalContent) return;
    
    // Create a simple HTML document for Word compatibility
    const wordContent = `
      <html xmlns:v="urn:schemas-microsoft-com:vml" 
            xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Government Proposal</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
          h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 24pt; }
          h2 { font-size: 14pt; font-weight: bold; margin: 18pt 0 12pt 0; }
          h3 { font-size: 12pt; font-weight: bold; margin: 12pt 0 6pt 0; }
          p { margin: 6pt 0; }
          ul, ol { margin: 6pt 0; padding-left: 24pt; }
          li { margin: 3pt 0; }
          .header { text-align: center; margin-bottom: 24pt; }
          .date { text-align: right; margin-bottom: 18pt; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GOVERNMENT PROPOSAL</h1>
        </div>
        <div class="date">
          Date: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <div>
          ${proposalContent
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
          }
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([wordContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Government_Proposal_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Proposal Word document downloaded!');
  };

  const downloadProposalAsText = () => {
    if (!proposalContent) return;
    
    const blob = new Blob([proposalContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Government_Proposal_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Proposal text file downloaded!');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-purple-50 border-b border-purple-100">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <CheckCircle2 className="h-5 w-5" />
            Government Proposal Generated
          </CardTitle>
          <CardDescription className="text-purple-700">
            Your AI-generated government proposal is ready for submission
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="proposal-content" className="text-sm font-semibold text-gray-700 mb-2 block">
              Generated Proposal Content
            </Label>
            <Textarea
              id="proposal-content"
              value={proposalContent}
              onChange={(e) => setProposalContent(e.target.value)}
              className="min-h-[500px] text-sm font-mono border-gray-300 rounded-xl"
              placeholder="AI-generated proposal content will appear here..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={downloadProposalAsWord} 
              variant="outline" 
              className="flex-1 rounded-xl py-3 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Word Document
            </Button>
            
            <Button 
              onClick={downloadProposalAsText} 
              variant="outline" 
              className="flex-1 rounded-xl py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Text File
            </Button>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">Proposal Successfully Generated</h4>
                <p className="text-sm text-purple-800">
                  Your government proposal has been generated by merging your RFQ and Solicitation documents. 
                  Review the content and download in your preferred format.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalResults;
