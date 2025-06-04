/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeOffRequest, UserRole } from '@/types';
import { createTimeOffRequest, getMyTimeOffRequests, approveOrRejectTimeOff } from '@/services/api/timeoff';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const timeOffSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters",
  }),
}).refine(data => {
  return data.endDate >= data.startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type TimeOffFormValues = z.infer<typeof timeOffSchema>;

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const form = useForm<TimeOffFormValues>({
    resolver: zodResolver(timeOffSchema),
  });

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getMyTimeOffRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const onSubmit = async (data: TimeOffFormValues) => {
    try {
      const request = await createTimeOffRequest({
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        reason: data.reason,
      });
      setRequests([...requests, request]);
      setIsCreateDialogOpen(false);
      form.reset();
      toast.success('Time off request submitted successfully');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to submit request');
    }
  };

  const handleApproveReject = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const updated = await approveOrRejectTimeOff({
        requestId,
        status,
      });
      setRequests(requests.map(req => 
        req.id === updated.id ? updated : req
      ));
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingRequests = filteredRequests.filter(r => r.status === 'PENDING');
  const pastRequests = filteredRequests.filter(r => r.status !== 'PENDING');

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Manage time off and other requests"
        icon={ClipboardList}
        action={{
          label: "New Request",
          onClick: () => setIsCreateDialogOpen(true),
        }}
      />

      <FilterBar
        searchPlaceholder="Search requests..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={{
          status: {
            label: "Status",
            options: [
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        }}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('');
        }}
      />

      <Tabs defaultValue="pending" className="mt-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Review and manage pending time off requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(request.startDate), 'MMM d, yyyy')} -{' '}
                            {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.reason}
                        </p>
                        <StatusBadge
                          status={request.status}
                          type="request"
                        />
                      </div>
                      {user?.role && [UserRole.OWNER, UserRole.MANAGER].includes(user.role) && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveReject(request.id, 'APPROVED')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveReject(request.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Requests</CardTitle>
              <CardDescription>
                View your past time off requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastRequests.length > 0 ? (
                <div className="space-y-4">
                  {pastRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(request.startDate), 'MMM d, yyyy')} -{' '}
                            {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.reason}
                        </p>
                        <StatusBadge
                          status={request.status}
                          type="request"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No past requests found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Time Off Request</DialogTitle>
            <DialogDescription>
              Submit a new time off request
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        className="rounded-md border"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < (form.getValues().startDate || new Date())
                        }
                        className="rounded-md border"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a reason for your time off request"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Request
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}