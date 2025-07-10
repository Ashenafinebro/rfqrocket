import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PromoCode {
  id: string;
  code: string;
  influencer_name: string;
  created_at: string;
  expires_at: string | null;
  active: boolean;
  discount_type: string;
  discount_value: number;
}

interface PromoStats {
  code: string;
  influencer_name: string;
  total_signups: number;
  active_users: number;
}

interface PlanPricing {
  id: string;
  plan_name: string;
  monthly_price: number;
  annual_price: number;
  updated_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoStats, setPromoStats] = useState<PromoStats[]>([]);
  const [planPricing, setPlanPricing] = useState<PlanPricing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [editingPricing, setEditingPricing] = useState<PlanPricing | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    influencer_name: '',
    expires_at: '',
    discount_type: 'percentage',
    discount_value: ''
  });
  const [pricingFormData, setPricingFormData] = useState({
    plan_name: '',
    monthly_price: '',
    annual_price: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromoCodes();
    fetchPromoStats();
    fetchPlanPricing();
  }, []);

  const fetchPlanPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_pricing')
        .select('*')
        .order('plan_name');

      if (error) throw error;
      setPlanPricing(data || []);
    } catch (error) {
      console.error('Error fetching plan pricing:', error);
      toast.error('Failed to load plan pricing');
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to load promo codes');
    }
  };

  const fetchPromoStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          promo_code_used,
          promo_codes!inner(code, influencer_name)
        `)
        .not('promo_code_used', 'is', null);

      if (error) throw error;

      // Group stats by promo code
      const stats: { [key: string]: PromoStats } = {};
      
      data?.forEach((profile: any) => {
        const code = profile.promo_code_used;
        if (!stats[code]) {
          stats[code] = {
            code,
            influencer_name: profile.promo_codes.influencer_name,
            total_signups: 0,
            active_users: 0
          };
        }
        stats[code].total_signups++;
        stats[code].active_users++;
      });

      setPromoStats(Object.values(stats));
    } catch (error) {
      console.error('Error fetching promo stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        code: formData.code.toUpperCase(),
        influencer_name: formData.influencer_name,
        expires_at: formData.expires_at || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value)
      };

      if (editingCode) {
        const { error } = await supabase
          .from('promo_codes')
          .update(data)
          .eq('id', editingCode.id);
        
        if (error) throw error;
        toast.success('Promo code updated successfully');
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert([data]);
        
        if (error) throw error;
        toast.success('Promo code created successfully');
      }

      setIsDialogOpen(false);
      setEditingCode(null);
      setFormData({ code: '', influencer_name: '', expires_at: '', discount_type: 'percentage', discount_value: '' });
      fetchPromoCodes();
      fetchPromoStats();
    } catch (error: any) {
      console.error('Error saving promo code:', error);
      toast.error(error.message || 'Failed to save promo code');
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      influencer_name: promoCode.influencer_name,
      expires_at: promoCode.expires_at ? promoCode.expires_at.split('T')[0] : '',
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Promo code deleted successfully');
      fetchPromoCodes();
      fetchPromoStats();
    } catch (error: any) {
      console.error('Error deleting promo code:', error);
      toast.error('Failed to delete promo code');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Promo code status updated');
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error updating promo code status:', error);
      toast.error('Failed to update promo code status');
    }
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        plan_name: pricingFormData.plan_name,
        monthly_price: parseFloat(pricingFormData.monthly_price),
        annual_price: parseFloat(pricingFormData.annual_price),
        updated_by: user?.id
      };

      if (editingPricing) {
        const { error } = await supabase
          .from('plan_pricing')
          .update(data)
          .eq('id', editingPricing.id);
        
        if (error) throw error;
        toast.success('Pricing updated successfully');
      } else {
        const { error } = await supabase
          .from('plan_pricing')
          .insert([data]);
        
        if (error) throw error;
        toast.success('Pricing created successfully');
      }

      setIsPricingDialogOpen(false);
      setEditingPricing(null);
      setPricingFormData({ plan_name: '', monthly_price: '', annual_price: '' });
      fetchPlanPricing();
    } catch (error: any) {
      console.error('Error saving pricing:', error);
      toast.error(error.message || 'Failed to save pricing');
    }
  };

  const handleEditPricing = (pricing: PlanPricing) => {
    setEditingPricing(pricing);
    setPricingFormData({
      plan_name: pricing.plan_name,
      monthly_price: pricing.monthly_price.toString(),
      annual_price: pricing.annual_price.toString()
    });
    setIsPricingDialogOpen(true);
  };

  const handleDeletePricing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
      const { error } = await supabase
        .from('plan_pricing')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Pricing deleted successfully');
      fetchPlanPricing();
    } catch (error: any) {
      console.error('Error deleting pricing:', error);
      toast.error('Failed to delete pricing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage promo codes, pricing, and track influencer performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Promo Codes</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promoCodes.length}</div>
              <p className="text-xs text-muted-foreground">
                {promoCodes.filter(p => p.active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promoStats.reduce((sum, stat) => sum + stat.total_signups, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                From influencer referrals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promoStats.reduce((sum, stat) => sum + stat.active_users, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently using the platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pricing Plans</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planPricing.length}</div>
              <p className="text-xs text-muted-foreground">
                Active pricing plans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Price Control */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Price Control</CardTitle>
                <CardDescription>Manage pricing for Premium and Professional plans</CardDescription>
              </div>
              <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingPricing(null);
                    setPricingFormData({ plan_name: '', monthly_price: '', annual_price: '' });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pricing Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPricing ? 'Edit Pricing' : 'Create Pricing Plan'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPricing ? 'Update the pricing details' : 'Add pricing for a new plan'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePricingSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="plan_name">Plan Name *</Label>
                      <Input
                        id="plan_name"
                        value={pricingFormData.plan_name}
                        onChange={(e) => setPricingFormData(prev => ({ ...prev, plan_name: e.target.value }))}
                        placeholder="Premium, Professional, etc."
                        required
                        disabled={!!editingPricing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthly_price">Monthly Price ($) *</Label>
                      <Input
                        id="monthly_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={pricingFormData.monthly_price}
                        onChange={(e) => setPricingFormData(prev => ({ ...prev, monthly_price: e.target.value }))}
                        placeholder="29.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="annual_price">Annual Price ($) *</Label>
                      <Input
                        id="annual_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={pricingFormData.annual_price}
                        onChange={(e) => setPricingFormData(prev => ({ ...prev, annual_price: e.target.value }))}
                        placeholder="290.00"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsPricingDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingPricing ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Annual Price</TableHead>
                  <TableHead>Annual Discount</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planPricing.map((pricing) => {
                  const monthlyTotal = pricing.monthly_price * 12;
                  const discountPercent = monthlyTotal > 0 ? Math.round((1 - pricing.annual_price / monthlyTotal) * 100) : 0;
                  
                  return (
                    <TableRow key={pricing.id}>
                      <TableCell className="font-medium">{pricing.plan_name}</TableCell>
                      <TableCell>${pricing.monthly_price}</TableCell>
                      <TableCell>${pricing.annual_price}</TableCell>
                      <TableCell>
                        {discountPercent > 0 && (
                          <Badge variant="secondary">
                            {discountPercent}% off
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(pricing.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPricing(pricing)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePricing(pricing.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Promo Codes Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Promo Codes</CardTitle>
                <CardDescription>Create and manage influencer promo codes</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingCode(null);
                    setFormData({ code: '', influencer_name: '', expires_at: '', discount_type: 'percentage', discount_value: '' });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Promo Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCode ? 'Edit Promo Code' : 'Create Promo Code'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCode ? 'Update the promo code details' : 'Add a new promo code for an influencer'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="code">Promo Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="INFLUENCER_NAME"
                        required
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label htmlFor="influencer_name">Influencer Name *</Label>
                      <Input
                        id="influencer_name"
                        value={formData.influencer_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, influencer_name: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_type">Discount Type *</Label>
                      <Select value={formData.discount_type} onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="discount_value">
                        Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '($)'}
                      </Label>
                      <Input
                        id="discount_value"
                        type="number"
                        step="0.01"
                        min="0"
                        max={formData.discount_type === 'percentage' ? '100' : undefined}
                        value={formData.discount_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                        placeholder={formData.discount_type === 'percentage' ? '15' : '10.00'}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                      <Input
                        id="expires_at"
                        type="date"
                        value={formData.expires_at}
                        onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingCode ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promoCode) => (
                  <TableRow key={promoCode.id}>
                    <TableCell className="font-mono">{promoCode.code}</TableCell>
                    <TableCell>{promoCode.influencer_name}</TableCell>
                    <TableCell>
                      {promoCode.discount_type === 'percentage' 
                        ? `${promoCode.discount_value}%` 
                        : `$${promoCode.discount_value}`
                      }
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={promoCode.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(promoCode.id, promoCode.active)}
                      >
                        {promoCode.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promoCode.expires_at 
                        ? new Date(promoCode.expires_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(promoCode.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(promoCode)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(promoCode.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Influencer Performance</CardTitle>
            <CardDescription>Track signups and conversions by promo code</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Total Signups</TableHead>
                  <TableHead>Active Users</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoStats.map((stat) => (
                  <TableRow key={stat.code}>
                    <TableCell className="font-mono">{stat.code}</TableCell>
                    <TableCell>{stat.influencer_name}</TableCell>
                    <TableCell>{stat.total_signups}</TableCell>
                    <TableCell>{stat.active_users}</TableCell>
                    <TableCell>
                      {stat.total_signups > 0 
                        ? `${Math.round((stat.active_users / stat.total_signups) * 100)}%`
                        : '0%'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
