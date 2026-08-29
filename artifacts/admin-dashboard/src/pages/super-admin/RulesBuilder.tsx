import React, { useEffect, useState } from "react";
import { Sliders, Plus, Trash2, Zap, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface RuleItem {
  id: string;
  name: string;
  description?: string;
  triggerEvent: string;
  conditions: any;
  actions: any;
  isEnabled: boolean;
}

export default function RulesBuilderPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("LOW_CREDITS");
  const [creditThreshold, setCreditThreshold] = useState("5");

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rules");
      if (res.ok) setRules(await res.json());
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async () => {
    if (!name.trim()) {
      toast({ title: "Required", description: "Rule name is required", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          triggerEvent,
          conditions: { threshold: Number(creditThreshold) },
          actions: { action: "SEND_NOTIFICATION", template: "automated_alert" },
        }),
      });

      if (res.ok) {
        toast({ title: "Rule Created! ⚡", description: "Automation rule is now active." });
        setName("");
        setDescription("");
        fetchRules();
      }
    } catch {
      toast({ title: "Error", description: "Failed to create rule", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted", description: "Rule removed" });
        fetchRules();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete rule", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Zap className="h-7 w-7 text-amber-500" />
            Rules & Automation Engine (WHEN / IF / THEN)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build safe event-driven automated workflows for low-credit notifications, no-show booking restrictions, and rewards.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRules} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Create Rule Builder Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Visual Rule Builder</CardTitle>
          <CardDescription>Rules run safely server-side without arbitrary code execution (Rule #56, #57).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rule Name</label>
                <Input placeholder="e.g. Low Credits Alert" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">WHEN (Trigger Event)</label>
                <select
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                  className="w-full h-10 px-3 mt-1 rounded-md border border-input bg-background text-sm"
                >
                  <option value="LOW_CREDITS">WHEN remaining credits &lt; threshold</option>
                  <option value="NO_SHOW">WHEN student fails to check-in (No-Show)</option>
                  <option value="MEMBERSHIP_EXPIRY">WHEN membership expiring in &lt; 3 days</option>
                  <option value="PAYMENT_SUCCESS">WHEN payment is marked paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description & Rationale</label>
              <Input placeholder="Explain the business rule purpose" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
            </div>

            <Button onClick={handleCreateRule} className="gap-1.5 h-10 mt-2">
              <Plus className="h-4 w-4" /> Save & Activate Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Business Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y border rounded-md">
            {rules.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="font-mono text-xs uppercase bg-amber-500/10 text-amber-700 border-amber-500/20">
                      {r.triggerEvent}
                    </Badge>
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{r.name}</span>
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                </div>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
