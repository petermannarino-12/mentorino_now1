import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/applicationService';
import { Application } from '../types';

/**
 * useApplicationsQuery
 * Fetches applications with optional email filtering and pagination.
 */
export const useApplicationsQuery = (email?: string, page: number = 0) => {
  const from = page * 50;
  const to = from + 49;

  return useQuery({
    queryKey: ['applications', email, page],
    queryFn: async () => {
      let allApps: Application[] = [];
      const { data: generalData, error: generalError } = await applicationService.fetchAll(from, to);
      
      if (generalError) throw new Error(generalError);
      allApps = generalData || [];

      // If no applications found and an email is provided, try fetching by email specifically
      if (allApps.length === 0 && email) {
        const { data: specificData, error: specificError } = await applicationService.fetchByEmail(email);
        if (specificError) throw new Error(specificError);
        if (specificData) allApps = [specificData];
      }
      
      return allApps;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * useAddApplicationMutation
 * Adds a new application and invalidates the applications cache.
 */
export const useAddApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (app: Omit<Application, 'id' | 'created_at'>) => applicationService.insert(app),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

/**
 * useUpdateApplicationStatusMutation
 * Updates an application's status and invalidates the applications cache.
 */
export const useUpdateApplicationStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'pending' | string }) => {
      const { data, error } = await applicationService.updateStatus(id, status);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

/**
 * useDeleteApplicationMutation
 * Deletes an application and invalidates the applications cache.
 */
export const useDeleteApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

/**
 * useApplications
 * A legacy-compatible hook wrapper for backward compatibility or ease of use.
 * Recommending direct use of Query/Mutation hooks for better grain control.
 */
export const useApplications = () => {
  const queryClient = useQueryClient();
  const applicationsQuery = useApplicationsQuery();
  const addMutation = useAddApplicationMutation();
  const updateStatusMutation = useUpdateApplicationStatusMutation();
  const deleteMutation = useDeleteApplicationMutation();

  return {
    applications: applicationsQuery.data || [],
    loading: applicationsQuery.isLoading,
    error: applicationsQuery.error,
    addApplication: addMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteApplication: deleteMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['applications'] })
  };
};
