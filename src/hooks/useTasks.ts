import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { TaskActivity } from '../types';

export const useTasksQuery = (userId?: string, page: number = 0) => {
  const from = page * 50;
  const to = from + 49;

  return useQuery({
    queryKey: ['tasks', userId, page],
    queryFn: async () => {
      const { data, error } = userId
        ? await taskService.fetchByUserId(userId, from, to)
        : await taskService.fetchAll(from, to);
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAddTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activity, userId, userName }: { 
      activity: Omit<TaskActivity, 'id' | 'user_id' | 'user_name' | 'status' | 'created_at'>; 
      userId: string; 
      userName: string; 
    }) => {
      const fullActivity = {
        ...activity,
        user_id: userId,
        user_name: userName,
        status: 'pending' as const
      };
      return taskService.insert(fullActivity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, response }: { id: string; status: 'reviewed' | 'completed' | 'pending'; response?: string }) => 
      taskService.updateStatus(id, status, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useTasks = () => {
  const queryClient = useQueryClient();
  const tasksQuery = useTasksQuery();
  const addMutation = useAddTaskMutation();
  const updateStatusMutation = useUpdateTaskStatusMutation();

  return {
    taskActivities: tasksQuery.data || [],
    loading: tasksQuery.isLoading,
    error: tasksQuery.error,
    addTask: addMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  };
};
