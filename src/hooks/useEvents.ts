import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import { NetworkEvent } from '../types';

export const useEventsQuery = (page: number = 0) => {
  const from = page * 50;
  const to = from + 49;

  return useQuery({
    queryKey: ['events', page],
    queryFn: async () => {
      const { data, error } = await eventService.fetchAll(from, to);
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAddEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: NetworkEvent) => eventService.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useAttendEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) => 
      eventService.attend(eventId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useEvents = () => {
  const queryClient = useQueryClient();
  const eventsQuery = useEventsQuery();
  const addMutation = useAddEventMutation();
  const deleteMutation = useDeleteEventMutation();
  const attendMutation = useAttendEventMutation();

  return {
    events: eventsQuery.data || [],
    loading: eventsQuery.isLoading,
    error: eventsQuery.error,
    addEvent: addMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
    attendEvent: attendMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  };
};
