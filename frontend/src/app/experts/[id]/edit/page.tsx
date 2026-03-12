'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expertService } from '@/services/expertService';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import ExpertForm, { ExpertFormData } from '@/components/ExpertForm';

export default function EditExpertPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: expert, isLoading: isFetching } = useQuery({
    queryKey: ['expert', id],
    queryFn: () => expertService.getById(id as string),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: ExpertFormData) => expertService.update(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      queryClient.invalidateQueries({ queryKey: ['expert', id] });
      addToast('Profile successfully updated', 'success');
      router.push(`/experts/${id}`);
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        addToast('Conflict: Email or LinkedIn is already in use by another expert', 'error');
      } else {
        addToast('Failed to update profile', 'error');
      }
    }
  });

  if (isFetching) {
    return <div className="p-12 text-center text-gray-400 font-medium">Loading profile data...</div>;
  }

  if (!expert) {
    return <div className="p-12 text-center text-gray-400 font-medium">Expert not found</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <Link href={`/experts/${id}`} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Expert UUID</span>
           <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{String(id).split('-')[0]}...</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-[#fcfcfc]">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
               <Edit2 size={24} />
             </div>
             <div>
               <h1 className="text-xl font-bold font-jakarta tracking-tight text-gray-900">Update Expert Profile</h1>
               <p className="text-xs font-medium text-gray-400 mt-0.5">Modify professional details and classification.</p>
             </div>
          </div>
        </div>

        <ExpertForm 
            initialData={expert}
            onSubmit={(data) => mutation.mutate(data)}
            isLoading={mutation.isPending}
            buttonText="Save Changes"
        />
      </div>
    </motion.div>
  );
}
