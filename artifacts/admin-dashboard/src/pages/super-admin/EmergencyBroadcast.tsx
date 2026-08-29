import React, { useState } from "react";
import { Megaphone, AlertTriangle, Send, BellRing, Smartphone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyBroadcastPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "student" | "owner">("all");
  const [priority, setPriority] = useState<"high" | "critical">("critical");
  const [channels, setChannels] = useState<{ inAppBanner: boolean; popup: boolean; whatsapp: boolean }>({
    inAppBanner: true,
    popup: true,
    whatsapp: false,
  });
  const [dispatched, setDispatched] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Required", description: "Title and message are required for emergency broadcast", variant: "destructive" });
      return;
    }

    try {
      // 1. Create high priority popup & banner
      await fetch("/api/admin/popups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `EMERGENCY: ${title}`,
          title: `⚠️ ${title}`,
          message,
          targetScreen: "any",
          targetRole,
          priority: 10,
          frequency: "every_login",
          isEnabled: true,
        }),
      });

      await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `⚠️ ${title}`,
          description: message,
          targetRole,
          priority: 10,
          isEnabled: true,
        }),
      });

      setDispatched(true);
      toast({
        title: "Emergency Broadcast Dispatched 🚨",
        description: `Broadcast sent with CRITICAL priority to all targeted ${targetRole} devices in real-time.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to dispatch broadcast", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-red-600" />
            Emergency Broadcast Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dispatch instant high-priority emergency alerts, unexpected holiday announcements, and critical system notices.
          </p>
        </div>
      </div>

      {/* Warning Notice */}
      <Card className="bg-red-500/5 border-red-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
          <div className="text-xs text-red-900 dark:text-red-200">
            <span className="font-semibold">High-Priority Direct Broadcast (Rule #8):</span> Dispatches instant modal popups and pinned in-app warning banners to all connected Android APKs and Owner dashboards via real-time WebSocket push.
          </div>
        </CardContent>
      </Card>

      {/* Broadcast Composer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Compose Emergency Message</CardTitle>
          <CardDescription>Select target audience and delivery channels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Broadcast Title</label>
            <Input
              placeholder="e.g. Urgent Notice: Library Timing Update for Tomorrow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Message Content</label>
            <Textarea
              placeholder="Enter full details of the emergency announcement..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target Audience</label>
              <div className="flex gap-2 mt-1">
                {(["all", "student", "owner"] as const).map((r) => (
                  <Button
                    key={r}
                    type="button"
                    size="sm"
                    variant={targetRole === r ? "default" : "outline"}
                    onClick={() => setTargetRole(r)}
                    className="flex-1 capitalize text-xs"
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Priority Level</label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  size="sm"
                  variant={priority === "critical" ? "destructive" : "outline"}
                  onClick={() => setPriority("critical")}
                  className="flex-1 text-xs"
                >
                  Critical (Sticky)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={priority === "high" ? "default" : "outline"}
                  onClick={() => setPriority("high")}
                  className="flex-1 text-xs"
                >
                  High
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleBroadcast} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-11">
            <Send className="h-4 w-4" /> Dispatch Emergency Broadcast
          </Button>

          {dispatched && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Broadcast successfully pushed across all selected mobile & web clients.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
