
-- Add usage tracking columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rfq_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS proposal_count INTEGER DEFAULT 0;

-- Create or replace function to increment usage counts
CREATE OR REPLACE FUNCTION public.increment_usage_count(user_id uuid, usage_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF usage_type = 'rfq_count' THEN
    UPDATE public.profiles 
    SET rfq_count = COALESCE(rfq_count, 0) + 1,
        updated_at = NOW()
    WHERE id = user_id;
  ELSIF usage_type = 'proposal_count' THEN
    UPDATE public.profiles 
    SET proposal_count = COALESCE(proposal_count, 0) + 1,
        updated_at = NOW()
    WHERE id = user_id;
  END IF;
END;
$$;
