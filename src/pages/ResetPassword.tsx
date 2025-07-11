
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Rocket } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      setIsValidToken(true);
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    } else {
      toast.error('Invalid or expired reset link');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        toast.error(error.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            Reset Your Password
          </h2>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">New Password</CardTitle>
            <CardDescription className="text-center">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your new password"
                    className="mt-1"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                    className="mt-1"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
