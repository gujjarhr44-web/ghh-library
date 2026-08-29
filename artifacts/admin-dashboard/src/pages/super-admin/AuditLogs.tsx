import React, { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, Clock, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  newValues?: any;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Security & Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable log of all administrative actions, configuration publications, and permission changes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Log
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Administrative Action History</CardTitle>
          <CardDescription>Records are stored permanently in the PostgreSQL audit log ledger.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No Audit Logs Recorded Yet</p>
              <p className="text-xs">Actions performed in the control center will appear here.</p>
            </div>
          ) : (
            <div className="divide-y border rounded-md">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs uppercase bg-primary/10 text-primary border-primary/20">
                        {log.action}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {log.targetEntity}: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.targetId}</code>
                      </span>
                    </div>
                    {log.reason && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span> {log.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5" />
                        {log.actorName} ({log.actorRole})
                      </span>
                      <span>•</span>
                      <span>IP: {log.ipAddress || "127.0.0.1"}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(log.createdAt).toLocaleString()}
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
