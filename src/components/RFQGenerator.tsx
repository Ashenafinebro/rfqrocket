import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Download, Eye, Lock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProcessedData {
  fileName: string;
  rfqContent: string;
  extractedText: string;
}

interface RFQGeneratorProps {
  onRFQGenerated?: (rfq: any) => void;
  data?: ProcessedData;
}

const RFQGenerator: React.FC<RFQGeneratorProps> = ({ onRFQGenerated, data }) => {
  const { user, subscription, incrementRFQCount, checkSubscription } = useAuth();
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    requirements: '',
    timeline: '',
    budget: '',
    contactInfo: '',
    industry: '',
    deliverables: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRFQ, setGeneratedRFQ] = useState<string | null>(data?.rfqContent || null);
  const [hasProcessedData, setHasProcessedData] = useState(false);

  const hasSubscription = subscription.subscribed;
  const rfqCount = subscription.rfq_count || 0;
  const rfqLimit = subscription.rfq_limit;
  
  const canGenerate = rfqLimit === null || rfqCount < rfqLimit;

  // Process data only once when component mounts with data
  React.useEffect(() => {
    if (data?.rfqContent && !hasProcessedData) {
      setGeneratedRFQ(data.rfqContent);
      setHasProcessedData(true);
      
      // Only increment count if user can still generate
      if (canGenerate) {
        const trackDataRFQUsage = async () => {
          try {
            await incrementRFQCount();
            console.log('RFQ usage tracked for uploaded document');
          } catch (error) {
            console.error('Error tracking RFQ usage:', error);
          }
        };
        
        trackDataRFQUsage();
      } else {
        toast.error('Usage limit reached. Please upgrade to continue generating RFQs.');
      }
    }
  }, [data?.rfqContent, hasProcessedData, canGenerate, incrementRFQCount]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canGenerate) {
      toast.error('Usage limit reached. Please upgrade to continue generating RFQs.');
      return;
    }

    if (!user) {
      toast.error('Please sign in to generate RFQs');
      return;
    }

    setIsGenerating(true);

    try {
      // Increment usage count FIRST to prevent concurrent usage
      await incrementRFQCount();

      const { data, error } = await supabase.functions.invoke('generate-rfq', {
        body: {
          formData,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.rfq) {
        setGeneratedRFQ(data.rfq);
        
        if (onRFQGenerated) {
          onRFQGenerated(data.rfq);
        }
        
        toast.success('RFQ generated successfully!');
      } else {
        throw new Error('No RFQ content received');
      }
    } catch (error) {
      console.error('Error generating RFQ:', error);
      toast.error('Failed to generate RFQ. Please try again.');
      
      // If generation failed, refresh subscription to get accurate count
      setTimeout(async () => {
        await checkSubscription();
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!hasSubscription) {
      toast.error('Downloads are only available with a paid subscription. Please upgrade to download your RFQ.');
      return;
    }
    
    if (!generatedRFQ) return;
    
    const blob = new Blob([generatedRFQ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rfq-${formData.projectTitle || data?.fileName || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRemainingText = () => {
    if (rfqLimit === null) return 'Unlimited';
    return `${Math.max(0, rfqLimit - rfqCount)} remaining`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* If we have processed data, show a different header */}
      {data && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            RFQ generated from uploaded document: <strong>{data.fileName}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Usage indicator */}
      {!hasSubscription ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Demo Mode: {rfqCount}/{rfqLimit || 1} RFQ generations used.
            {!canGenerate && (
              <span className="text-red-600 font-medium ml-2">
                Upgrade to continue generating RFQs.
              </span>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            {subscription.plan} Plan: {getRemainingText()} RFQ generations.
          </AlertDescription>
        </Alert>
      )}

      {/* Only show the form if no processed data is available */}
      {!data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              RFQ Generator
              {!hasSubscription && <Badge variant="secondary">Demo</Badge>}
            </CardTitle>
            <CardDescription>
              Fill out the details below to generate a professional RFQ document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    placeholder="Enter project title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="projectDescription">Project Description *</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  placeholder="Describe your project in detail"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">Technical Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="List specific technical requirements, standards, or specifications"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="deliverables">Expected Deliverables</Label>
                <Textarea
                  id="deliverables"
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange('deliverables', e.target.value)}
                  placeholder="What should vendors deliver? (reports, software, services, etc.)"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    placeholder="e.g., 3 months"
                  />
                </div>
                
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="e.g., $50,000 - $100,000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Textarea
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder="Contact person, email, phone, address"
                  className="min-h-[60px]"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isGenerating || !canGenerate}
                className="w-full"
              >
                {!canGenerate ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Upgrade to Generate RFQ
                  </>
                ) : isGenerating ? (
                  'Generating RFQ...'
                ) : (
                  'Generate RFQ'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {generatedRFQ && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Generated RFQ
              </span>
              <div className="flex gap-2">
                {!hasSubscription && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Lock className="h-3 w-3 mr-1" />
                    Preview Only
                  </Badge>
                )}
                <Button
                  onClick={handleDownload}
                  disabled={!hasSubscription}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{generatedRFQ}</pre>
            </div>
            {!hasSubscription && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <Lock className="h-4 w-4 inline mr-2" />
                  This is a preview only. Upgrade to a paid plan to download your RFQ and remove limitations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RFQGenerator;
