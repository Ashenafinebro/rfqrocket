
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileUp, Download, AlertCircle, Check, Star, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RFQProcessor = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    requirements: '',
    timeline: '',
    budget: '',
    contactInfo: ''
  });
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkSubscription();
      loadUsageCount();
    }
  }, [user]);

  const loadUsageCount = async () => {
    if (!user) return;
    
    try {
      // You would implement usage tracking in your database
      // For now, we'll use localStorage as a simple demo
      const count = localStorage.getItem(`rfq_usage_${user.id}`) || '0';
      setUsageCount(parseInt(count));
    } catch (error) {
      console.error('Error loading usage count:', error);
    }
  };

  const incrementUsageCount = () => {
    if (!user) return;
    
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(`rfq_usage_${user.id}`, newCount.toString());
  };

  const canProcessRFQ = () => {
    if (subscription.subscribed) {
      return true; // Unlimited for paid users
    }
    
    // Free users get 1 RFQ
    return usageCount < 1;
  };

  const getUsageLimitMessage = () => {
    if (subscription.subscribed) {
      if (subscription.plan === 'Premium') {
        return "Premium Plan: Up to 10 RFQs per month";
      } else if (subscription.plan === 'Professional') {
        return "Professional Plan: Unlimited RFQs";
      }
    }
    
    return `Free Demo: ${usageCount}/1 RFQ used`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to process RFQs');
      navigate('/login');
      return;
    }

    if (!canProcessRFQ()) {
      toast.error('Usage limit reached. Please upgrade your plan to continue.');
      navigate('/pricing');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          type: 'rfq',
          content: {
            ...formData
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.result) {
        setResult(data.result);
        incrementUsageCount();
        toast.success('RFQ processed successfully!');
      } else {
        throw new Error('No result received');
      }
    } catch (error) {
      console.error('Error processing RFQ:', error);
      toast.error('Failed to process RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!subscription.subscribed) {
      toast.error('Download is available only for paid plans. Please upgrade to continue.');
      navigate('/pricing');
      return;
    }

    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rfq-${formData.projectTitle || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('RFQ downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Plan Status Banner - Only show for non-subscribed users */}
        {!subscription.subscribed && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span>
                  You're using the free demo. Upgrade to unlock unlimited RFQs and downloads.
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/pricing')}
                  className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Upgrade Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Status for Subscribed Users */}
        {subscription.subscribed && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {subscription.plan === 'Professional' ? (
                  <Crown className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Star className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium text-green-800">
                  {subscription.plan} Plan Active
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {subscription.plan === 'Professional' ? 'Unlimited RFQs' : 'Up to 10 RFQs/month'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RFQ Processor</h1>
          <p className="text-gray-600 mb-4">
            Generate professional Request for Quotation documents
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              {getUsageLimitMessage()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                RFQ Details
              </CardTitle>
              <CardDescription>
                Fill in the details for your Request for Quotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project in detail"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Technical Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="List specific technical requirements"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g., 3 months, By December 2024"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g., $10,000 - $50,000"
                  />
                </div>

                <div>
                  <Label htmlFor="contactInfo">Contact Information *</Label>
                  <Textarea
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                    placeholder="Your contact details for responses"
                    rows={2}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !canProcessRFQ()}
                >
                  {loading ? 'Processing...' : 'Generate RFQ'}
                </Button>

                {!canProcessRFQ() && (
                  <p className="text-sm text-red-600 text-center">
                    Usage limit reached. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-red-600 underline"
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade to continue
                    </Button>
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Generated RFQ
              </CardTitle>
              <CardDescription>
                Your processed Request for Quotation document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {!subscription.subscribed ? 
                        result + "\n\n[DEMO VERSION - Upgrade for full access]" : 
                        result
                      }
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDownload}
                      disabled={!subscription.subscribed}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {subscription.subscribed ? 'Download RFQ' : 'Upgrade to Download'}
                    </Button>
                    
                    {!subscription.subscribed && (
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade Plan
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Fill in the form and click "Generate RFQ" to see your processed document here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RFQProcessor;
