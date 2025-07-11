
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  business_name: string | null;
  subscription_active: boolean | null;
  subscription_plan: string | null;
  subscription_end: string | null;
  rfq_count: number | null;
  proposal_count: number | null;
  promo_code_used: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionInfo {
  subscribed: boolean;
  plan: string | null;
  rfq_count: number;
  proposal_count: number;
  rfq_limit: number | null;
  proposal_limit: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: SubscriptionInfo;
  loading: boolean;
  incrementRFQCount: () => Promise<void>;
  incrementProposalCount: () => Promise<void>;
  checkSubscription: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getSubscriptionInfo = (profile: Profile | null): SubscriptionInfo => {
    if (!profile) {
      return {
        subscribed: false,
        plan: null,
        rfq_count: 0,
        proposal_count: 0,
        rfq_limit: 1, // Demo limit
        proposal_limit: 1
      };
    }

    const isSubscribed = profile.subscription_active === true;
    const rfqCount = profile.rfq_count || 0;
    const proposalCount = profile.proposal_count || 0;

    if (isSubscribed) {
      // Premium users get higher limits based on their plan
      const rfqLimit = profile.subscription_plan === 'Professional' ? null : 10; // Professional = unlimited, Premium = 10
      const proposalLimit = profile.subscription_plan === 'Professional' ? null : 5;
      
      return {
        subscribed: true,
        plan: profile.subscription_plan,
        rfq_count: rfqCount,
        proposal_count: proposalCount,
        rfq_limit: rfqLimit,
        proposal_limit: proposalLimit
      };
    }

    // Demo users
    return {
      subscribed: false,
      plan: null,
      rfq_count: rfqCount,
      proposal_count: proposalCount,
      rfq_limit: 1, // Demo limit
      proposal_limit: 1
    };
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const incrementRFQCount = async () => {
    if (!user) return;

    try {
      await supabase.rpc('increment_usage_count', {
        user_id: user.id,
        usage_type: 'rfq_count'
      });

      // Refresh profile to get updated count
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error incrementing RFQ count:', error);
      throw error;
    }
  };

  const incrementProposalCount = async () => {
    if (!user) return;

    try {
      await supabase.rpc('increment_usage_count', {
        user_id: user.id,
        usage_type: 'proposal_count'
      });

      // Refresh profile to get updated count
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error incrementing proposal count:', error);
      throw error;
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    const updatedProfile = await fetchProfile(user.id);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const subscription = getSubscriptionInfo(profile);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      subscription, 
      loading, 
      incrementRFQCount, 
      incrementProposalCount, 
      checkSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
