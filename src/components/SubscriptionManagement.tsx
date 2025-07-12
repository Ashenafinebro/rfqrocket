
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionManagement = () => {
  const { subscription, subscriptionLoading, openCustomerPortal } = useAuth();

  if (!subscription.subscribed) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = () => {
    if (!subscription.subscription_end) return false;
    const endDate = new Date(subscription.subscription_end);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-blue-600" />
          Subscription Management
        </CardTitle>
        <CardDescription>
          Manage your subscription, billing, and payment details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <h3 className="font-semibold text-blue-900">Current Plan</h3>
            <p className="text-sm text-blue-700">
              You are subscribed to the {subscription.plan} plan
            </p>
          </div>
          <Badge className="bg-blue-600">
            <Crown className="h-4 w-4 mr-1" />
            {subscription.plan}
          </Badge>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Next Billing Date</p>
              <p className="text-sm text-gray-600">
                {formatDate(subscription.subscription_end)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-green-600 font-medium">Active</p>
            </div>
          </div>
        </div>

        {/* Expiry Warning */}
        {isExpiringSoon() && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Subscription Expiring Soon</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Your subscription will expire on {formatDate(subscription.subscription_end)}. 
                  Manage your subscription to avoid service interruption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Management Actions */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">Subscription Management</h4>
          <div className="space-y-3">
            <Button 
              onClick={openCustomerPortal}
              disabled={subscriptionLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {subscriptionLoading ? 'Loading...' : 'Manage Subscription & Billing'}
            </Button>
            
            <p className="text-xs text-gray-600 text-center">
              This will open Stripe's secure customer portal where you can:
            </p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Cancel or pause your subscription</li>
              <li>Update payment methods</li>
              <li>Download invoices and receipts</li>
              <li>Change your billing address</li>
              <li>Upgrade or downgrade your plan</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
