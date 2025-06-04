/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { BarChart3, Calendar, Clock, UserCheck } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AttendanceLog, UserRole } from '@/types';
import { checkIn, checkOut, getMyAttendanceLogs } from '@/services/api/attendance';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AttendancePage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getMyAttendanceLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
        toast.error('Failed to load attendance logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleCheckIn = async () => {
    try {
      const log = await checkIn();
      setLogs([...logs, log]);
      toast.success('Checked in successfully');
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const log = await checkOut();
      setLogs(logs.map(l => l.id === log.id ? log : l));
      toast.success('Checked out successfully');
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Failed to check out');
    }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  });

  const getLogForDay = (date: Date) => {
    return logs.find(log => isSameDay(new Date(log.date), date));
  };

  const todayLog = logs.find(log => 
    isSameDay(new Date(log.date), new Date())
  );

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Generate attendance statistics for the chart
  const attendanceStats = monthDays.reduce((acc, day) => {
    const log = getLogForDay(day);
    const status = log?.status || 'ABSENT';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    {
      name: 'Monthly Statistics',
      Present: attendanceStats['PRESENT'] || 0,
      Absent: attendanceStats['ABSENT'] || 0,
      'On Leave': attendanceStats['ON_LEAVE'] || 0,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track and manage attendance records"
        icon={UserCheck}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayLog ? (
                <StatusBadge
                  status={todayLog.status}
                  type="attendance"
                />
              ) : (
                'Not Checked In'
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayLog?.checkInTime
                ? `Checked in at ${format(new Date(todayLog.checkInTime), 'HH:mm')}`
                : 'No check-in recorded'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={handleCheckIn}
                disabled={!!todayLog?.checkInTime}
                className="flex-1"
              >
                Check In
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!todayLog?.checkInTime || !!todayLog?.checkOutTime}
                className="flex-1"
              >
                Check Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => log.status === 'PRESENT').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => log.status === 'ABSENT').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        searchPlaceholder="Search attendance records..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={{
          status: {
            label: "Status",
            options: [
              { label: "Present", value: "PRESENT" },
              { label: "Absent", value: "ABSENT" },
              { label: "On Leave", value: "ON_LEAVE" },
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

      <div className="grid gap-4 md:grid-cols-7 mt-6">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              {format(monthDays[0], 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-sm font-medium text-center py-2">
                  {day}
                </div>
              ))}
              {monthDays.map((day, index) => {
                const log = getLogForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 rounded-lg text-center ${
                      isToday(day)
                        ? 'bg-primary/10'
                        : log
                        ? log.status === 'PRESENT'
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : log.status === 'ABSENT'
                          ? 'bg-red-100 dark:bg-red-900/20'
                          : 'bg-yellow-100 dark:bg-yellow-900/20'
                        : 'bg-muted/50'
                    }`}
                  >
                    <span className="text-sm">
                      {format(day, 'd')}
                    </span>
                    {log && (
                      <div className="mt-1 text-xs">
                        {log.checkInTime && (
                          <div>{format(new Date(log.checkInTime), 'HH:mm')}</div>
                        )}
                        {log.checkOutTime && (
                          <div>{format(new Date(log.checkOutTime), 'HH:mm')}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Attendance Statistics</CardTitle>
            <CardDescription>Monthly attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Present" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="Absent" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="On Leave" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}