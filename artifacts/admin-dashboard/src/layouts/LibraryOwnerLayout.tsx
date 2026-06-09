import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { useText, useFeature } from "@/lib/settings-context";
import { 
  LayoutDashboard, 
  Grid3x3, 
  Users, 
  Calendar, 
  FileCheck, 
  Clock, 
  LogOut,
  Sun,
  Moon,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LibraryOwnerLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // CMS-controlled labels
  const homeLabel = useText("sidebar.home_label", "Dashboard");
  const studentsLabel = useText("sidebar.students_label", "Students");
  const attendanceLabel = useText("sidebar.attendance_label", "Attendance");

  // CMS feature flags
  const showLeaves = useFeature("feature.leaves_page", true);
  const showShifts = useFeature("feature.shifts_page", true);
  const showDarkToggle = useFeature("feature.dark_mode_toggle", true);

  // Dynamic nav items (leaves/shifts can be hidden via CMS)
  const NAV_ITEMS = [
    { href: "/library-owner", label: homeLabel, icon: LayoutDashboard, show: true },
    { href: "/library-owner/seats", label: "Seats", icon: Grid3x3, show: true },
    { href: "/library-owner/students", label: studentsLabel, icon: Users, show: true },
    { href: "/library-owner/attendance", label: attendanceLabel, icon: Calendar, show: true },
    { href: "/library-owner/leaves", label: "Leaves", icon: FileCheck, show: showLeaves },
    { href: "/library-owner/shifts", label: "Shifts", icon: Clock, show: showShifts },
  ].filter(item => item.show);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "library_owner") {
      setLocation("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("role");
    setLocation("/");
  };

  // Helper: check if nav item is active
  const isNavActive = (href: string) => {
    if (href === "/library-owner") return location === "/library-owner" || location === "/library-owner/";
    return location === href || location.startsWith(href + "/");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-sidebar-primary">Library Admin</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
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
      <div className="hidden lg:block w-64 shrink-0 fixed inset-y-0 z-20">
        <SidebarContent />
      </div>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
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
            <h1 className="text-lg font-semibold lg:hidden">Library Admin</h1>
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
                <p className="font-medium">Library Owner</p>
                <p className="text-muted-foreground text-xs">owner@ghh.com</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">LO</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
