import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, Store, Product, AttendanceLog, TimeOffRequest } from '@/types';
import { getStoresByCompany } from '@/services/api/stores';
import { getProductsByCompany } from '@/services/api/products';
import { getMyAttendanceLogs } from '@/services/api/attendance';
import { getMyTimeOffRequests } from '@/services/api/timeoff';
import { 
  BarChart3, 
  Building2, 
  CalendarCheck2, 
  Clock, 
  PackageOpen, 
  ShoppingBag, 
  Store as StoreIcon, 
  UserCheck
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if ([UserRole.OWNER, UserRole.MANAGER].includes(user?.role!)) {
          const storesData = await getStoresByCompany();
          setStores(storesData);
          
          const productsData = await getProductsByCompany();
          setProducts(productsData);
        }
        
        const logsData = await getMyAttendanceLogs();
        setAttendanceLogs(logsData);
        
        const requestsData = await getMyTimeOffRequests();
        setTimeOffRequests(requestsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Generate sample chart data for demonstration
  const attendanceData = [
    { name: 'Mon', present: 35, absent: 5 },
    { name: 'Tue', present: 32, absent: 8 },
    { name: 'Wed', present: 38, absent: 2 },
    { name: 'Thu', present: 30, absent: 10 },
    { name: 'Fri', present: 34, absent: 6 },
    { name: 'Sat', present: 25, absent: 5 },
    { name: 'Sun', present: 20, absent: 5 },
  ];

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${user?.firstName}`} 
        description="Dashboard overview of your business"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[UserRole.OWNER, UserRole.MANAGER].includes(user?.role!) && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                <StoreIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stores.length}</div>
                <p className="text-xs text-muted-foreground">Active locations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <PackageOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">Total products</p>
              </CardContent>
            </Card>
          </>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : attendanceLogs.length > 0 ? 'Present' : 'Not checked in'}
            </div>
            <p className="text-xs text-muted-foreground">Current attendance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Off</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeOffRequests.filter(r => r.status === 'PENDING').length}</div>
            <p className="text-xs text-muted-foreground">Pending requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-8 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="hsl(var(--chart-1))" name="Present" />
                <Bar dataKey="absent" fill="hsl(var(--chart-2))" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Clock className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Check In</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <CalendarCheck2 className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Request Time Off</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <ShoppingBag className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">View Schedule</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Building2 className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Company Info</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">You checked in</p>
                  <p className="text-sm text-muted-foreground">Today at 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <CalendarCheck2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Your time off was approved</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <StoreIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">New schedule published</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}