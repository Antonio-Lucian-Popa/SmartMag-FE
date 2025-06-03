import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Calendar,
  ClipboardList,
  Package,
  Settings,
  Store,
  Users,
  Bell,
  FileText,
  LogOut,
  Menu,
  X,
  Building,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { getMyNotifications } from '@/services/api/notifications';
import { Notification } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserRole } from '@/types';

interface NavItemProps {
  icon: ReactNode;
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  badge?: number;
}

const NavItem = ({ icon, href, label, isActive, onClick, badge }: NavItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
      isActive 
        ? "bg-accent text-accent-foreground" 
        : "hover:bg-accent hover:text-accent-foreground"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
    {badge ? (
      <Badge variant="secondary" className="ml-auto">
        {badge}
      </Badge>
    ) : null}
  </Link>
);

const MobileNav = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Store Management</SheetTitle>
        </SheetHeader>
        <div className="px-2 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getMyNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    if (user) {
      fetchNotifications();
      
      // Poll for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    {
      icon: <Building className="h-4 w-4" />,
      href: '/company',
      label: 'Company',
      visible: [UserRole.OWNER].includes(user.role),
    },
    {
      icon: <Store className="h-4 w-4" />,
      href: '/stores',
      label: 'Stores',
      visible: [UserRole.OWNER, UserRole.MANAGER].includes(user.role),
    },
    {
      icon: <Package className="h-4 w-4" />,
      href: '/products',
      label: 'Products & Stocks',
      visible: [UserRole.OWNER, UserRole.MANAGER].includes(user.role),
    },
    {
      icon: <Users className="h-4 w-4" />,
      href: '/employees',
      label: 'Employees',
      visible: [UserRole.OWNER, UserRole.MANAGER].includes(user.role),
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      href: '/schedule',
      label: 'Schedule',
      visible: true,
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      href: '/requests',
      label: 'Requests',
      visible: true,
    },
    {
      icon: <BarChart className="h-4 w-4" />,
      href: '/attendance',
      label: 'Attendance',
      visible: true,
    },
    {
      icon: <FileText className="h-4 w-4" />,
      href: '/files',
      label: 'Files',
      visible: [UserRole.OWNER, UserRole.MANAGER].includes(user.role),
    },
    {
      icon: <Bell className="h-4 w-4" />,
      href: '/notifications',
      label: 'Notifications',
      visible: true,
      badge: unreadCount,
    },
    {
      icon: <Settings className="h-4 w-4" />,
      href: '/settings',
      label: 'Settings',
      visible: true,
    },
  ].filter(item => item.visible);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link to="/dashboard" className="hidden md:flex items-center gap-2">
          <Store className="h-6 w-6" />
          <span className="font-semibold">Store Management</span>
        </Link>
        
        <MobileNav>
          <nav className="flex flex-col gap-2">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                icon={item.icon}
                href={item.href}
                label={item.label}
                isActive={isActive(item.href)}
                onClick={() => {}}
                badge={item.badge}
              />
            ))}
          </nav>
        </MobileNav>
        
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="cursor-pointer" onClick={() => navigate('/notifications')}>
                      <div className={cn("flex flex-col gap-1 py-1", !notification.isRead && "font-medium")}>
                        <p className="text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="w-full text-center cursor-pointer">
                  View all
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.firstName} {user.lastName}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="flex flex-1">
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-60 flex-col border-r bg-background">
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="flex flex-col gap-1">
              {navItems.map((item, index) => (
                <NavItem
                  key={index}
                  icon={item.icon}
                  href={item.href}
                  label={item.label}
                  isActive={isActive(item.href)}
                  badge={item.badge}
                />
              ))}
            </div>
          </nav>
          <div className="border-t p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}