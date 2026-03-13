'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expertService } from '@/services/expertService';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import ExpertForm, { ExpertFormData } from '@/components/ExpertForm';
import { Expert } from '@/types/expert';

export default function AddExpertPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: ExpertFormData & { file?: File }) => {
      const { file, ...expertData } = data;
      const expert = await expertService.create(expertData);
      if (file && expert.id) {
        try {
          await expertService.uploadExpertFile(expert.id, file);
          addToast('PDF uploaded successfully', 'success');
        } catch (uploadError) {
          addToast('Expert created but PDF upload failed', 'error');
          console.error('File upload error:', uploadError);
        }
      }
      return expert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      addToast('Expert successfully onboarded', 'success');
      router.push('/experts');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        addToast('Duplicate expert detected (Email or LinkedIn)', 'error');
      } else {
        addToast('Failed to register expert', 'error');
      }
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <Link href="/experts" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Database
        </Link>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Entry ID</span>
           <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">AUTO-GEN</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-[#fcfcfc]">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-xl shadow-black/10">
               <Plus size={24} strokeWidth={3} />
             </div>
             <div>
               <h1 className="text-xl font-bold font-jakarta tracking-tight text-gray-900">Onboard New Profile</h1>
               <p className="text-xs font-medium text-gray-400 mt-0.5">Initialize a new secure record in the expert database.</p>
             </div>
          </div>
        </div>

        <ExpertForm 
            onSubmit={(data) => mutation.mutate(data)}
            isLoading={mutation.isPending}
            buttonText="Register Expert Profile"
        />
      </div>
    </motion.div>
  );
}
