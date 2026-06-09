import { useState, useCallback } from "react";
import { useAppSettings, useText, type AppSetting } from "@/lib/settings-context";
import {
  Type, ToggleLeft, Palette, Bell, Database, Megaphone, AlertTriangle,
  Check, RefreshCw, Search, Download, Upload, Wifi, WifiOff, Eye, EyeOff,
  Pencil, Save, X, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// ── Types & Helpers ───────────────────────────────────────────────────────────
type TabId = "texts" | "buttons" | "features" | "theme" | "popups" | "announcements" | "danger";

const TABS: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "texts", label: "Text Editor", icon: <Type className="h-4 w-4" />, color: "text-blue-500" },
  { id: "buttons", label: "Buttons", icon: <ToggleLeft className="h-4 w-4" />, color: "text-purple-500" },
  { id: "features", label: "Features", icon: <Zap className="h-4 w-4" />, color: "text-green-500" },
  { id: "theme", label: "Theme", icon: <Palette className="h-4 w-4" />, color: "text-pink-500" },
  { id: "popups", label: "Popups", icon: <Bell className="h-4 w-4" />, color: "text-amber-500" },
  { id: "announcements", label: "Banners", icon: <Megaphone className="h-4 w-4" />, color: "text-indigo-500" },
  { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-500" },
];

// ── Setting Row Component ─────────────────────────────────────────────────────
function SettingRow({ setting, onUpdate }: { setting: AppSetting; onUpdate: (key: string, value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(setting.value);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(setting.key, draft);
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(setting.value);
    setEditing(false);
  };

  if (setting.type === "boolean") {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-colors group">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{setting.label}</p>
          {setting.description && <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>}
          <code className="text-xs text-gray-400 font-mono">{setting.key}</code>
        </div>
        <Switch
          checked={setting.value === "true"}
          onCheckedChange={(checked) => onUpdate(setting.key, String(checked))}
          className="ml-3"
        />
      </div>
    );
  }

  if (setting.type === "color") {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{setting.label}</p>
          <code className="text-xs text-gray-400 font-mono">{setting.key}</code>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <div className="h-8 w-8 rounded-full border-2 border-white shadow" style={{ background: setting.value }} />
          <input
            type="color"
            value={setting.value}
            onChange={(e) => onUpdate(setting.key, e.target.value)}
            className="h-8 w-16 rounded cursor-pointer border border-gray-200"
          />
          <span className="text-xs font-mono text-gray-500">{setting.value}</span>
        </div>
      </div>
    );
  }

  if (setting.type === "select" && setting.options) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{setting.label}</p>
          <code className="text-xs text-gray-400 font-mono">{setting.key}</code>
        </div>
        <select
          value={setting.value}
          onChange={(e) => onUpdate(setting.key, e.target.value)}
          className="ml-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {setting.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  // Text type
  return (
    <div className="p-3 rounded-lg hover:bg-white/50 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{setting.label}</p>
          {setting.description && <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>}
          <code className="text-xs text-gray-400 font-mono">{setting.key}</code>
        </div>
        {!editing && (
          <button
            onClick={() => { setDraft(setting.value); setEditing(true); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-indigo-50 text-indigo-500 transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-2 flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 text-sm h-8"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          />
          <Button size="sm" onClick={save} disabled={saving} className="h-8 px-2 bg-green-600 hover:bg-green-700">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" variant="outline" onClick={cancel} className="h-8 px-2">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          className="mt-1 text-sm text-gray-600 bg-white/60 rounded px-2 py-1 border border-transparent cursor-pointer hover:border-indigo-200 transition-colors"
          onClick={() => { setDraft(setting.value); setEditing(true); }}
        >
          {setting.value || <span className="italic text-gray-400">Empty</span>}
        </div>
      )}
    </div>
  );
}

// ── Settings List with Search ─────────────────────────────────────────────────
function SettingsList({ category, settings, onUpdate }: {
  category: string;
  settings: Map<string, AppSetting>;
  onUpdate: (key: string, value: string) => void;
}) {
  const [search, setSearch] = useState("");
  const items = Array.from(settings.values())
    .filter((s) => s.category === category)
    .filter((s) =>
      !search ||
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.key.toLowerCase().includes(search.toLowerCase()) ||
      s.value.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search settings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="space-y-1 divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No settings found</p>
        ) : (
          items.map((s) => <SettingRow key={s.key} setting={s} onUpdate={onUpdate} />)
        )}
      </div>
    </div>
  );
}

