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
      // Use clean URL without hash or query params for the reset password URL
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
      
      // Log success for debugging
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
      
      // Update session count with database value
      console.log('Updating session RFQ count from', sessionRfqCount, 'to', databaseRfqCount);
      setSessionRfqCount(databaseRfqCount);
      
      // Set usage limits based on plan
      let rfqLimit = 1; // Free/demo default
      let proposalLimit = 1; // Free/demo default
      
      if (data.subscribed && data.plan) {
        console.log('User has active subscription:', data.plan);
        if (data.plan === 'Premium') {
          rfqLimit = 10;
          proposalLimit = 10;
        } else if (data.plan === 'Professional') {
          rfqLimit = null; // Unlimited
          proposalLimit = null; // Unlimited
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

  const incrementRFQCount = async () => {
    if (!user) return;
    
    try {
      console.log('Incrementing RFQ count for user:', user.id);
      
      // Increment in database first
      const { error } = await supabase.functions.invoke('increment-usage', {
        body: { type: 'rfq' }
      });
      
      if (error) {
        console.error('Error incrementing RFQ count in database:', error);
        throw error;
      }
      
      // Update session count immediately after successful database increment
      const newCount = sessionRfqCount + 1;
      console.log('Updating session count after successful increment:', newCount);
      setSessionRfqCount(newCount);
      
      // Update subscription state to reflect new count
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
      await checkSubscription(); // Refresh subscription data
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        console.log('Initial session found, checking subscription');
        // Check subscription after user is set
        checkSubscription();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, checking subscription and syncing session count');
          // Reset subscription to default state
          setSubscription({
            subscribed: false,
            plan: null,
            subscription_end: null,
            rfq_count: 0,
            proposal_count: 0,
            rfq_limit: 1,
            proposal_limit: 1
          });
          
          // Reset session count to 0 first, then sync with database
          setSessionRfqCount(0);
          
          // Wait a bit to ensure user state is properly set, then check subscription
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

  // Add effect to trigger checkSubscription when user changes
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
      sessionRfqCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
