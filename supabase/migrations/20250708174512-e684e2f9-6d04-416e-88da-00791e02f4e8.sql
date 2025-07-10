
-- Create a table for managing plan pricing
CREATE TABLE public.plan_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name text NOT NULL UNIQUE,
  monthly_price numeric NOT NULL DEFAULT 0,
  annual_price numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.plan_pricing ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pricing
CREATE POLICY "Admins can manage pricing" 
  ON public.plan_pricing 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));

-- Insert default pricing
INSERT INTO public.plan_pricing (plan_name, monthly_price, annual_price) VALUES
('Premium', 29, 290),
('Professional', 99, 990);

-- Create function to get current pricing
CREATE OR REPLACE FUNCTION public.get_plan_pricing(plan_name text)
RETURNS TABLE(monthly_price numeric, annual_price numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT monthly_price, annual_price
  FROM public.plan_pricing
  WHERE plan_pricing.plan_name = get_plan_pricing.plan_name;
$$;
