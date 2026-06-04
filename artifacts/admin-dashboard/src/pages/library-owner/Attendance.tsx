import { useGetOwnerAttendance } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceLog } from "@workspace/api-client-react/src/generated/api.schemas";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function LibraryOwnerAttendance() {
  const { data: attendanceLogs, isLoading, isFetching } = useGetOwnerAttendance();
  const loading = isLoading || isFetching;

  // Derive today's stats from logs
  const todayStr = new Date().toLocaleDateString();
  const todaysLogs = attendanceLogs?.filter(log => {
    if (!log.entryTime && !log.exitTime) return false;
    const logDate = log.entryTime ? new Date(log.entryTime) : new Date();
    return logDate.toLocaleDateString() === todayStr;
  }) || [];

  const presentCount = todaysLogs.filter(log => log.status === 'present').length;
  const absentCount = attendanceLogs?.filter(log => log.status === 'absent' && new Date(log.entryTime || Date.now()).toLocaleDateString() === todayStr).length || 0;
  const leaveCount = attendanceLogs?.filter(log => log.status === 'leave').length || 0; // Simplified

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100";
      case 'absent': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100";
      case 'leave': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100";
      case 'late': return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-100";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-1">Daily attendance logs and tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-600 rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Present Today</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 text-red-600 rounded-full">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-600 rounded-full">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">On Leave</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                <p className="text-2xl font-bold text-blue-600">{leaveCount}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : attendanceLogs && attendanceLogs.length > 0 ? (
                  attendanceLogs.map((log: AttendanceLog) => {
                    // Calculate mock duration if entry/exit exist
                    let duration = "-";
                    if (log.entryTime && log.exitTime) {
                      const diff = new Date(log.exitTime).getTime() - new Date(log.entryTime).getTime();
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      duration = `${hours}h ${mins}m`;
                    }

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.studentName}</TableCell>
                        <TableCell>{log.seatNumber || '-'}</TableCell>
                        <TableCell>{log.shiftName}</TableCell>
                        <TableCell>{log.entryTime ? new Date(log.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</TableCell>
                        <TableCell>{log.exitTime ? new Date(log.exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{duration}</TableCell>
                        <TableCell className="text-right font-mono text-red-500">-{log.creditsDeducted}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No attendance logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
