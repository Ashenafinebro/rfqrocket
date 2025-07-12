
-- Allow everyone to view plan pricing (not just admins)
DROP POLICY IF EXISTS "Admins can manage pricing" ON public.plan_pricing;

-- Create separate policies for read and write access
CREATE POLICY "Everyone can view pricing" 
  ON public.plan_pricing 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage pricing" 
  ON public.plan_pricing 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));
