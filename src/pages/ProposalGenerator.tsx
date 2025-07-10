
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Zap, Download, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProposalFileUpload from '@/components/ProposalFileUpload';
import ProposalResults from '@/components/ProposalResults';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProposalData {
  fileName: string;
  proposalContent: string;
  mergedText: string;
}

const ProposalGenerator = () => {
  const { user, subscription } = useAuth();
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);

  const isDemo = !subscription.subscribed;
  const proposalCount = subscription.proposal_count || 0;
  const proposalLimit = subscription.proposal_limit;
  const canGenerate = proposalLimit === null || proposalCount < proposalLimit;

  const handleProposalGenerated = (data: ProposalData) => {
    setProposalData(data);
  };

  const getRemainingText = () => {
    if (proposalLimit === null) return 'Unlimited';
    return `${Math.max(0, proposalLimit - proposalCount)} remaining`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Government Proposal Generator</h1>
              <p className="text-gray-600 mt-1">
                Generate professional government proposals from RFQ and Solicitation documents
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isDemo ? "secondary" : "default"} className="px-3 py-1">
                {isDemo ? '🆓 Free Demo' : `⭐ ${subscription.plan}`}
              </Badge>
              <Link to="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Usage Status Banner */}
        {isDemo ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">Demo Mode Active</h3>
                <p className="text-amber-700 text-sm mt-1">
                  You have {getRemainingText()} proposal generations left in demo mode.
                  {!canGenerate && ' Upgrade to Professional for unlimited access and download capabilities.'}
                </p>
              </div>
              {!canGenerate && (
                <Link to="/pricing">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Upgrade Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">{subscription.plan} Plan Active</h3>
                <p className="text-green-700 text-sm mt-1">
                  Proposals: {getRemainingText()} generations available
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <Card className="shadow-sm">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generate Government Proposal
                  {!canGenerate && <Lock className="h-4 w-4 text-gray-500" />}
                </CardTitle>
                <CardDescription>
                  Upload your RFQ document and Solicitation to generate a professional proposal
                  {!canGenerate && ' (Upgrade required)'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ProposalFileUpload onProposalGenerated={handleProposalGenerated} />
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div>
            {proposalData ? (
              <ProposalResults data={proposalData} />
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Upload documents to get started</p>
                      <p className="text-sm">AI-generated proposal will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Upload RFQ and Solicitation documents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>AI merges and analyzes both documents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>Generate professional government proposal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Document Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  RFQ Document (PDF/DOCX)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Government Solicitation (PDF/DOCX)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Maximum 10MB per file
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Text-readable documents
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-lg text-purple-900">
                {isDemo ? 'Upgrade Features' : 'Your Plan Benefits'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-500" />
                  Download as PDF/Word
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  {subscription.plan === 'Professional' ? 'Unlimited proposals' : `Up to ${proposalLimit || 1} proposals`}
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Advanced AI formatting
                </li>
              </ul>
              {isDemo && (
                <Link to="/pricing">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Upgrade Now
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProposalGenerator;
