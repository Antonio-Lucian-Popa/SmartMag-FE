import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';

import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Notification } from '@/types';
import { getMyNotifications, markNotificationAsRead } from '@/services/api/notifications';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getMyNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="View and manage your notifications"
        icon={Bell}
      />

      <FilterBar
        searchPlaceholder="Search notifications..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="grid gap-4">
        {unreadCount > 0 && (
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications
                  .filter(n => !n.isRead)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              Your notification history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications
                .filter(n => n.isRead)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-muted-foreground">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}