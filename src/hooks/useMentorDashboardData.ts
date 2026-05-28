import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useApplicationsQuery } from './useApplications';
import { useBookingsQuery } from './useBookings';
import { useTasksQuery } from './useTasks';
import { useEventsQuery } from './useEvents';
import type { Review } from '../types';

// NOTE: The current data model lacks mentor_id fields on bookings, tasks,
// events, and applications tables. Once schema is updated, pass the mentor's
// user ID to the respective queries for proper per-mentor data isolation.
// For now, queries fetch unfiltered data as a shared view.

export const useMentorDashboardData = () => {
  // TODO: When bookings table gains a mentor_id column, filter by current user.
  const bookingsQuery = useBookingsQuery();
  // TODO: When tasks table gains a mentor_id column, filter by current user.
  const tasksQuery = useTasksQuery();
  const applicationsQuery = useApplicationsQuery();
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
    isPending: applicationsQuery.isPending || bookingsQuery.isPending || tasksQuery.isPending || eventsQuery.isPending || reviewsQuery.isPending,
    error: applicationsQuery.error || bookingsQuery.error || tasksQuery.error || eventsQuery.error || reviewsQuery.error
  };
};
