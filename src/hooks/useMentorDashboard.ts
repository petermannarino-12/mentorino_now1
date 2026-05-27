import { useApplicationsQuery } from './useApplications';
import { useBookingsQuery } from './useBookings';
import { useTasksQuery } from './useTasks';

export const useMentorDashboard = () => {
  const applicationsQuery = useApplicationsQuery();
  const bookingsQuery = useBookingsQuery();
  const tasksQuery = useTasksQuery();

  return {
    applications: {
      data: applicationsQuery.data || null,
      loading: applicationsQuery.isLoading,
      error: applicationsQuery.error
    },
    bookings: {
      data: bookingsQuery.data || null,
      loading: bookingsQuery.isLoading,
      error: bookingsQuery.error
    },
    tasks: {
      data: tasksQuery.data || null,
      loading: tasksQuery.isLoading,
      error: tasksQuery.error
    },
    refresh: () => {
      applicationsQuery.refetch();
      bookingsQuery.refetch();
      tasksQuery.refetch();
    }
  };
};
