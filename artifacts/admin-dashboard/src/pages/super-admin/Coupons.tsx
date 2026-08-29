import React, { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Check, RefreshCw, Percent, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minPurchaseAmount: number;
  usedCount: number;
  usageLimitTotal?: number;
  isEnabled: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("0");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async () => {
    if (!newCode.trim() || !discountValue) {
      toast({ title: "Required", description: "Coupon code and discount value are required", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minPurchaseAmount: Number(minPurchase) || 0,
        }),
      });

      if (res.ok) {
        toast({ title: "Coupon Created! 🏷️", description: `Promo code ${newCode.toUpperCase()} is now active.` });
        setNewCode("");
        setDiscountValue("");
        setMinPurchase("0");
        fetchCoupons();
      }
    } catch {
      toast({ title: "Error", description: "Failed to create coupon", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted", description: "Coupon removed" });
        fetchCoupons();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Tag className="h-7 w-7 text-primary" />
            Coupons & Promotional Offers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage dynamic discount promo codes for student plan purchases with usage limits and anti-fraud rules.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Create Coupon Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Create New Promo Code</CardTitle>
          <CardDescription>Coupons are applied atomically in real-time during student checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Coupon Code</label>
              <Input
                placeholder="e.g. WELCOME50"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="mt-1 font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Discount Type</label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  size="sm"
                  variant={discountType === "fixed" ? "default" : "outline"}
                  onClick={() => setDiscountType("fixed")}
                  className="flex-1 text-xs"
                >
                  <IndianRupee className="h-3 w-3 mr-1" /> Flat ₹
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={discountType === "percentage" ? "default" : "outline"}
                  onClick={() => setDiscountType("percentage")}
                  className="flex-1 text-xs"
                >
                  <Percent className="h-3 w-3 mr-1" /> % Off
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Discount Value</label>
              <Input
                placeholder={discountType === "fixed" ? "50 (in ₹)" : "20 (in %)"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                keyboardType="numeric"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Min Purchase (₹)</label>
              <Input
                placeholder="0"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                keyboardType="numeric"
                className="mt-1"
              />
            </div>
            <Button onClick={handleCreateCoupon} className="gap-1.5 h-10">
              <Plus className="h-4 w-4" /> Create Coupon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Coupons List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Coupons & Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Tag className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-gray-800 dark:text-gray-200">No Active Coupons</p>
              <p className="text-xs">Create your first promo code using the builder above.</p>
            </div>
          ) : (
            <div className="divide-y border rounded-md">
              {coupons.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="font-mono text-xs uppercase bg-primary text-primary-foreground">
                        {c.code}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {c.discountType === "fixed" ? `Flat ₹${c.discountValue} Off` : `${c.discountValue}% Discount`}
                      </span>
                      {c.minPurchaseAmount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          (Min. purchase ₹{c.minPurchaseAmount})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used: {c.usedCount} times • Limit: {c.usageLimitTotal || "Unlimited"} • Status: {c.isEnabled ? "Active" : "Disabled"}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
