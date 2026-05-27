import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApplicationsQuery, useUpdateApplicationStatusMutation, useDeleteApplicationMutation } from '../../hooks/useApplications';
import { useUsersQuery } from '../../hooks/queries/userQueries';
import { useBookings } from '../../hooks/useBookings';
import { useTasks, useUpdateTaskStatusMutation } from '../../hooks/useTasks';
import { useEvents, useAddEventMutation, useDeleteEventMutation } from '../../hooks/useEvents';
import { Loader } from '../ui/Loader';
import AdminDashboard from '../../../pages/AdminDashboard';

interface AdminDashboardWrapperProps {
  currentUser?: any;
  onLogout?: () => void;
}

const AdminDashboardWrapper: React.FC<AdminDashboardWrapperProps> = ({
  currentUser: _currentUser,
  onLogout,
}) => {
  const queryClient = useQueryClient();
  const { data: applications = [], isLoading: appsLoading } = useApplicationsQuery();
  const { data: users = [], isLoading: usersLoading } = useUsersQuery();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { taskActivities, loading: tasksLoading } = useTasks();
  const { events, loading: eventsLoading } = useEvents();

  const updateAppMutation = useUpdateApplicationStatusMutation();
  const deleteAppMutation = useDeleteApplicationMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const addEventMutation = useAddEventMutation();
  const deleteEventMutation = useDeleteEventMutation();

  const handleUpdateApp = useCallback((id: string, status: 'approved' | 'rejected' | 'pending' | 'deleted') => {
    updateAppMutation.mutate({ id, status });
  }, [updateAppMutation]);

  const handleDeleteApp = useCallback((id: string) => {
    deleteAppMutation.mutate(id);
  }, [deleteAppMutation]);

  const handleUpdateTaskActivity = useCallback((id: string, status: 'reviewed', response?: string) => {
    updateTaskStatusMutation.mutate({ id, status, response });
  }, [updateTaskStatusMutation]);

  const handleAddEvent = useCallback((event: any) => {
    addEventMutation.mutate(event);
  }, [addEventMutation]);

  const handleDeleteEvent = useCallback((id: string) => {
    deleteEventMutation.mutate(id);
  }, [deleteEventMutation]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [queryClient]);

  if (appsLoading || usersLoading || bookingsLoading || tasksLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <AdminDashboard
      applications={applications}
      users={users}
      bookings={bookings}
      taskActivities={taskActivities}
      events={events}
      onUpdateApp={handleUpdateApp}
      onDeleteApp={handleDeleteApp}
      onUpdateTaskActivity={handleUpdateTaskActivity}
      onAddEvent={handleAddEvent}
      onDeleteEvent={handleDeleteEvent}
      onLogout={onLogout || (() => {})}
      onRefresh={handleRefresh}
    />
  );
};

export default AdminDashboardWrapper;
