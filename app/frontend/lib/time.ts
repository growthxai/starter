import { formatDistanceToNow } from 'date-fns';

// Format duration in a human-friendly way. Eg.: 259 seconds -> 4 mins 19 secs
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds} secs`;
  }

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainingSeconds} secs`;
};

// Format timestamp as relative time. Eg.: "2023-06-12T13:45:00Z" -> "34 minutes ago"
export const formatRelativeTime = (timestamp: string | null): string => {
  if (!timestamp) return 'Not started';
  return `${formatDistanceToNow(new Date(timestamp))} ago`;
};
