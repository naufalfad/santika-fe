import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';

export interface SignatoriesData {
    pastorName: string;
    treasurerName: string;
}

export const useSignatoriesQuery = () => {
    return useQuery<SignatoriesData>({
        queryKey: ['reportSignatories'],
        queryFn: async () => {
            const response = await axiosInstance.get('/v1/reports/signatories');
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    });
};
