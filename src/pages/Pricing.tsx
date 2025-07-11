
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { appliedPromo, setAppliedPromo } = useAuth();

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses",
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        "Up to 10 RFQ generations per month",
        "Basic AI proposal generation",
        "Standard document formats",
        "Email support"
      ]
    },
    {
      name: "Professional",
      description: "Ideal for growing companies",
      monthlyPrice: 79,
      annualPrice: 790,
      features: [
        "Up to 50 RFQ generations per month",
        "Advanced AI proposal generation",
        "All document formats",
        "Priority email support",
        "Custom branding options"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 199,
      annualPrice: 1990,
      features: [
        "Unlimited RFQ generations",
        "Premium AI proposal generation",
        "All document formats",
        "Phone & email support",
        "Custom branding & templates",
        "API access",
        "Dedicated account manager"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">
            Select the perfect plan for your business needs
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`mr-3 ${!isAnnual ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${isAnnual ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 text-sm text-green-600 font-medium">Save 17%</span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-600">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
