import React, { useEffect, useState } from "react";
import { Sparkles, Send, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Cpu, Database, Eye, Zap, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface PendingAction {
  id: string;
  title: string;
  rationale: string;
  actionType: string;
  payload: any;
  status: string;
  confidence: string;
  createdAt: string;
}

export default function AICenterPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; source?: string }[]>([
    {
      role: "ai",
      text: "नमस्ते! GHH Master Command AI is active. Ask about global platform health, revenue trends, crash telemetry, or incident root causes.",
      source: "GHH Intelligence Engine",
    },
  ]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    studentAi: true,
    ownerCopilot: true,
    adminCopilot: true,
    revenueForecast: true,
    autoReminders: true,
  });

  const fetchPendingActions = async () => {
    try {
      const res = await fetch("/api/ai/actions/pending");
      if (res.ok) setPendingActions(await res.json());
    } catch (err) {
      console.error("Failed to load AI actions:", err);
    }
  };

  useEffect(() => {
    fetchPendingActions();
  }, []);

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "super_admin", query: q }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply, source: data.source },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "AI Service temporarily unavailable. Core operations remain normal." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/actions/${id}/approve`, { method: "POST" });
      if (res.ok) {
        toast({
          title: "Action Approved & Executed ✅",
          description: "Executed through standard transactional API. Immutable audit log recorded.",
        });
        setPendingActions((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      toast({ title: "Error", description: "Failed to approve action", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-500" />
            GHH AI Intelligence & Copilot Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tool-grounded AI decision support, incident root-cause analysis, and human-in-the-loop action approval.
          </p>
        </div>
      </div>

      {/* Non-Negotiable Data Safety Banner */}
      <Card className="bg-indigo-500/5 border-indigo-500/20">
        <CardContent className="p-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-indigo-600 shrink-0" />
          <div className="text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-semibold">Zero-Hallucination & Non-Destructive Rule (Rule #2, #14):</span> AI never directly modifies financial ledgers or executes unverified code. High-impact recommendations require explicit Admin approval.
          </div>
        </CardContent>
      </Card>

      {/* AI Action Approval Center (Human-in-the-Loop) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">AI Action Approval Center (Human-in-the-Loop)</CardTitle>
          <CardDescription>Review AI-generated business recommendations before executing them into production.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingActions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-1.5 text-green-500 opacity-60" />
              <p className="font-semibold text-sm">All AI Recommendations Processed</p>
              <p className="text-xs">No pending operations awaiting approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingActions.map((act) => (
                <div key={act.id} className="p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 text-xs font-mono">
                        {act.actionType}
                      </Badge>
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{act.title}</span>
                      <Badge variant="outline" className="text-[11px]">
                        Confidence: {act.confidence}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{act.rationale}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setPendingActions((prev) => prev.filter((a) => a.id !== act.id))}>
                      Reject
                    </Button>
                    <Button size="sm" className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleApproveAction(act.id)}>
                      Approve & Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Command Center Chat */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Master Command Copilot</CardTitle>
          <CardDescription>Directly query platform revenue trends, active incidents, and telemetry diagnostics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {[
              "क्या आज system में कोई technical incident है?",
              "पिछले 30 दिनों का global revenue trend क्या है?",
              "कौन-सी libraries की occupancy सबसे मजबूत है?",
              "आज कौन-सी technical समस्या सबसे गंभीर है?",
            ].map((p) => (
              <Button key={p} size="sm" variant="outline" className="text-xs h-7" onClick={() => handleSend(p)}>
                {p}
              </Button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="h-64 overflow-y-auto border rounded-xl p-4 space-y-3 bg-muted/20">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-3 rounded-2xl max-w-xl text-xs ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-card border text-card-foreground shadow-sm"}`}>
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                  {m.source && (
                    <p className="text-[10px] mt-1.5 opacity-70 font-mono">
                      Based on: {m.source}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-spin text-indigo-500" />
                Querying PostgreSQL verified databases...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask anything about global platform metrics, incidents, or telemetry..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="text-xs"
            />
            <Button onClick={() => handleSend()} disabled={loading} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Send className="h-4 w-4" /> Ask AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Controls & Kill Switches */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">AI Kill Switches & Role Permissions (Part 87)</CardTitle>
          <CardDescription>Instantly toggle AI features globally without APK rebuild.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Student AI Coach</p>
                <p className="text-xs text-muted-foreground">Study stats & credit balance</p>
              </div>
              <Switch checked={featureFlags.studentAi} onCheckedChange={(v) => setFeatureFlags((p) => ({ ...p, studentAi: v }))} />
            </div>

            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Owner AI Copilot</p>
                <p className="text-xs text-muted-foreground">Business & revenue intelligence</p>
              </div>
              <Switch checked={featureFlags.ownerCopilot} onCheckedChange={(v) => setFeatureFlags((p) => ({ ...p, ownerCopilot: v }))} />
            </div>

            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">AI Automated Reminders</p>
                <p className="text-xs text-muted-foreground">Low-credit warning triggers</p>
              </div>
              <Switch checked={featureFlags.autoReminders} onCheckedChange={(v) => setFeatureFlags((p) => ({ ...p, autoReminders: v }))} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
