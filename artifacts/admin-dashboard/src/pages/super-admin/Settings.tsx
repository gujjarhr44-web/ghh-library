import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AppWindow, Settings as SettingsIcon, Check, Save } from "lucide-react";

interface AppSettings {
  appTitle: string;
  welcomeMessage: string;
  welcomeSubheading: string;
  themeColor: string;
  isBookSeatClickable: boolean;
  isMarkAttendanceClickable: boolean;
  isApplyLeaveClickable: boolean;
  isPurchasePlanClickable: boolean;
  showAchievements: boolean;
  showQuickStats: boolean;
  showFacilities: boolean;
  showPopup: boolean;
  popupScreen: "any" | "home" | "library" | "qr" | "leave";
  popupTitle: string;
  popupMessage: string;
  popupMediaUrl: string;
  popupPromptPlaceholder: string;
  popupPrimaryButtonText: string;
  popupSecondaryButtonText: string;
}

export default function SuperAdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    appTitle: "",
    welcomeMessage: "",
    welcomeSubheading: "",
    themeColor: "#0079F2",
    isBookSeatClickable: true,
    isMarkAttendanceClickable: true,
    isApplyLeaveClickable: true,
    isPurchasePlanClickable: true,
    showAchievements: true,
    showQuickStats: true,
    showFacilities: true,
    showPopup: false,
    popupScreen: "any",
    popupTitle: "Important Notice",
    popupMessage: "We are introducing new facilities soon!",
    popupMediaUrl: "",
    popupPromptPlaceholder: "",
    popupPrimaryButtonText: "Okay",
    popupSecondaryButtonText: "Dismiss"
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        toast({
          title: "Error",
          description: "Failed to load settings from server.",
          variant: "destructive"
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        toast({
          title: "Settings Saved",
          description: "Mobile app configuration has been updated successfully."
        });
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save settings to server.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
          <p className="text-muted-foreground mt-1">Configure mobile application text, buttons clickability, and features visibility.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-9 gap-2">
          {saving ? <Save className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: App Info & Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AppWindow className="w-4 h-4 text-primary" />
              App Content & Branding
            </CardTitle>
            <CardDescription>Customize headings, welcome text, and branding of the mobile app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appTitle">App Title</Label>
              <Input
                id="appTitle"
                value={settings.appTitle}
                onChange={(e) => updateSetting("appTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Input
                id="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={(e) => updateSetting("welcomeMessage", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeSubheading">Welcome Subheading</Label>
              <Input
                id="welcomeSubheading"
                value={settings.welcomeSubheading}
                onChange={(e) => updateSetting("welcomeSubheading", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="themeColor">Primary Theme Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="themeColor"
                  type="color"
                  className="w-12 h-10 p-0 border-0 cursor-pointer"
                  value={settings.themeColor}
                  onChange={(e) => updateSetting("themeColor", e.target.value)}
                />
                <Input
                  type="text"
                  className="font-mono text-sm uppercase"
                  value={settings.themeColor}
                  onChange={(e) => updateSetting("themeColor", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Interactive Controls & Toggles */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-primary" />
              Button Settings & Clickability
            </CardTitle>
            <CardDescription>Enable or disable specific button interactions inside the mobile app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isBookSeatClickable">"Book Seat" Button</Label>
                <p className="text-xs text-muted-foreground">Allows student to select and book a seat.</p>
              </div>
              <Switch
                id="isBookSeatClickable"
                checked={settings.isBookSeatClickable}
                onCheckedChange={(val) => updateSetting("isBookSeatClickable", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isMarkAttendanceClickable">"Mark Attendance" Button</Label>
                <p className="text-xs text-muted-foreground">Allows scanning or manually registering check-in.</p>
              </div>
              <Switch
                id="isMarkAttendanceClickable"
                checked={settings.isMarkAttendanceClickable}
                onCheckedChange={(val) => updateSetting("isMarkAttendanceClickable", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isApplyLeaveClickable">"Apply Leave" Button</Label>
                <p className="text-xs text-muted-foreground">Allows requests for taking leaves on specific shifts.</p>
              </div>
              <Switch
                id="isApplyLeaveClickable"
                checked={settings.isApplyLeaveClickable}
                onCheckedChange={(val) => updateSetting("isApplyLeaveClickable", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPurchasePlanClickable">"Purchase Plan" Button</Label>
                <p className="text-xs text-muted-foreground">Allows purchasing plans and upgrading seats.</p>
              </div>
              <Switch
                id="isPurchasePlanClickable"
                checked={settings.isPurchasePlanClickable}
                onCheckedChange={(val) => updateSetting("isPurchasePlanClickable", val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: App Section Visibility */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Section Visibility Customization</CardTitle>
            <CardDescription>Show/Hide entire features or sections inside the user app.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label htmlFor="showAchievements">Achievements List</Label>
                <p className="text-xs text-muted-foreground">Display badge status and academic milestones.</p>
              </div>
              <Switch
                id="showAchievements"
                checked={settings.showAchievements}
                onCheckedChange={(val) => updateSetting("showAchievements", val)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label htmlFor="showQuickStats">Quick Statistics</Label>
                <p className="text-xs text-muted-foreground">Display wallet and daily check-in info.</p>
              </div>
              <Switch
                id="showQuickStats"
                checked={settings.showQuickStats}
                onCheckedChange={(val) => updateSetting("showQuickStats", val)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label htmlFor="showFacilities">Facilities Section</Label>
                <p className="text-xs text-muted-foreground">Display lists of amenities (AC, WiFi, etc.).</p>
              </div>
              <Switch
                id="showFacilities"
                checked={settings.showFacilities}
                onCheckedChange={(val) => updateSetting("showFacilities", val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: App Popup & Prompts Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AppWindow className="w-4 h-4 text-primary" />
              App Popup & Prompts Customization
            </CardTitle>
            <CardDescription>Configure modal popup messages, prompts, media, and target screens inside the mobile application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label htmlFor="showPopup">Enable App-Wide Popup Modal</Label>
                <p className="text-xs text-muted-foreground">Toggles whether the popup message should be shown to users.</p>
              </div>
              <Switch
                id="showPopup"
                checked={settings.showPopup}
                onCheckedChange={(val) => updateSetting("showPopup", val)}
              />
            </div>

            {settings.showPopup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                {/* Left column inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="popupScreen">Target Screen to Show Popup</Label>
                    <select
                      id="popupScreen"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={settings.popupScreen}
                      onChange={(e) => updateSetting("popupScreen", e.target.value as any)}
                    >
                      <option value="any">Show on Any Screen (Global)</option>
                      <option value="home">Home Screen Only</option>
                      <option value="library">Library Details Screen Only</option>
                      <option value="qr">Mark Attendance Screen Only</option>
                      <option value="leave">Apply Leave Screen Only</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popupTitle">Popup Title</Label>
                    <Input
                      id="popupTitle"
                      placeholder="e.g., Important System Update"
                      value={settings.popupTitle}
                      onChange={(e) => updateSetting("popupTitle", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popupMessage">Popup Message Content</Label>
                    <textarea
                      id="popupMessage"
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter the popup body message..."
                      value={settings.popupMessage}
                      onChange={(e) => updateSetting("popupMessage", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popupMediaUrl">Popup Media URL (Image Link)</Label>
                    <Input
                      id="popupMediaUrl"
                      placeholder="https://images.unsplash.com/... (optional)"
                      value={settings.popupMediaUrl}
                      onChange={(e) => updateSetting("popupMediaUrl", e.target.value)}
                    />
                  </div>
                </div>

                {/* Right column inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="popupPromptPlaceholder">Text Input Prompt Placeholder</Label>
                    <Input
                      id="popupPromptPlaceholder"
                      placeholder="e.g., Why are you requesting leave? (Optional - Leave blank to disable text prompt)"
                      value={settings.popupPromptPlaceholder}
                      onChange={(e) => updateSetting("popupPromptPlaceholder", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popupPrimaryButtonText">Primary Action Button Text</Label>
                    <Input
                      id="popupPrimaryButtonText"
                      placeholder="Okay"
                      value={settings.popupPrimaryButtonText}
                      onChange={(e) => updateSetting("popupPrimaryButtonText", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popupSecondaryButtonText">Secondary Dismiss Button Text</Label>
                    <Input
                      id="popupSecondaryButtonText"
                      placeholder="Cancel"
                      value={settings.popupSecondaryButtonText}
                      onChange={(e) => updateSetting("popupSecondaryButtonText", e.target.value)}
                    />
                  </div>

                  {/* Visual Preview */}
                  {settings.popupTitle && (
                    <div className="mt-4 p-4 rounded-lg border border-dashed bg-muted/30">
                      <Label className="text-xs text-muted-foreground block mb-2">Live Popup Preview:</Label>
                      <div className="bg-card border rounded-lg p-4 shadow-sm max-w-sm mx-auto space-y-3">
                        <h4 className="font-semibold text-sm">{settings.popupTitle}</h4>
                        <p className="text-xs text-muted-foreground">{settings.popupMessage}</p>
                        {settings.popupMediaUrl && (
                          <img
                            src={settings.popupMediaUrl}
                            alt="Popup Preview"
                            className="w-full h-24 object-cover rounded-md mt-2"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        )}
                        {settings.popupPromptPlaceholder && (
                          <Input
                            disabled
                            placeholder={settings.popupPromptPlaceholder}
                            className="h-8 text-xs mt-2"
                          />
                        )}
                        <div className="flex gap-2 justify-end mt-4">
                          {settings.popupSecondaryButtonText && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" disabled>
                              {settings.popupSecondaryButtonText}
                            </Button>
                          )}
                          <Button size="sm" className="h-7 text-xs" disabled>
                            {settings.popupPrimaryButtonText || "Confirm"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
