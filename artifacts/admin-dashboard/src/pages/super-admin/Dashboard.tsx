import { useTheme } from "@/components/theme-provider";
import { 
  useGetAdminStats, 
  useGetStudentGrowthChart, 
  useGetRevenueTrendChart, 
  useGetAttendanceTrendChart,
  useGetAdminLibraries
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";

const CHART_COLORS = {
  blue: "#0079F2",
  amber: "#F59E0B",
  green: "#009118",
  red: "#A60808",
  purple: "#795EFF"
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3 border shadow-sm text-sm dark:text-gray-200">
      <div className="mb-2 font-medium flex items-center gap-2">
        {payload.length === 1 && payload[0].color && (
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: payload[0].color }} />
        )}
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 mt-1">
          {payload.length > 1 && entry.color && (
            <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
          )}
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto font-semibold">
            {entry.name.toLowerCase().includes('revenue') 
              ? formatCurrency(entry.value) 
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || payload.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-4 text-[13px] mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="dark:text-gray-300">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const { data: stats, isLoading: isLoadingStats, isFetching: isFetchingStats } = useGetAdminStats();
  const { data: studentGrowth, isLoading: isLoadingSG, isFetching: isFetchingSG } = useGetStudentGrowthChart();
  const { data: revenueTrend, isLoading: isLoadingRev, isFetching: isFetchingRev } = useGetRevenueTrendChart();
  const { data: attendanceTrend, isLoading: isLoadingAtt, isFetching: isFetchingAtt } = useGetAttendanceTrendChart();
  const { data: libraries, isLoading: isLoadingLib, isFetching: isFetchingLib } = useGetAdminLibraries();

  const loadingStats = isLoadingStats || isFetchingStats;
  const loadingSG = isLoadingSG || isFetchingSG;
  const loadingRev = isLoadingRev || isFetchingRev;
  const loadingAtt = isLoadingAtt || isFetchingAtt;
  const loadingLib = isLoadingLib || isFetchingLib;

  // Derive top 3 libraries by revenue
  const topLibraries = libraries 
    ? [...libraries].sort((a, b) => b.revenue - a.revenue).slice(0, 3).map(l => ({ name: l.name, revenue: l.revenue }))
    : [];

  const kpis = [
    { label: "Total Libraries", value: stats?.totalLibraries || 0, isAmber: true },
    { label: "Active Libraries", value: stats?.activeLibraries || 0 },
    { label: "Total Students", value: stats?.totalStudents || 0 },
    { label: "Active Students", value: stats?.activeStudents || 0 },
    { label: "Daily Attendance", value: stats?.dailyAttendance || 0 },
    { label: "Available Seats", value: stats?.availableSeats || 0 },
    { label: "Monthly Revenue", value: stats?.monthlyRevenue || 0, isCurrency: true },
    { label: "Pending Approvals", value: stats?.pendingApprovals || 0, isRed: (stats?.pendingApprovals || 0) > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and key metrics.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              {loadingStats ? (
                <>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                  <p 
                    className="text-2xl font-bold mt-1" 
                    style={{ color: kpi.isAmber ? CHART_COLORS.amber : kpi.isRed ? CHART_COLORS.red : CHART_COLORS.blue }}
                  >
                    {kpi.isCurrency ? formatCurrency(kpi.value) : kpi.value.toLocaleString()}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Student Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Student Growth</CardTitle>
            {!loadingSG && studentGrowth && studentGrowth.length > 0 && (
              <CSVLink data={studentGrowth} filename="student-growth.csv" className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Download className="w-4 h-4" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loadingSG ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <AreaChart data={studentGrowth}>
                  <defs>
                    <linearGradient id="gradSGTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradSGActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.purple} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={CHART_COLORS.purple} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                  <Legend content={<CustomLegend />} />
                  <Area type="monotone" dataKey="value" name="Total Students" fill="url(#gradSGTotal)" stroke={CHART_COLORS.blue} fillOpacity={1} strokeWidth={2} isAnimationActive={false} />
                  <Area type="monotone" dataKey="secondary" name="Active Students" fill="url(#gradSGActive)" stroke={CHART_COLORS.purple} fillOpacity={1} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
            {!loadingRev && revenueTrend && revenueTrend.length > 0 && (
              <CSVLink data={revenueTrend} filename="revenue-trend.csv" className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Download className="w-4 h-4" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loadingRev ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <BarChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                  <Legend content={<CustomLegend />} />
                  <Bar dataKey="value" name="Revenue" fill={CHART_COLORS.amber} fillOpacity={0.9} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Attendance Trend</CardTitle>
            {!loadingAtt && attendanceTrend && attendanceTrend.length > 0 && (
              <CSVLink data={attendanceTrend} filename="attendance-trend.csv" className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Download className="w-4 h-4" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loadingAtt ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="gradAtt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                  <Legend content={<CustomLegend />} />
                  <Area type="monotone" dataKey="value" name="Attendance" fill="url(#gradAtt)" stroke={CHART_COLORS.green} fillOpacity={1} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Libraries by Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Top Libraries by Revenue</CardTitle>
            {!loadingLib && topLibraries.length > 0 && (
              <CSVLink data={topLibraries} filename="top-libraries.csv" className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Download className="w-4 h-4" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loadingLib ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <BarChart data={topLibraries} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} width={80} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.blue} fillOpacity={0.9} radius={[0, 4, 4, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
