import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'default' 
  | 'secondary' 
  | 'outline';

interface StatusMap {
  [key: string]: {
    label: string;
    variant: StatusType;
  };
}

// Request status mapping
const requestStatusMap: StatusMap = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'error' },
};

// Shift status mapping
const shiftStatusMap: StatusMap = {
  SCHEDULED: { label: 'Scheduled', variant: 'default' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  MISSED: { label: 'Missed', variant: 'error' },
};

// Attendance status mapping
const attendanceStatusMap: StatusMap = {
  PRESENT: { label: 'Present', variant: 'success' },
  ABSENT: { label: 'Absent', variant: 'error' },
  ON_LEAVE: { label: 'On Leave', variant: 'secondary' },
};

interface StatusBadgeProps {
  status: string;
  type: 'request' | 'shift' | 'attendance';
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let statusConfig = { label: status, variant: 'default' as StatusType };

  switch (type) {
    case 'request':
      statusConfig = requestStatusMap[status] || statusConfig;
      break;
    case 'shift':
      statusConfig = shiftStatusMap[status] || statusConfig;
      break;
    case 'attendance':
      statusConfig = attendanceStatusMap[status] || statusConfig;
      break;
  }

  return (
    <Badge 
      variant={statusConfig.variant} 
      className={cn("capitalize", className)}
    >
      {statusConfig.label}
    </Badge>
  );
}