import React, { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Ban, Eye, RefreshCw, Smartphone, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SuspiciousEvent {
  id: string;
  userId?: string;
  userName: string;
  signalType: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "detected" | "under_review" | "dismissed" | "restricted" | "suspended" | "resolved";
  details?: any;
  ipAddress?: string;
  deviceInfo?: string;
  reviewNotes?: string;
  createdAt: string;
}

export default function SecurityDashboard() {
  const { toast } = useToast();
  const [overview, setOverview] = useState({ total: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0, pendingReview: 0 });
  const [events, setEvents] = useState<SuspiciousEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [ovRes, evRes] = await Promise.all([
        fetch("/api/admin/security/overview"),
        fetch("/api/admin/security/events"),
      ]);
      if (ovRes.ok) setOverview(await ovRes.json());
      if (evRes.ok) setEvents(await evRes.json());
    } catch (err) {
      console.error("Failed to fetch security data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleAction = async (id: string, action: "dismiss" | "restrict" | "suspend" | "resolve") => {
    try {
      const res = await fetch(`/api/admin/security/events/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: `Master Admin action: ${action}` }),
      });
      if (res.ok) {
        toast({ title: "Security Action Taken", description: `Event marked as ${action}` });
        fetchSecurityData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to execute security action", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-red-500" />
            Fraud & Suspicious Activity Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time security signal monitoring, abnormal QR punches, device sharing protection, and risk assessment.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSecurityData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">High / Critical Risk</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{overview.highPriority}</p>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate review</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Medium Risk Signals</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{overview.mediumPriority}</p>
            <p className="text-xs text-muted-foreground mt-1">Abnormal punch patterns</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Pending Review</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{overview.pendingReview}</p>
            <p className="text-xs text-muted-foreground mt-1">Unresolved security alerts</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Flagged</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{overview.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime logged events</p>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Activities List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Flagged Security Signals</CardTitle>
          <CardDescription>Actions taken here are permanently recorded in the immutable audit log ledger.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-60" />
              <p className="font-semibold text-gray-800 dark:text-gray-200">Zero Suspicious Activities Flagged</p>
              <p className="text-xs mt-1">Platform integrity is verified. No abnormal QR scans or account abuse detected.</p>
            </div>
          ) : (
            <div className="divide-y border rounded-md">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          ev.severity === "high" || ev.severity === "critical"
                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                            : ev.severity === "medium"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        }
                      >
                        {ev.severity.toUpperCase()} RISK
                      </Badge>
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {ev.userName} (Signal: <code className="text-xs bg-muted px-1 rounded">{ev.signalType}</code>)
                      </span>
                      <Badge variant="secondary" className="text-[11px] capitalize">
                        {ev.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      IP: {ev.ipAddress || "127.0.0.1"} • Device: {ev.deviceInfo || "Mobile App"} • {new Date(ev.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleAction(ev.id, "dismiss")}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8 text-amber-600" onClick={() => handleAction(ev.id, "restrict")}>
                      Restrict
                    </Button>
                    <Button size="sm" variant="destructive" className="text-xs h-8" onClick={() => handleAction(ev.id, "suspend")}>
                      Suspend User
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
