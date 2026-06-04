import { useGetAdminPayments } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import { PaymentTransaction } from "@workspace/api-client-react/src/generated/api.schemas";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default function SuperAdminPayments() {
  const { data: payments, isLoading, isFetching } = useGetAdminPayments();
  const loading = isLoading || isFetching;

  const totalCollections = payments?.filter(p => p.status === 'success').reduce((acc, p) => acc + p.amount, 0) || 0;
  const todaysCollections = payments?.filter(p => {
    if (p.status !== 'success') return false;
    const d = new Date(p.date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).reduce((acc, p) => acc + p.amount, 0) || 0;
  
  const successfulCount = payments?.filter(p => p.status === 'success').length || 0;
  const failedCount = payments?.filter(p => p.status === 'failed').length || 0;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100";
      case 'failed': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100";
      case 'pending': return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-100";
      case 'refunded': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Monitor all platform transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && payments && payments.length > 0 && (
            <CSVLink data={payments} filename="payments.csv">
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CSVLink>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Collections</p>
            {loading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(totalCollections)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Today's Collections</p>
            {loading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(todaysCollections)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Successful</p>
            {loading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-500">{successfulCount}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Failed</p>
            {loading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-500">{failedCount}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : payments && payments.length > 0 ? (
                  payments.map((payment: PaymentTransaction) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">{payment.transactionId || payment.id}</TableCell>
                      <TableCell>
                        {new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>{payment.studentName}</TableCell>
                      <TableCell>{payment.libraryName}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No payments found.
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
