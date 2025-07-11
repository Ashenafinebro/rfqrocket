import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Rocket, Mail, Lock, Building, Tag } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Signup = () => {
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    promoCode: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [promoCodeValidated, setPromoCodeValidated] = useState<boolean | null>(null);

  // Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoCodeValidated(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        promo_code: code.trim()
      });

      if (error) {
        console.error('Error validating promo code:', error);
        setPromoCodeValidated(false);
        return;
      }

      setPromoCodeValidated(data);
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoCodeValidated(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms of use');
      return;
    }

    // Validate promo code if provided
    if (formData.promoCode && promoCodeValidated === false) {
      toast.error('Please enter a valid promo code or leave it empty');
      return;
    }

    setIsLoading(true);

    console.log('Attempting signup for email:', formData.email);

    const { error } = await signUp(formData.email, formData.password, {
      business_name: formData.businessName,
      promo_code: formData.promoCode
    });
    
    if (error) {
      console.error('Signup error:', error);
      // Check if the error is about user already registered
      if (error.message?.includes('User already registered') || 
          error.message?.includes('already been registered') ||
          error.message?.includes('email address is already in use') ||
          error.message?.includes('already registered')) {
        toast.error('Account already exists. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } else {
      toast.success('Account created! Please check your email to verify your account.');
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms of use');
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast.error(error.message || 'Failed to sign up with Google');
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'promoCode' && typeof value === 'string') {
      validatePromoCode(value);
    }
  };

  if (loading) {
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
            Generate Smarter RFQs
          </h2>
          <p className="text-gray-600">
            Try for free – create your account to get started
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Start with a free demo, then upgrade for full features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@company.com"
                    className="mt-1"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a secure password"
                    className="mt-1"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="businessName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building className="h-4 w-4" />
                    Business Name (Optional)
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Your company or organization"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="promoCode" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="h-4 w-4" />
                    Promo Code (Optional)
                  </Label>
                  <Input
                    id="promoCode"
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => handleInputChange('promoCode', e.target.value)}
                    placeholder="Enter influencer code"
                    className={`mt-1 ${
                      promoCodeValidated === true ? 'border-green-500 bg-green-50' :
                      promoCodeValidated === false ? 'border-red-500 bg-red-50' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {promoCodeValidated === true && (
                    <p className="text-sm text-green-600 mt-1">✓ Valid promo code</p>
                  )}
                  {promoCodeValidated === false && (
                    <p className="text-sm text-red-600 mt-1">✗ Invalid or expired promo code</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline">
                    Terms of Use
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={!formData.agreeToTerms || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account & Start Free Demo'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignUp}
                variant="outline"
                className="w-full mt-4"
                disabled={!formData.agreeToTerms || isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Signing Up...' : 'Sign up with Google'}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">What's included in your free demo:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 1 RFQ generation</li>
            <li>• Preview your generated RFQ</li>
            <li>• See how our AI processes your documents</li>
            <li>• Upgrade anytime for downloads and unlimited use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;
