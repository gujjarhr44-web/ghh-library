import { useState } from "react";
import { useGetAdminNotifications, useSendAdminNotification } from "@workspace/api-client-react";
import { useButtonEnabled } from "@/lib/settings-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send } from "lucide-react";
import { Notification, NotificationInputTarget, NotificationInputType } from "@workspace/api-client-react/src/generated/api.schemas";

export default function SuperAdminNotifications() {
  const { toast } = useToast();
  const { data: notifications, isLoading, isFetching, refetch } = useGetAdminNotifications();
  const sendNotification = useSendAdminNotification();
  
  const loading = isLoading || isFetching;

  // CMS control
  const canSend = useButtonEnabled("btn.send_notification");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<NotificationInputTarget>("all");
  const [type, setType] = useState<NotificationInputType>("announcement");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast({ title: "Validation Error", description: "Title and message are required", variant: "destructive" });
      return;
    }

    sendNotification.mutate(
      { data: { title, message, target, type } },
      {
        onSuccess: () => {
          toast({ title: "Notification Sent", description: "Your message has been broadcasted successfully." });
          setTitle("");
          setMessage("");
          refetch();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to send notification.", variant: "destructive" });
        }
      }
    );
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alert': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'reminder': return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case 'promotion': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"; // announcement
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">Broadcast messages to libraries and students.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send New Notification
          </CardTitle>
          <CardDescription>Create a new broadcast message</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={target} onValueChange={(v) => setTarget(v as NotificationInputTarget)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="library">Library Owners</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as NotificationInputType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                placeholder="Message title..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                placeholder="Type your message here..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" disabled={!canSend || sendNotification.isPending} className="w-full sm:w-auto">
              {!canSend ? "Send Disabled" : sendNotification.isPending ? "Sending..." : "Send Broadcast"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mt-8 mb-4">Recent Notifications</h2>
      
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1"><Skeleton className="h-8 w-8 rounded-full" /></div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification: Notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1">
                  <div className={`p-2 rounded-full ${getTypeColor(notification.type).replace('text-', 'text-opacity-0 bg-opacity-50 text-')}`}>
                    <Bell className={`h-4 w-4 ${getTypeColor(notification.type).split(' ')[1]}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize border px-2 py-0.5 rounded-full">{notification.target}</span>
                      <span>{new Date(notification.sentAt).toLocaleDateString()} {new Date(notification.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`mb-2 capitalize ${getTypeColor(notification.type)}`}>
                    {notification.type}
                  </Badge>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{notification.message}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 mb-3 opacity-20" />
              <p>No notifications sent yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
