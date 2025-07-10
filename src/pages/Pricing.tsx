import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import PromoCodeInput from '@/components/PromoCodeInput';

interface PlanPricing {
  plan_name: string;
  monthly_price: number;
  annual_price: number;
}

const Pricing = () => {
  const navigate = useNavigate();
  const { user, appliedPromo, setAppliedPromo } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [planPricing, setPlanPricing] = useState<PlanPricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanPricing();
  }, []);

  const fetchPlanPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_pricing')
        .select('plan_name, monthly_price, annual_price')
        .order('monthly_price');

      if (error) throw error;
      setPlanPricing(data || []);
    } catch (error) {
      console.error('Error fetching plan pricing:', error);
      toast.error('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (planName: string) => {
    const plan = planPricing.find(p => p.plan_name === planName);
    if (!plan) return { monthly: 0, annual: 0 };
    return {
      monthly: plan.monthly_price,
      annual: plan.annual_price
    };
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedPromo) return originalPrice;
    
    if (appliedPromo.type === 'percentage') {
      return originalPrice * (1 - appliedPromo.value / 100);
    } else {
      return Math.max(0, originalPrice - appliedPromo.value);
    }
  };

  const handlePlanClick = async (planName: string) => {
    if (planName === 'Free Demo') {
      if (!user) {
        navigate('/signup');
        toast.info('Please sign up to start your free demo');
      } else {
        navigate('/rfq-processor');
        toast.success('Welcome to your free demo!');
      }
    } else if (planName === 'Premium' || planName === 'Professional') {
      if (!user) {
        navigate('/signup');
        toast.info('Please sign up to subscribe to a paid plan');
      } else {
        try {
          toast.loading('Creating checkout session...');
          
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { 
              planName,
              promoCode: appliedPromo?.code || null,
              isAnnual
            }
          });

          if (error) {
            throw error;
          }

          if (data?.url) {
            window.open(data.url, '_blank');
            toast.success('Redirecting to checkout...');
          } else {
            throw new Error('No checkout URL received');
          }
        } catch (error) {
          console.error('Checkout error:', error);
          toast.error('Failed to create checkout session. Please try again.');
        }
      }
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      toast.loading('Opening subscription management...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening customer portal...');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open customer portal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const premiumPricing = getPlanPrice('Premium');
  const professionalPricing = getPlanPrice('Professional');

  const plans = [
    {
      name: 'FREE',
      price: 0,
      priceLabel: isAnnual ? '/year' : '/month',
      description: 'No credit card required',
      features: [
        '1 RFQ generation',
        'Preview only',
        'No downloads',
        'Watermarked output'
      ],
      buttonText: 'Start Free Demo',
      buttonVariant: 'outline' as const,
      popular: false,
      planKey: 'Free Demo'
    },
    {
      name: 'Premium',
      price: isAnnual ? premiumPricing.annual : premiumPricing.monthly,
      priceLabel: isAnnual ? '/year' : '/month',
      description: isAnnual ? 'billed yearly' : 'Perfect for occasional users',
      features: [
        'Up to 10 RFQs/month',
        'Downloadable PDF/Word',
        'Email support',
        'Document history',
        'Secure storage'
      ],
      buttonText: isAnnual ? 'Try 7 days free' : 'Get Started',
      buttonVariant: 'default' as const,
      popular: !isAnnual,
      planKey: 'Premium',
      savings: isAnnual && premiumPricing.annual < (premiumPricing.monthly * 12) ? 'up to 30% off' : null
    },
    {
      name: 'Professional',
      price: isAnnual ? professionalPricing.annual : professionalPricing.monthly,
      priceLabel: isAnnual ? '/year' : '/month',
      description: isAnnual ? 'billed yearly' : 'Best for small teams and regular use',
      features: [
        'Unlimited RFQs',
        'Document history', 
        'Premium formatting',
        'Priority support',
        'Custom templates',
        'Redaction tools'
      ],
      buttonText: 'Go Professional', 
      buttonVariant: 'default' as const,
      popular: isAnnual,
      planKey: 'Professional',
      minTotal: isAnnual ? 'USD 144' : null,
      totalLabel: isAnnual ? 'Annual total' : 'Monthly total'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pick your plan.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We make this part easy too.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                !isAnnual 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative ${
                isAnnual 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Annually
              {isAnnual && premiumPricing.annual < (premiumPricing.monthly * 12) && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  up to 30% off
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Promo Code Input - Only show if user doesn't have a promo code from signup */}
        {!appliedPromo && (
          <div className="max-w-md mx-auto mb-8">
            <PromoCodeInput
              onPromoApplied={setAppliedPromo}
              onPromoRemoved={() => setAppliedPromo(null)}
              appliedPromo={appliedPromo}
            />
          </div>
        )}

        {/* Show applied promo from signup */}
        {appliedPromo && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-800">
                      Promo code "{appliedPromo.code}" applied
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {appliedPromo.type === 'percentage' 
                        ? `${appliedPromo.value}% off` 
                        : `$${appliedPromo.value} off`
                      }
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setAppliedPromo(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    Remove
                  </Button>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Thanks to {appliedPromo.influencer} for the discount!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const originalPrice = plan.price;
            const discountedPrice = calculateDiscountedPrice(originalPrice);
            const hasDiscount = appliedPromo && originalPrice > 0;
            
            return (
              <Card key={plan.name} className={`relative shadow-lg ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} bg-white`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</CardTitle>
                  <div className="mb-4">
                    {hasDiscount && (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-400 line-through">
                          USD {originalPrice}
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          Save {appliedPromo.type === 'percentage' 
                            ? `${appliedPromo.value}%` 
                            : `$${appliedPromo.value}`
                          }
                        </Badge>
                      </div>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      USD {hasDiscount ? Math.round(discountedPrice) : originalPrice}
                    </span>
                    <span className="text-gray-600 text-sm">{plan.priceLabel}</span>
                  </div>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  {plan.savings && !hasDiscount && (
                    <div className="text-blue-600 text-sm font-medium mt-2">{plan.savings}</div>
                  )}
                  {hasDiscount && (
                    <div className="text-green-600 text-sm font-medium mt-2">
                      Thanks to {appliedPromo.influencer}!
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.minTotal && (
                    <div className="text-center text-sm text-gray-600">
                      <div>Minimum total of {plan.minTotal}/month</div>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">-</button>
                        <span className="px-4">2</span>
                        <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">+</button>
                      </div>
                      <div className="mt-2">{plan.totalLabel} <span className="font-bold">{plan.minTotal}</span></div>
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                    variant={plan.buttonVariant}
                    size="lg"
                    onClick={() => handlePlanClick(plan.planKey)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {user && (
          <div className="text-center mb-8">
            <Button 
              variant="outline" 
              onClick={handleManageSubscription}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Manage Your Subscription
            </Button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
              <p className="text-gray-600">All documents processed securely with enterprise-grade encryption</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Redaction Tools</h3>
              <p className="text-gray-600">Built-in tools to protect sensitive information</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vendor-Safe Formatting</h3>
              <p className="text-gray-600">Professional formatting that meets government standards</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            🔒 Payments are securely processed via Stripe
          </p>
          <p className="text-sm text-gray-500">
            Questions? <Link to="/contact" className="text-blue-600 hover:text-blue-800">Contact our team</Link> for help choosing the right plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
