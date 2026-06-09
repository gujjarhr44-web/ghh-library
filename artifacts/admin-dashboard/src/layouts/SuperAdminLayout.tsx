import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { useText, useFeature } from "@/lib/settings-context";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Calendar, 
  Bell, 
  LogOut,
  Sun,
  Moon,
  Menu,
  Settings,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // CMS-controlled sidebar labels
  const homeLabel = useText("sidebar.home_label", "Dashboard");
  const librariesLabel = useText("sidebar.libraries_label", "Libraries");
  const studentsLabel = useText("sidebar.students_label", "Students");
  const paymentsLabel = useText("sidebar.payments_label", "Payments");
  const attendanceLabel = useText("sidebar.attendance_label", "Attendance");
  const notificationsLabel = useText("sidebar.notifications_label", "Notifications");
  const settingsLabel = useText("sidebar.settings_label", "App Settings");
  const controlPanelLabel = useText("sidebar.control_panel_label", "Control Panel");

  // CMS-controlled feature flags
  const showDarkToggle = useFeature("feature.dark_mode_toggle", true);

  // Dynamically built nav items using CMS text
  const NAV_ITEMS = [
    { href: "/super-admin", label: homeLabel, icon: LayoutDashboard },
    { href: "/super-admin/libraries", label: librariesLabel, icon: Building2 },
    { href: "/super-admin/students", label: studentsLabel, icon: Users },
    { href: "/super-admin/payments", label: paymentsLabel, icon: CreditCard },
    { href: "/super-admin/attendance", label: attendanceLabel, icon: Calendar },
    { href: "/super-admin/notifications", label: notificationsLabel, icon: Bell },
    { href: "/super-admin/settings", label: settingsLabel, icon: Settings },
    { href: "/super-admin/control-panel", label: `🎛️ ${controlPanelLabel}`, icon: SlidersHorizontal, highlight: true },
  ];

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "super_admin") {
      setLocation("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("role");
    setLocation("/");
  };

  // Helper: check if nav item is active
  // For root dashboard use exact match; for subroutes use startsWith
  const isNavActive = (href: string) => {
    if (href === "/super-admin") return location === "/super-admin" || location === "/super-admin/";
    return location === href || location.startsWith(href + "/");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-sidebar-primary">GHH Admin</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavActive(item.href);
          const Icon = item.icon;
          const isHighlight = (item as { highlight?: boolean }).highlight;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : isHighlight
                  ? "bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 border border-indigo-500/30"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 fixed inset-y-0 z-20">
        <SidebarContent />
      </div>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold lg:hidden">GHH Admin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {showDarkToggle && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-right">
                <p className="font-medium">Super Admin</p>
                <p className="text-muted-foreground text-xs">admin@ghh.com</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">SA</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
