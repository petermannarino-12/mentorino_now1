import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';

export const useBookingsQuery = (userId?: string, page: number = 0) => {
  const from = page * 50;
  const to = from + 49;

  return useQuery({
    queryKey: ['bookings', userId, page],
    queryFn: async () => {
      const { data, error } = userId
        ? await bookingService.fetchByUserId(userId, from, to)
        : await bookingService.fetchAll(from, to);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (booking: Omit<Booking, 'id'>) => bookingService.insert(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useBookings = () => {
  const queryClient = useQueryClient();
  const bookingsQuery = useBookingsQuery();
  const addMutation = useAddBookingMutation();

  return {
    bookings: bookingsQuery.data || [],
    loading: bookingsQuery.isPending,
    error: bookingsQuery.error,
    addBooking: addMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
  };
};
