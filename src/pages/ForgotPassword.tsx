
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <Rocket className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">RFQRocket</span>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center">Check Your Email</CardTitle>
              <CardDescription className="text-center">
                We've sent password reset instructions to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">RFQRocket</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              We'll send reset instructions to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>

                <Link to="/login">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
