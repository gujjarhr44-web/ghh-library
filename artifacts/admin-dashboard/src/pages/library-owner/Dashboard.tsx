import { useTheme } from "@/components/theme-provider";
import { 
  useGetOwnerStats, 
  useGetOwnerAttendanceChart, 
  useGetOwnerSeatOccupancyChart 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { CSVLink } from "react-csv";
import { Download, Users, AlertTriangle } from "lucide-react";

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

export default function LibraryOwnerDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const { data: stats, isLoading: isLoadingStats, isFetching: isFetchingStats } = useGetOwnerStats();
  const { data: attendanceChart, isLoading: isLoadingAtt, isFetching: isFetchingAtt } = useGetOwnerAttendanceChart();
  const { data: seatChart, isLoading: isLoadingSeat, isFetching: isFetchingSeat } = useGetOwnerSeatOccupancyChart();

  const loadingStats = isLoadingStats || isFetchingStats;
  const loadingAtt = isLoadingAtt || isFetchingAtt;
  const loadingSeat = isLoadingSeat || isFetchingSeat;

  const kpis = [
    { label: "Total Seats", value: stats?.totalSeats || 0 },
    { label: "Occupied Seats", value: stats?.occupiedSeats || 0 },
    { label: "Today's Attendance", value: stats?.todayAttendance || 0 },
    { label: "Monthly Revenue", value: stats?.monthlyRevenue || 0, isCurrency: true, isAmber: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your library's performance.</p>
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
                    style={{ color: kpi.isAmber ? CHART_COLORS.amber : CHART_COLORS.blue }}
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
        
        {/* Weekly Attendance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Weekly Attendance</CardTitle>
            {!loadingAtt && attendanceChart && attendanceChart.length > 0 && (
              <CSVLink data={Array.isArray(attendanceChart) ? attendanceChart : []} filename="weekly-attendance.csv" className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Download className="w-4 h-4" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loadingAtt ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <BarChart data={attendanceChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                  <Legend content={<CustomLegend />} />
                  <Bar dataKey="present" name="Present" fill={CHART_COLORS.green} fillOpacity={0.9} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="absent" name="Absent" fill={CHART_COLORS.red} fillOpacity={0.9} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Seat Occupancy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Seat Occupancy by Shift</CardTitle>
            {!loadingSeat && seatChart && seatChart.length > 0 && (
              <CSVLink data={Array.isArray(seatChart) ? seatChart : []} filename="seat-occupancy.csv" className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Download className="w-4 h-4" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent>
            {loadingSeat ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300} debounce={0}>
                <BarChart data={seatChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="shift" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                  <Legend content={<CustomLegend />} />
                  <Bar dataKey="occupied" name="Occupied" fill={CHART_COLORS.amber} fillOpacity={0.9} radius={[4, 4, 0, 0]} isAnimationActive={false} stackId="a" />
                  <Bar dataKey="available" name="Available" fill={CHART_COLORS.blue} fillOpacity={0.9} radius={[4, 4, 0, 0]} isAnimationActive={false} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-full">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Students</p>
              {loadingStats ? <Skeleton className="h-6 w-16 mt-1" /> : (
                <p className="text-xl font-bold">{stats?.activeStudents || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 text-red-600 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Students with Low Credits (&lt;5)</p>
              {loadingStats ? <Skeleton className="h-6 w-16 mt-1" /> : (
                <p className="text-xl font-bold text-red-600">
                  {stats?.expiringCreditsAlerts || 0}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
