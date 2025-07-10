
-- Add discount columns to promo_codes table
ALTER TABLE public.promo_codes 
ADD COLUMN discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
ADD COLUMN discount_value DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Update existing promo codes with some sample discount values
UPDATE public.promo_codes 
SET discount_value = 15.00, discount_type = 'percentage' 
WHERE code = 'INFLUENCER_JANE';

UPDATE public.promo_codes 
SET discount_value = 20.00, discount_type = 'percentage' 
WHERE code = 'TECH_GURU_MIKE';

UPDATE public.promo_codes 
SET discount_value = 10.00, discount_type = 'percentage' 
WHERE code = 'STARTUP_SARAH';

-- Create function to get promo code discount
CREATE OR REPLACE FUNCTION public.get_promo_discount(promo_code TEXT)
RETURNS TABLE(
  discount_type TEXT,
  discount_value DECIMAL(10,2),
  influencer_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.discount_type,
    pc.discount_value,
    pc.influencer_name
  FROM public.promo_codes pc
  WHERE LOWER(pc.code) = LOWER(promo_code)
    AND pc.active = true 
    AND (pc.expires_at IS NULL OR pc.expires_at > NOW());
END;
$$;
