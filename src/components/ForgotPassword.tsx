
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const { resetPassword } = useAuth();
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

    const { error } = await resetPassword(email);
    
    if (error) {
      toast.error(error.message || 'Failed to send reset email');
    } else {
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    }
    
    setIsLoading(false);
  };

  if (emailSent) {
    return (
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
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
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

            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
