import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  influencer: string;
}

interface SubscriptionInfo {
  subscribed: boolean;
  plan: string | null;
  subscription_end: string | null;
  rfq_count?: number;
  proposal_count?: number;
  rfq_limit?: number | null;
  proposal_limit?: number | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  appliedPromo: PromoCode | null;
  setAppliedPromo: (promo: PromoCode | null) => void;
  subscription: SubscriptionInfo;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  incrementRFQCount: () => Promise<void>;
  incrementProposalCount: () => Promise<void>;
  subscriptionLoading: boolean;
  sessionRfqCount: number;
  canGenerateRFQ: () => boolean;
  canDownload: () => boolean;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [sessionRfqCount, setSessionRfqCount] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    plan: null,
    subscription_end: null,
    rfq_count: 0,
    proposal_count: 0,
    rfq_limit: 1,
    proposal_limit: 1
  });

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/reset-password`;
      
      console.log('Sending password reset email with redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }
      
      console.log('Password reset email sent successfully');
      return { error: null };
    } catch (error) {
      console.error('Reset password catch error:', error);
      return { error };
    }
  };

  const checkSubscription = async () => {
    if (!user) {
      console.log('No user found, skipping subscription check');
      return;
    }
    
    setSubscriptionLoading(true);
    try {
      console.log('Checking subscription for user:', user.email);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      
      console.log('Subscription check response:', data);
      
      const databaseRfqCount = data.rfq_count || 0;
      console.log('Database RFQ count:', databaseRfqCount);
      
      console.log('Updating session RFQ count from', sessionRfqCount, 'to', databaseRfqCount);
      setSessionRfqCount(databaseRfqCount);
      
      let rfqLimit = 1;
      let proposalLimit = 1;
      
      if (data.subscribed && data.plan) {
        console.log('User has active subscription:', data.plan);
        if (data.plan === 'Premium') {
          rfqLimit = 10;
          proposalLimit = 10;
        } else if (data.plan === 'Professional') {
          rfqLimit = null;
          proposalLimit = null;
        }
      } else {
        console.log('User is in demo mode');
      }
      
      const newSubscription = {
        subscribed: data.subscribed || false,
        plan: data.plan || null,
        subscription_end: data.subscription_end || null,
        rfq_count: databaseRfqCount,
        proposal_count: data.proposal_count || 0,
        rfq_limit: rfqLimit,
        proposal_limit: proposalLimit
      };
      
      console.log('Setting subscription state:', newSubscription);
      setSubscription(newSubscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const canGenerateRFQ = () => {
    if (!subscription.subscribed) {
      return sessionRfqCount < 1;
    }
    
    if (subscription.plan === 'Professional') {
      return true;
    }
    
    if (subscription.plan === 'Premium') {
      return sessionRfqCount < 10;
    }
    
    return sessionRfqCount < 1;
  };

  const canDownload = () => {
    return subscription.subscribed;
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error('Please sign in to manage your subscription');
      return;
    }

    try {
      console.log('Opening customer portal for user:', user.email);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error('Failed to open customer portal. Please try again.');
        return;
      }
      
      if (data.url) {
        console.log('Redirecting to customer portal:', data.url);
        window.open(data.url, '_blank');
        toast.success('Opening subscription management portal...');
      } else {
        toast.error('Unable to open customer portal. Please try again.');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal. Please try again.');
    }
  };

  const incrementRFQCount = async () => {
    if (!user) return;
    
    try {
      console.log('Incrementing RFQ count for user:', user.id);
      
      if (!canGenerateRFQ()) {
        throw new Error('RFQ generation limit reached');
      }
      
      const { error } = await supabase.functions.invoke('increment-usage', {
        body: { type: 'rfq' }
      });
      
      if (error) {
        console.error('Error incrementing RFQ count in database:', error);
        throw error;
      }
      
      const newCount = sessionRfqCount + 1;
      console.log('Updating session count after successful increment:', newCount);
      setSessionRfqCount(newCount);
      
      setSubscription(prev => ({
        ...prev,
        rfq_count: newCount
      }));
      
      console.log('RFQ count incremented successfully to:', newCount);
    } catch (error) {
      console.error('Error incrementing RFQ count:', error);
      throw error;
    }
  };

  const incrementProposalCount = async () => {
    if (!user) return;
    
    try {
      console.log('Incrementing proposal count for user:', user.id);
      await supabase.functions.invoke('increment-usage', {
        body: { type: 'proposal' }
      });
      await checkSubscription();
      console.log('Proposal count incremented successfully');
    } catch (error) {
      console.error('Error incrementing proposal count:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAppliedPromo(null);
      setSessionRfqCount(0);
      setSubscription({
        subscribed: false,
        plan: null,
        subscription_end: null,
        rfq_count: 0,
        proposal_count: 0,
        rfq_limit: 1,
        proposal_limit: 1
      });
      setSubscriptionLoading(false);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        console.log('Initial session found, checking subscription');
        checkSubscription();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, checking subscription and syncing session count');
          setSubscription({
            subscribed: false,
            plan: null,
            subscription_end: null,
            rfq_count: 0,
            proposal_count: 0,
            rfq_limit: 1,
            proposal_limit: 1
          });
          
          setSessionRfqCount(0);
          
          setTimeout(() => {
            checkSubscription();
          }, 500);
        }
        
        if (event === 'SIGNED_OUT') {
          setAppliedPromo(null);
          setSessionRfqCount(0);
          setSubscription({
            subscribed: false,
            plan: null,
            subscription_end: null,
            rfq_count: 0,
            proposal_count: 0,
            rfq_limit: 1,
            proposal_limit: 1
          });
          setSubscriptionLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !loading) {
      console.log('User effect triggered, checking subscription');
      checkSubscription();
    }
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      appliedPromo, 
      setAppliedPromo,
      subscription,
      subscriptionLoading,
      checkSubscription,
      signOut,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      incrementRFQCount,
      incrementProposalCount,
      sessionRfqCount,
      canGenerateRFQ,
      canDownload,
      openCustomerPortal
    }}>
      {children}
    </AuthContext.Provider>
  );
};
