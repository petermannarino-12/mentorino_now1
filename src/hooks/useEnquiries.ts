import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiryService } from '../services/enquiryService';

export const useEnquiriesQuery = () => {
  return useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const { data, error } = await enquiryService.fetchAll();
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSubmitEnquiryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enquiry: { name: string; email: string; phone?: string; service_type: string; message?: string }) =>
      enquiryService.submit(enquiry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
};

export const useUpdateEnquiryStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'contacted' | 'closed' }) =>
      enquiryService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
};

export const useEnquiries = () => {
  const queryClient = useQueryClient();
  const enquiriesQuery = useEnquiriesQuery();
  const submitMutation = useSubmitEnquiryMutation();
  const updateStatusMutation = useUpdateEnquiryStatusMutation();

  return {
    enquiries: enquiriesQuery.data || [],
    loading: enquiriesQuery.isLoading,
    error: enquiriesQuery.error,
    submitEnquiry: submitMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['enquiries'] })
  };
};
