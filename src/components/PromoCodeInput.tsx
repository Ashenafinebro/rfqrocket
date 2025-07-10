
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromoCodeInputProps {
  onPromoApplied: (discount: { type: string; value: number; influencer: string; code: string }) => void;
  onPromoRemoved: () => void;
  appliedPromo: { type: string; value: number; influencer: string; code: string } | null;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ onPromoApplied, onPromoRemoved, appliedPromo }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('get_promo_discount', {
        promo_code: promoCode.trim()
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const discount = data[0];
        onPromoApplied({
          type: discount.discount_type,
          value: discount.discount_value,
          influencer: discount.influencer_name,
          code: promoCode.trim().toUpperCase()
        });
        toast.success(`Promo code applied! ${discount.discount_type === 'percentage' ? `${discount.discount_value}% off` : `$${discount.discount_value} off`}`);
        setPromoCode('');
      } else {
        toast.error('Invalid or expired promo code');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast.error('Failed to validate promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromo = () => {
    onPromoRemoved();
    toast.info('Promo code removed');
  };

  if (appliedPromo) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
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
              onClick={handleRemovePromo}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Thanks to {appliedPromo.influencer} for the discount!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600" />
            <Label htmlFor="promo-code" className="text-sm font-medium text-blue-800">
              Have a promo code?
            </Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="promo-code"
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
              className="flex-1"
            />
            <Button 
              onClick={validatePromoCode}
              disabled={isValidating}
              size="sm"
            >
              {isValidating ? 'Checking...' : 'Apply'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeInput;
