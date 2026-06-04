import { useState } from "react";
import { useGetAdminLibraries, useUpdateAdminLibrary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Download, MoreHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CSVLink } from "react-csv";
import { useToast } from "@/hooks/use-toast";
import { AdminLibrary } from "@workspace/api-client-react/src/generated/api.schemas";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default function SuperAdminLibraries() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: libraries, isLoading, isFetching, refetch } = useGetAdminLibraries();
  const updateLibrary = useUpdateAdminLibrary();

  const loading = isLoading || isFetching;

  const filteredLibraries = libraries?.filter((lib) => {
    const matchesSearch = 
      lib.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lib.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lib.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusChange = (id: string, newStatus: any) => {
    updateLibrary.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast({ title: "Status updated successfully", description: `Library status changed to ${newStatus}` });
          refetch();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update library status", variant: "destructive" });
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100";
      case 'pending': return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-100";
      case 'suspended': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100";
      case 'rejected': return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Libraries</h1>
          <p className="text-muted-foreground mt-1">Manage all registered libraries.</p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && filteredLibraries.length > 0 && (
            <CSVLink data={filteredLibraries} filename="libraries.csv">
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CSVLink>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between">
            <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search libraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Seats</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLibraries.length > 0 ? (
                  filteredLibraries.map((lib: AdminLibrary) => (
                    <TableRow key={lib.id}>
                      <TableCell className="font-medium">{lib.name}</TableCell>
                      <TableCell>
                        <div>{lib.ownerName}</div>
                        <div className="text-xs text-muted-foreground">{lib.ownerMobile}</div>
                      </TableCell>
                      <TableCell>{lib.city}</TableCell>
                      <TableCell className="text-right">{lib.totalSeats}</TableCell>
                      <TableCell className="text-right">{lib.activeStudents}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(lib.revenue)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(lib.status)}>
                          {lib.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(lib.id, "approved")}>Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(lib.id, "suspended")}>Suspend</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(lib.id, "rejected")}>Reject</DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No libraries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t flex justify-end">
            <p className="text-sm text-muted-foreground">Showing {filteredLibraries.length} libraries</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
