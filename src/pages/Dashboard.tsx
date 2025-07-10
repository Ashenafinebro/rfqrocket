
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Crown, Download, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/FileUpload';
import RFQGenerator from '@/components/RFQGenerator';

interface ProcessedData {
  fileName: string;
  rfqContent: string;
  extractedText: string;
}

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [demoUsed, setDemoUsed] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const isDemo = !subscription.subscribed;
  const rfqCount = subscription.rfq_count || 0;
  const proposalCount = subscription.proposal_count || 0;
  const rfqLimit = subscription.rfq_limit;
  const proposalLimit = subscription.proposal_limit;

  const handleFileProcessed = (data: ProcessedData) => {
    setProcessedData(data);
    setDemoUsed(true);
  };

  const handleStartHere = () => {
    const uploadSection = document.getElementById('rfq-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  const getRemainingText = (count: number, limit: number | null) => {
    if (limit === null) return 'Unlimited';
    return `${Math.max(0, limit - count)} remaining`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Demo Mode Banner - Only show for non-subscribers */}
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800">Demo Mode Active</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    You have {getRemainingText(rfqCount, rfqLimit)} RFQ generations in demo mode. 
                    Downloads are disabled in demo mode.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleUpgradeClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Subscription Status Banner - Show for subscribers */}
        {subscription.subscribed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">{subscription.plan} Plan Active</h3>
                  <p className="text-green-700 text-sm mt-1">
                    RFQs: {getRemainingText(rfqCount, rfqLimit)} | 
                    Proposals: {getRemainingText(proposalCount, proposalLimit)}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">
                <Crown className="h-4 w-4 mr-1" />
                {subscription.plan}
              </Badge>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to RFQRocket</h1>
              <p className="text-gray-600 mt-1">
                {user?.email} - {subscription.subscribed ? `${subscription.plan} Account` : 'Demo Account'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={subscription.subscribed ? "default" : "secondary"} className="px-3 py-1">
                {subscription.subscribed ? `⭐ ${subscription.plan}` : '🆓 Free Demo'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-sm border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <Upload className="h-5 w-5" />
                Generate RFQ
              </CardTitle>
              <CardDescription className="text-blue-700">
                Upload solicitation documents to create professional RFQs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Transform government solicitations into vendor-ready Request for Quote documents.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleStartHere}
              >
                Start Here
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <Zap className="h-5 w-5" />
                Generate Government Proposal
              </CardTitle>
              <CardDescription className="text-purple-700">
                Create professional proposals from RFQ and Solicitation documents
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload both RFQ and Solicitation to generate a complete government proposal.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <Link to="/proposal-generator">Generate Proposal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Upload Area */}
          <Card id="rfq-section" className="shadow-sm">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Solicitation Document
              </CardTitle>
              <CardDescription>
                Upload your solicitation document and extract key information
                {isDemo && ' (Demo - download/export disabled)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FileUpload onFileProcessed={handleFileProcessed} />
            </CardContent>
          </Card>

          {/* Results Area */}
          <div>
            {processedData ? (
              <RFQGenerator data={processedData} />
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Upload a document to get started</p>
                      <p className="text-sm">AI-generated RFQ will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Quick Stats */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Your Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">RFQs Generated</span>
                  <span className="font-semibold">{rfqCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Proposals Generated</span>
                  <span className="font-semibold">{proposalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold">{subscription.subscribed ? subscription.plan : 'Demo'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">RFQ Remaining</span>
                  <span className="font-semibold">
                    {getRemainingText(rfqCount, rfqLimit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Proposal Remaining</span>
                  <span className="font-semibold">
                    {getRemainingText(proposalCount, proposalLimit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt - Only show for demo users */}
          {isDemo && (
            <Card className="shadow-sm border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg text-blue-900">
                  Unlock Full Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-500" />
                    Download RFQs as PDF/Word
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    More RFQ generations
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-green-500" />
                    Premium formatting
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleUpgradeClick}
                >
                  View Pricing Plans
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Getting Started */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Upload your solicitation document</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>Review extracted information</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>Generate professional RFQ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
