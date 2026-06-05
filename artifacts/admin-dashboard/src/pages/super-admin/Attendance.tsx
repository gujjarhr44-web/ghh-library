import { useGetAdminAttendance } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceLog } from "@workspace/api-client-react/src/generated/api.schemas";

export default function SuperAdminAttendance() {
  const { data: attendanceLogs, isLoading, isFetching } = useGetAdminAttendance();
  const loading = isLoading || isFetching;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">Platform-wide attendance monitoring.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today's Date</p>
          <p className="font-semibold text-primary">{today}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Exit Time</TableHead>
                  <TableHead className="text-right">Credits Deducted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : attendanceLogs && attendanceLogs.length > 0 ? (
                  attendanceLogs.map((log: AttendanceLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.studentName}</TableCell>
                      <TableCell>{log.library}</TableCell>
                      <TableCell>{log.shift}</TableCell>
                      <TableCell>{log.entryTime || '-'}</TableCell>
                      <TableCell>{log.exitTime || '-'}</TableCell>
                      <TableCell className="text-right font-mono">{log.creditsDeducted ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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
