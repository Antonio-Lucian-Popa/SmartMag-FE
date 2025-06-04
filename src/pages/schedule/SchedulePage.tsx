import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, RefreshCcw, Users } from 'lucide-react';
import { format, startOfToday, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shift, ShiftSwapRequest, User, UserRole } from '@/types';
import { getMySchedule, createShiftSwap, getMySwapRequests } from '@/services/api/shifts';
import { toast } from 'sonner';

export default function SchedulePage() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const [scheduleData, swapData] = await Promise.all([
          getMySchedule(),
          getMySwapRequests()
        ]);
        setShifts(scheduleData);
        setSwapRequests(swapData);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate),
  });

  const shiftsForDay = (date: Date) => {
    return shifts.filter(shift => 
      isSameDay(new Date(shift.startTime), date)
    );
  };

  const handleSwapRequest = async (shift: Shift) => {
    setSelectedShift(shift);
    setIsSwapDialogOpen(true);
  };

  const submitSwapRequest = async (requesteeId: string) => {
    if (!selectedShift) return;

    try {
      const request = await createShiftSwap({
        requesterShiftId: selectedShift.id,
        requesteeId,
      });
      setSwapRequests([...swapRequests, request]);
      setIsSwapDialogOpen(false);
      toast.success('Shift swap request sent');
    } catch (error) {
      console.error('Error creating swap request:', error);
      toast.error('Failed to send swap request');
    }
  };

  return (
    <div>
      <PageHeader
        title="Schedule"
        description="View and manage your work schedule"
        icon={CalendarIcon}
      />

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <div
                  key={day.toISOString()}
                  className={`p-2 rounded-lg ${
                    isToday(day) ? 'bg-primary/10' : 'bg-muted/50'
                  }`}
                >
                  <div className="text-sm font-medium mb-2">
                    {format(day, 'EEE')}
                    <span className="ml-1 text-muted-foreground">
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {shiftsForDay(day).map((shift) => (
                      <div
                        key={shift.id}
                        className="bg-card p-2 rounded border text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(shift.startTime), 'HH:mm')} -
                              {format(new Date(shift.endTime), 'HH:mm')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSwapRequest(shift)}
                          >
                            <RefreshCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view shifts</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Swap Requests</CardTitle>
            <CardDescription>Manage your shift swap requests</CardDescription>
          </CardHeader>
          <CardContent>
            {swapRequests.length > 0 ? (
              <div className="space-y-4">
                {swapRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        Swap Request #{request.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {request.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'PENDING' && (
                        <Button variant="outline" size="sm">
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No swap requests found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
            <DialogDescription>
              Select an employee to swap shifts with
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select onValueChange={(value) => submitSwapRequest(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">John Doe</SelectItem>
                <SelectItem value="2">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}