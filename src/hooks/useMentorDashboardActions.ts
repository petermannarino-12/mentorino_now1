import { TaskActivity, NetworkEvent } from '../types';
import { useUpdateTaskStatusMutation } from './useTasks';
import { useUpdateApplicationStatusMutation, useDeleteApplicationMutation } from './useApplications';
import { useAddEventMutation, useDeleteEventMutation } from './useEvents';

export const useMentorDashboardActions = (
  setNotification: (n: string | null) => void,
  setSelectedTask: (t: TaskActivity | null) => void,
  setFeedbackResponse: (f: string) => void,
  setIsAddingEvent: (b: boolean) => void,
  setNewEvent: (e: Partial<NetworkEvent>) => void
) => {
  const updateTaskMutation = useUpdateTaskStatusMutation();
  const updateAppMutation = useUpdateApplicationStatusMutation();
  const deleteAppMutation = useDeleteApplicationMutation();
  const addEventMutation = useAddEventMutation();
  const deleteEventMutation = useDeleteEventMutation();

  const handleReviewTask = (task: TaskActivity) => {
    setSelectedTask(task);
    setFeedbackResponse(task.admin_response || '');
  };

  const handleApplicationAction = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateAppMutation.mutateAsync({ id, status });
      setNotification(`Application ${status === 'approved' ? 'AUTHORIZED' : status.toUpperCase()} successfully.`);
    } catch {
      setNotification('Failed to update application. Please try again.');
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this mentee and their application?')) return;
    
    try {
      await deleteAppMutation.mutateAsync(id);
      setNotification('Mentee removed successfully.');
    } catch {
      setNotification('Failed to delete application.');
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCreateEvent = async (newEvent: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
  }) => {
    if (!newEvent.title || !newEvent.location) return;
    
    try {
      await addEventMutation.mutateAsync({
        id: '', // Temporary ID, service should handle it
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        attendees: [],
        created_at: new Date().toISOString()
      });
      
      setIsAddingEvent(false);
      setNewEvent({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '18:00', location: '' });
      setNotification('New networking event published.');
    } catch {
      setNotification('Failed to publish event. Please try again.');
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const submitFeedback = async (selectedTask: TaskActivity | null, feedbackResponse: string) => {
    if (selectedTask) {
      try {
        await updateTaskMutation.mutateAsync({ id: selectedTask.id, status: 'reviewed', response: feedbackResponse });
        setSelectedTask(null);
        setFeedbackResponse('');
        setNotification('Feedback submitted successfully.');
      } catch {
        setNotification('Failed to submit feedback.');
      } finally {
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  return {
    handleReviewTask,
    handleApplicationAction,
    handleDeleteApplication,
    handleCreateEvent,
    submitFeedback,
    handleDeleteEvent: (id: string) => deleteEventMutation.mutate(id)
  };
};
