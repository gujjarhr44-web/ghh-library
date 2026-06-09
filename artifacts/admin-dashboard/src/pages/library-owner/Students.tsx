import { useState } from "react";
import { useGetOwnerStudents, useAdjustStudentCredits } from "@workspace/api-client-react";
import { useButtonEnabled, useFeature } from "@/lib/settings-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { OwnerStudent } from "@workspace/api-client-react/src/generated/api.schemas";

export default function LibraryOwnerStudents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<OwnerStudent | null>(null);
  
  const [creditAmount, setCreditAmount] = useState("10");
  const [creditReason, setCreditReason] = useState("");

  // CMS controls
  const canAdjustCredits = useButtonEnabled("btn.adjust_credits");
  const showSearch = useFeature("feature.search_bars", true);

  const { data: students, isLoading, isFetching, refetch } = useGetOwnerStudents();
  const adjustCredits = useAdjustStudentCredits();

  const loading = isLoading || isFetching;

  const filteredStudents = students?.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || student.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleAddCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    adjustCredits.mutate(
      { 
        data: { 
          studentId: selectedStudent.id,
          amount: parseInt(creditAmount), 
          reason: creditReason || "Manual adjustment" 
        } 
      },
      {
        onSuccess: () => {
          toast({ title: "Credits Added", description: `Added ${creditAmount} credits to ${selectedStudent.name}.` });
          setIsAddCreditModalOpen(false);
          setCreditAmount("10");
          setCreditReason("");
          refetch();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to add credits.", variant: "destructive" });
        }
      }
    );
  };

  const openCreditModal = (student: OwnerStudent) => {
    setSelectedStudent(student);
    setIsAddCreditModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100";
      case 'suspended': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100";
      case 'expired': return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-100";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-1">Manage enrolled students and their credits.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between">
            <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Attendance %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student: OwnerStudent) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.seat}</TableCell>
                      <TableCell>{student.shift}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${student.creditsRemaining < 5 ? 'text-amber-600 dark:text-amber-500' : ''}`}>
                          {student.creditsRemaining}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{student.attendance}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canAdjustCredits && (
                          <Button variant="outline" size="sm" onClick={() => openCreditModal(student)}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddCreditModalOpen} onOpenChange={setIsAddCreditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Add attendance credits for {selectedStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCredits} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Number of Credits</Label>
              <Input 
                id="amount" 
                type="number" 
                min="1" 
                max="100" 
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input 
                id="reason" 
                placeholder="e.g. Manual recharge, Bonus..." 
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddCreditModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adjustCredits.isPending}>
                {adjustCredits.isPending ? "Adding..." : "Add Credits"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
