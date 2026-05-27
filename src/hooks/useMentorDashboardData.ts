import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useApplicationsQuery } from './useApplications';
import { useBookingsQuery } from './useBookings';
import { useTasksQuery } from './useTasks';
import { useEventsQuery } from './useEvents';
import type { Review } from '../types';

export const useMentorDashboardData = () => {
  const applicationsQuery = useApplicationsQuery();
  const bookingsQuery = useBookingsQuery();
  const tasksQuery = useTasksQuery();
  const eventsQuery = useEventsQuery();
  const reviewsQuery = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Review[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    applications: applicationsQuery.data || [],
    bookings: bookingsQuery.data || [],
    tasks: tasksQuery.data || [],
    events: eventsQuery.data || [],
    reviews: reviewsQuery.data || [],
    isLoading: applicationsQuery.isLoading || bookingsQuery.isLoading || tasksQuery.isLoading || eventsQuery.isLoading || reviewsQuery.isLoading,
    error: applicationsQuery.error || bookingsQuery.error || tasksQuery.error || eventsQuery.error || reviewsQuery.error
  };
};
