import React, { useEffect, useState } from "react";
import { LifeBuoy, CheckCircle, Clock, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  resolutionNotes?: string;
  createdAt: string;
}

export default function SupportDeskPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support/tickets");
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved", resolutionNotes: "Resolved by Master Admin" }),
      });
      if (res.ok) {
        toast({ title: "Resolved! ✅", description: "Ticket marked as resolved." });
        fetchTickets();
      }
    } catch {
      toast({ title: "Error", description: "Failed to update ticket", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <LifeBuoy className="h-7 w-7 text-indigo-500" />
            Support Desk & Issue Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Student noise reports, WiFi/AC complaints, payment queries, and app feedback.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Reported Tickets & Issues</CardTitle>
          <CardDescription>Direct student feedback submitted from the mobile application.</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-60" />
              <p className="font-semibold text-gray-800 dark:text-gray-200">No Open Support Tickets</p>
              <p className="text-xs mt-1">All issues have been resolved. Great job!</p>
            </div>
          ) : (
            <div className="divide-y border rounded-md">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs uppercase bg-indigo-500/10 text-indigo-700 border-indigo-500/20">
                        {t.category}
                      </Badge>
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t.subject}</span>
                      <Badge variant={t.status === "resolved" ? "secondary" : "default"} className="text-[11px] capitalize">
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Submitted by {t.userName} • {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {t.status !== "resolved" && (
                    <Button size="sm" variant="outline" className="text-xs h-8 text-green-600 shrink-0" onClick={() => handleResolve(t.id)}>
                      Mark Resolved
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