// ── Main Control Panel Page ───────────────────────────────────────────────────
export default function ControlPanel() {
  const { settings, isLoaded, isConnected, updateSetting, bulkUpdate, resetDefaults } = useAppSettings();
  const [activeTab, setActiveTab] = useState<TabId>("texts");
  const [resetting, setResetting] = useState(false);
  const { toast } = useToast();

  const handleUpdate = useCallback(async (key: string, value: string) => {
    await updateSetting(key, value);
    toast({
      title: "✅ Setting Updated",
      description: `${key} = ${value}`,
      duration: 2000,
    });
  }, [updateSetting, toast]);

  const handleReset = async () => {
    setResetting(true);
    await resetDefaults();
    setResetting(false);
    toast({ title: "✅ Settings Reset", description: "All settings restored to defaults" });
  };

  const handleExport = () => {
    const data = Array.from(settings.values());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const arr = JSON.parse(text) as Array<{ key: string; value: string }>;
      const updates: Record<string, string> = {};
      arr.forEach((s) => { if (s.key) updates[s.key] = String(s.value ?? ""); });
      await bulkUpdate(updates);
      toast({ title: "✅ Settings Imported", description: `${arr.length} settings imported` });
    };
    input.click();
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-gray-500">Loading Control Panel...</p>
        </div>
      </div>
    );
  }

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🎛️</span> Admin Control Panel
          </h1>
          <p className="text-sm text-gray-500 mt-1">App की हर चीज़ यहाँ से control करें — live updates</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Live Connected" : "Disconnected"}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className={activeTab === tab.id ? tab.color : ""}>{tab.icon}</span>
            {tab.label}
            {tab.id === "texts" && (
              <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                {Array.from(settings.values()).filter((s) => s.category === "texts").length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
          <span className={activeTabData.color}>{activeTabData.icon}</span>
          <h2 className="font-semibold text-gray-800">{activeTabData.label}</h2>
          <span className="text-xs text-gray-400 ml-auto">
            {activeTab !== "danger" && `${Array.from(settings.values()).filter((s) => s.category === activeTab).length} settings`}
          </span>
        </div>

        {/* Texts Tab */}
        {activeTab === "texts" && (
          <div>
            <p className="text-xs text-gray-500 mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
              💡 किसी भी row पर click करें या ✏️ icon press करें text edit करने के लिए। Change होते ही app में live दिखेगा।
            </p>
            <SettingsList category="texts" settings={settings} onUpdate={handleUpdate} />
          </div>
        )}

        {/* Buttons Tab */}
        {activeTab === "buttons" && (
          <div>
            <p className="text-xs text-gray-500 mb-4 bg-purple-50 border border-purple-100 rounded-lg p-3">
              💡 Toggle OFF करते ही वह button app में disabled हो जाएगा।
            </p>
            <SettingsList category="buttons" settings={settings} onUpdate={handleUpdate} />
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div>
            <p className="text-xs text-gray-500 mb-4 bg-green-50 border border-green-100 rounded-lg p-3">
              💡 Feature OFF करने पर वह section/page users को नहीं दिखेगा।
            </p>
            <SettingsList category="features" settings={settings} onUpdate={handleUpdate} />
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div>
            <p className="text-xs text-gray-500 mb-4 bg-pink-50 border border-pink-100 rounded-lg p-3">
              🎨 Colors change होते ही app का look instantly बदल जाएगा।
            </p>
            <SettingsList category="theme" settings={settings} onUpdate={handleUpdate} />
          </div>
        )}

        {/* Popups Tab */}
        {activeTab === "popups" && (
          <div>
            <p className="text-xs text-gray-500 mb-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
              📢 "Global Popup Enable" ON करते ही सभी users को popup दिखेगा। Type, title, message customize करें।
            </p>
            <SettingsList category="popups" settings={settings} onUpdate={handleUpdate} />
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div>
            <p className="text-xs text-gray-500 mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              🔔 "Top Banner Enable" ON करते ही सभी pages पर top पर banner दिखेगा।
            </p>
            <SettingsList category="announcements" settings={settings} onUpdate={handleUpdate} />
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === "danger" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" /> Reset All Settings
              </h3>
              <p className="text-sm text-red-600 mb-4">
                सभी settings default values पर reset हो जाएंगी। यह action undo नहीं हो सकती।
              </p>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={resetting}
                className="gap-2"
              >
                {resetting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                Reset to Defaults
              </Button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <h3 className="font-semibold text-orange-700 flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4" /> Force Reload All Clients
              </h3>
              <p className="text-sm text-orange-600 mb-4">
                सभी connected browsers को reload करें (maintenance के बाद)।
              </p>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50 gap-2"
                onClick={async () => {
                  await fetch("/api/admin/cms/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "_force_reload", value: String(Date.now()) }),
                  });
                  toast({ title: "✅ Reload signal sent", description: "All clients will reload shortly" });
                }}
              >
                <RefreshCw className="h-4 w-4" /> Send Reload Signal
              </Button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" /> Settings Count
              </h3>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {["texts", "buttons", "features", "theme", "popups", "announcements"].map((cat) => (
                  <div key={cat} className="text-center p-2 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-gray-800">
                      {Array.from(settings.values()).filter((s) => s.category === cat).length}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{cat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
