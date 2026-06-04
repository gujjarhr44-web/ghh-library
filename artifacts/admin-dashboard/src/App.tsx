import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import SuperAdminDashboard from "@/pages/super-admin/Dashboard";
import SuperAdminLibraries from "@/pages/super-admin/Libraries";
import SuperAdminStudents from "@/pages/super-admin/Students";
import SuperAdminPayments from "@/pages/super-admin/Payments";
import SuperAdminAttendance from "@/pages/super-admin/Attendance";
import SuperAdminNotifications from "@/pages/super-admin/Notifications";

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
      <Route path="/super-admin*">
        <SuperAdminLayout>
          <Switch>
            <Route path="/super-admin" component={SuperAdminDashboard} />
            <Route path="/super-admin/libraries" component={SuperAdminLibraries} />
            <Route path="/super-admin/students" component={SuperAdminStudents} />
            <Route path="/super-admin/payments" component={SuperAdminPayments} />
            <Route path="/super-admin/attendance" component={SuperAdminAttendance} />
            <Route path="/super-admin/notifications" component={SuperAdminNotifications} />
            <Route component={NotFound} />
          </Switch>
        </SuperAdminLayout>
      </Route>

      {/* Library Owner Routes */}
      <Route path="/library-owner*">
        <LibraryOwnerLayout>
          <Switch>
            <Route path="/library-owner" component={LibraryOwnerDashboard} />
            <Route path="/library-owner/seats" component={LibraryOwnerSeats} />
            <Route path="/library-owner/students" component={LibraryOwnerStudents} />
            <Route path="/library-owner/attendance" component={LibraryOwnerAttendance} />
            <Route path="/library-owner/leaves" component={LibraryOwnerLeaves} />
            <Route path="/library-owner/shifts" component={LibraryOwnerShifts} />
            <Route component={NotFound} />
          </Switch>
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
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
