import { useAuth } from '../contexts/AuthContext';
import { useApplicationsQuery } from './useApplications';
import { useBookingsQuery } from './useBookings';
import { useTasksQuery } from './useTasks';
import { useEventsQuery } from './useEvents';

export const useUserDashboardData = () => {
  const { user } = useAuth();
  
  const applicationsQuery = useApplicationsQuery(user?.email || undefined);
  const bookingsQuery = useBookingsQuery(user?.id);
  const tasksQuery = useTasksQuery(user?.id);
  const eventsQuery = useEventsQuery();

  const userApplication = applicationsQuery.data?.find(a => 
    (a.user_id && a.user_id === user?.id) || 
    (a.user_email && user?.email && a.user_email.toLowerCase().trim() === user.email.toLowerCase().trim())
  );

  return {
    currentUser: user,
    application: userApplication,
    bookings: bookingsQuery.data || [],
    taskActivities: tasksQuery.data || [],
    events: eventsQuery.data || [],
    isLoading: applicationsQuery.isLoading || bookingsQuery.isLoading || tasksQuery.isLoading || eventsQuery.isLoading,
    error: applicationsQuery.error || bookingsQuery.error || tasksQuery.error || eventsQuery.error
  };
};
