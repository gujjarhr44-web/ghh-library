import { useState } from "react";
import { useGetOwnerSeats, useUpdateOwnerSeat } from "@workspace/api-client-react";
import { useButtonEnabled } from "@/lib/settings-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Seat, SeatUpdateStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export default function LibraryOwnerSeats() {
  const { toast } = useToast();
  const { data: seats, isLoading, isFetching, refetch } = useGetOwnerSeats();
  const updateSeat = useUpdateOwnerSeat();
  
  const loading = isLoading || isFetching;

  // CMS control
  const canUpdateSeat = useButtonEnabled("btn.update_seat");

  const handleStatusChange = (id: string, newStatus: SeatUpdateStatus) => {
    updateSeat.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast({ title: "Seat Updated", description: "Seat status successfully updated." });
          refetch();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update seat status.", variant: "destructive" });
        }
      }
    );
  };

  const getSeatColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return "bg-green-100 hover:bg-green-200 border-green-300 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:border-green-700 dark:text-green-100";
      case 'occupied': return "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 dark:bg-amber-900 dark:hover:bg-amber-800 dark:border-amber-700 dark:text-amber-100";
      case 'reserved': return "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-700 dark:text-blue-100";
      case 'maintenance': return "bg-gray-200 hover:bg-gray-300 border-gray-400 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300";
      default: return "bg-gray-100 border-gray-200";
    }
  };

  const stats = {
    available: seats?.filter(s => s.status === 'available').length || 0,
    occupied: seats?.filter(s => s.status === 'occupied').length || 0,
    reserved: seats?.filter(s => s.status === 'reserved').length || 0,
    maintenance: seats?.filter(s => s.status === 'maintenance').length || 0,
  };

  // Generate a mock grid if seats exist, else use skeleton
  // We'll assume a 6x10 grid layout for visualization
  const gridRows = 6;
  const gridCols = 10;
  
  // Sort seats to fit in the grid
  const sortedSeats = seats ? [...seats].sort((a, b) => a.number.localeCompare(b.number)) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seat Management</h1>
        <p className="text-muted-foreground mt-1">Live overview of library seat occupancy.</p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300 dark:bg-green-900 dark:border-green-700" />
                <span>Available ({stats.available})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300 dark:bg-amber-900 dark:border-amber-700" />
                <span>Occupied ({stats.occupied})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300 dark:bg-blue-900 dark:border-blue-700" />
                <span>Reserved ({stats.reserved})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 border border-gray-400 dark:bg-gray-800 dark:border-gray-600" />
                <span>Maintenance ({stats.maintenance})</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border rounded-lg p-6 overflow-x-auto">
            <div 
              className="grid gap-3 min-w-[800px]" 
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {loading ? (
                [...Array(60)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))
              ) : sortedSeats.length > 0 ? (
                sortedSeats.map((seat: Seat) => (
                  <Popover key={seat.id}>
                    <PopoverTrigger asChild>
                      <button 
                        className={`aspect-square rounded-md border flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getSeatColor(seat.status)}`}
                      >
                        {seat.number}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-lg">Seat {seat.number}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{seat.category} Category</p>
                        </div>
                        
                        {seat.studentName && (
                          <div className="bg-muted p-2 rounded-md text-sm">
                            <span className="text-muted-foreground">Current Student:</span>
                            <div className="font-medium">{seat.studentName}</div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Change Status</label>
                          <Select 
                            defaultValue={seat.status} 
                            onValueChange={(v) => handleStatusChange(seat.id, v as SeatUpdateStatus)}
                            disabled={!canUpdateSeat}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No seats configured.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
