import { useGetOwnerLeaves, useApproveLeave, useRejectLeave } from "@workspace/api-client-react";
import { useButtonEnabled } from "@/lib/settings-context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LeaveRequest } from "@workspace/api-client-react/src/generated/api.schemas";

export default function LibraryOwnerLeaves() {
  const { toast } = useToast();
  const { data: leaves, isLoading, isFetching, refetch } = useGetOwnerLeaves();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  
  const loading = isLoading || isFetching;

  // CMS button controls
  const canApprove = useButtonEnabled("btn.approve_leave");
  const canReject = useButtonEnabled("btn.reject_leave");

  const handleApprove = (id: string) => {
    approveLeave.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Leave Approved", description: "The leave request has been approved." });
          refetch();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to approve leave.", variant: "destructive" });
        }
      }
    );
  };

  const handleReject = (id: string) => {
    rejectLeave.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Leave Rejected", description: "The leave request has been rejected." });
          refetch();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to reject leave.", variant: "destructive" });
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'rejected': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'pending': return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const pendingLeaves = leaves?.filter(l => l.status === 'pending') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-muted-foreground mt-1">Manage student absence requests.</p>
      </div>

      {pendingLeaves.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">Pending Actions</h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80">You have {pendingLeaves.length} leave request(s) waiting for approval.</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-1/3">Reason</TableHead>
                  <TableHead>Applied At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : leaves && leaves.length > 0 ? (
                  leaves.map((leave: LeaveRequest) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.studentName}</TableCell>
                      <TableCell>{leave.seat || '-'}</TableCell>
                      <TableCell>{new Date(leave.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate" title={leave.reason}>{leave.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(leave.appliedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(leave.status)}>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {leave.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            {canApprove && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/50"
                                onClick={() => handleApprove(leave.id)}
                                disabled={approveLeave.isPending || rejectLeave.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                              </Button>
                            )}
                            {canReject && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50"
                                onClick={() => handleReject(leave.id)}
                                disabled={approveLeave.isPending || rejectLeave.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No leave requests found.
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
