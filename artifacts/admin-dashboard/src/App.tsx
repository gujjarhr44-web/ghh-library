import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSettingsProvider } from "@/lib/settings-context";
import { GlobalPopupOverlay, AnnouncementBanner } from "@/components/GlobalOverlays";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import SuperAdminDashboard from "@/pages/super-admin/Dashboard";
import SuperAdminLibraries from "@/pages/super-admin/Libraries";
import SuperAdminStudents from "@/pages/super-admin/Students";
import SuperAdminPayments from "@/pages/super-admin/Payments";
import SuperAdminAttendance from "@/pages/super-admin/Attendance";
import SuperAdminNotifications from "@/pages/super-admin/Notifications";
import SuperAdminSettings from "@/pages/super-admin/Settings";
import ControlPanel from "@/pages/super-admin/ControlPanel";

import LibraryOwnerLayout from "@/layouts/LibraryOwnerLayout";
import LibraryOwnerDashboard from "@/pages/library-owner/Dashboard";
import LibraryOwnerSeats from "@/pages/library-owner/Seats";
import LibraryOwnerStudents from "@/pages/library-owner/Students";
import LibraryOwnerAttendance from "@/pages/library-owner/Attendance";
import LibraryOwnerLeaves from "@/pages/library-owner/Leaves";
import LibraryOwnerShifts from "@/pages/library-owner/Shifts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />

      {/* Super Admin Routes */}
      <Route path="/super-admin">
        <SuperAdminLayout>
          <SuperAdminDashboard />
        </SuperAdminLayout>
      </Route>
      <Route path="/super-admin/libraries">
        <SuperAdminLayout>
          <SuperAdminLibraries />
        </SuperAdminLayout>
      </Route>
      <Route path="/super-admin/students">
        <SuperAdminLayout>
          <SuperAdminStudents />
        </SuperAdminLayout>
      </Route>
      <Route path="/super-admin/payments">
        <SuperAdminLayout>
          <SuperAdminPayments />
        </SuperAdminLayout>
      </Route>
      <Route path="/super-admin/attendance">
        <SuperAdminLayout>
          <SuperAdminAttendance />
        </SuperAdminLayout>
      </Route>
      <Route path="/super-admin/notifications">
        <SuperAdminLayout>
          <SuperAdminNotifications />
        </SuperAdminLayout>
      </Route>
      <Route path="/super-admin/settings">
        <SuperAdminLayout>
          <SuperAdminSettings />
        </SuperAdminLayout>
      </Route>
      <Route path="/super-admin/control-panel">
        <SuperAdminLayout>
          <ControlPanel />
        </SuperAdminLayout>
      </Route>

      {/* Library Owner Routes */}
      <Route path="/library-owner">
        <LibraryOwnerLayout>
          <LibraryOwnerDashboard />
        </LibraryOwnerLayout>
      </Route>
      <Route path="/library-owner/seats">
        <LibraryOwnerLayout>
          <LibraryOwnerSeats />
        </LibraryOwnerLayout>
      </Route>
      <Route path="/library-owner/students">
        <LibraryOwnerLayout>
          <LibraryOwnerStudents />
        </LibraryOwnerLayout>
      </Route>
      <Route path="/library-owner/attendance">
        <LibraryOwnerLayout>
          <LibraryOwnerAttendance />
        </LibraryOwnerLayout>
      </Route>
      <Route path="/library-owner/leaves">
        <LibraryOwnerLayout>
          <LibraryOwnerLeaves />
        </LibraryOwnerLayout>
      </Route>
      <Route path="/library-owner/shifts">
        <LibraryOwnerLayout>
          <LibraryOwnerShifts />
        </LibraryOwnerLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppSettingsProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              {/* Global announcement banner — top of all pages */}
              <AnnouncementBanner />
              <Router />
              {/* Global popup overlay — shown on all pages when enabled */}
              <GlobalPopupOverlay />
            </WouterRouter>
          </AppSettingsProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
