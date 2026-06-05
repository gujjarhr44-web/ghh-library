import { useState } from "react";
import { useGetOwnerShifts, useCreateOwnerShift } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Users } from "lucide-react";
import { Shift } from "@workspace/api-client-react/src/generated/api.schemas";

export default function LibraryOwnerShifts() {
  const { toast } = useToast();
  const { data: shifts, isLoading, isFetching, refetch } = useGetOwnerShifts();
  const createShift = useCreateOwnerShift();
  
  const loading = isLoading || isFetching;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startTime || !endTime || !capacity) return;

    createShift.mutate(
      { 
        data: { 
          name, 
          startTime, 
          endTime, 
          capacity: parseInt(capacity) 
        } 
      },
      {
        onSuccess: () => {
          toast({ title: "Shift Created", description: "The new shift has been added successfully." });
          setIsModalOpen(false);
          setName("");
          setStartTime("");
          setEndTime("");
          setCapacity("");
          refetch();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create shift.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
          <p className="text-muted-foreground mt-1">Manage library timings and capacity.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
              <DialogDescription>
                Define a new time block for student seating.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shift Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Morning Shift" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input 
                    id="startTime" 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input 
                    id="endTime" 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  min="1"
                  placeholder="e.g. 50" 
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createShift.isPending}>
                  {createShift.isPending ? "Creating..." : "Save Shift"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 mt-4" />
                <Skeleton className="h-2 w-full rounded-full" />
              </CardContent>
            </Card>
          ))
        ) : shifts && shifts.length > 0 ? (
          shifts.map((shift: Shift) => {
            const enrolled = shift.enrolled ?? 0;
            const cap = shift.capacity ?? 1;
            const occupancyPercent = Math.round((enrolled / cap) * 100);
            return (
              <Card key={shift.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="flex justify-between items-center">
                    <span>{shift.name}</span>
                    <Badge variant="outline">{enrolled} enrolled</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 font-medium text-foreground/80">
                    <Clock className="h-4 w-4 text-primary" />
                    {shift.startTime} - {shift.endTime}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" /> Capacity
                    </span>
                    <span className="font-medium">{enrolled} / {cap}</span>
                  </div>
                  <Progress value={occupancyPercent} className="h-2" />
                  <p className="text-xs text-right mt-2 text-muted-foreground">
                    {occupancyPercent}% full
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg bg-card border-dashed">
            <Clock className="mx-auto h-8 w-8 mb-3 opacity-20" />
            <p>No shifts configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
