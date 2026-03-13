'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { 
  User, 
  Mail, 
  Linkedin, 
  MapPin, 
  Briefcase, 
  CheckCircle2,
  Plus,
  Globe,
  DollarSign,
  Type,
  AlignLeft,
  Hash,
  FileText
} from 'lucide-react';
import { Expert, LookupValue } from '@/types/expert';
import { useQuery } from '@tanstack/react-query';
import { expertService } from '@/services/expertService';
import { cn } from '@/lib/utils';

export const expertSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  primary_email: z.string().email('Invalid email address'),
  expert_id: z.string().min(1, 'Expert ID is required'),
  headline: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
  bio: z.string().optional(),
  strength_topics: z.string().optional(),
  sector_id: z.coerce.number().optional().transform(val => val === 0 ? null : val),
  region_id: z.coerce.number().optional().transform(val => val === 0 ? null : val),
  expert_status_id: z.coerce.number().optional().transform(val => val === 0 ? null : val),
  employment_status_id: z.coerce.number().optional().transform(val => val === 0 ? null : val),
  function_id: z.coerce.number().optional().transform(val => val === 0 ? null : val),
  years_experience: z.coerce.number().optional(),
  seniority_id: z.coerce.number().optional().transform(val => val === 0 ? null : val),
  company_role_id: z.coerce.number().optional().transform(val => val === 0 ? null : val),
  primary_phone: z.string().optional(),
  timezone: z.string().optional(),
  hcms_class: z.string().optional(),
  total_calls: z.coerce.number().optional(),
});

export type ExpertFormData = z.infer<typeof expertSchema>;

interface ExpertFormProps {
  initialData?: Partial<Expert>;
  onSubmit: (data: ExpertFormData) => void;
  isLoading?: boolean;
  buttonText: string;
}

export default function ExpertForm({ initialData, onSubmit, isLoading = false, buttonText }: ExpertFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ExpertFormData>({
    resolver: zodResolver(expertSchema) as any,
    defaultValues: initialData || {
      expert_id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
    }
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFormSubmit = (data: ExpertFormData) => {
    // Include file data if selected
    const formDataWithFile = {
      ...data,
      file: selectedFile
    };
    onSubmit(formDataWithFile);
  };

  const { data: sectors } = useQuery({
    queryKey: ['lookups', 'SECTOR'],
    queryFn: () => expertService.getLookups('SECTOR')
  });

  const { data: regions } = useQuery({
    queryKey: ['lookups', 'REGION'],
    queryFn: () => expertService.getLookups('REGION')
  });

  const { data: statuses } = useQuery({
    queryKey: ['lookups', 'STATUS'],
    queryFn: () => expertService.getLookups('STATUS')
  });

  const { data: functions } = useQuery({
    queryKey: ['lookups', 'FUNCTION'],
    queryFn: () => expertService.getLookups('FUNCTION')
  });

  const { data: employmentStatuses } = useQuery({
    queryKey: ['lookups', 'EMPLOYMENT_STATUS'],
    queryFn: () => expertService.getLookups('EMPLOYMENT_STATUS')
  });

  const { data: seniorities } = useQuery({
    queryKey: ['lookups', 'SENIORITY'],
    queryFn: () => expertService.getLookups('SENIORITY')
  });

  const { data: companyRoles } = useQuery({
    queryKey: ['lookups', 'COMPANY_ROLE'],
    queryFn: () => expertService.getLookups('COMPANY_ROLE')
  });

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="p-8 space-y-8">
      {/* Identity Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
            <User size={12} /> Personal Identity
        </h3>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">First Name <span className="text-red-500">*</span></label>
                <input {...register('first_name')} className="input-modern" placeholder="e.g. Syamal" />
                {errors.first_name && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Name <span className="text-red-500">*</span></label>
                <input {...register('last_name')} className="input-modern" placeholder="e.g. Kishore" />
                {errors.last_name && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{errors.last_name.message}</p>}
            </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Expert ID</label>
                <input {...register('expert_id')} className="input-modern font-mono bg-gray-50" readOnly />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Primary Email <span className="text-red-500">*</span></label>
                <input {...register('primary_email')} type="email" className="input-modern" placeholder="expert@domain.com" />
            </div>
        </div>
      </div>

      {/* Professional Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
            <Briefcase size={12} /> Professional Classification
        </h3>
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Headline / Professional Title</label>
            <input {...register('headline')} className="input-modern" placeholder="e.g. Senior Strategy Consultant at McKinsey" />
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Primary Sector</label>
                <select {...register('sector_id')} className="input-modern">
                    <option value="">Select Sector</option>
                    {sectors?.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Function</label>
                <select {...register('function_id')} className="input-modern">
                    <option value="">Select Function</option>
                    {functions?.map(f => <option key={f.id} value={f.id}>{f.value}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Region / Market</label>
                <select {...register('region_id')} className="input-modern">
                    <option value="">Select Region</option>
                    {regions?.map((r: any) => <option key={r.id} value={r.id}>{r.value}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Location</label>
                <input {...register('location')} className="input-modern" placeholder="e.g. New York, USA" />
            </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Expert Status</label>
                <select {...register('expert_status_id')} className="input-modern">
                    <option value="">Select Status</option>
                    {statuses?.map((s: any) => <option key={s.id} value={s.id}>{s.value}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employment Status</label>
                <select {...register('employment_status_id')} className="input-modern">
                    <option value="">Select Employment Status</option>
                    {employmentStatuses?.map((s: any) => <option key={s.id} value={s.id}>{s.value}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Company Role</label>
                <select {...register('company_role_id')} className="input-modern">
                    <option value="">Select Company Role</option>
                    {companyRoles?.map((r: any) => <option key={r.id} value={r.id}>{r.value}</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
            <Mail size={12} /> Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Primary Phone</label>
                <input {...register('primary_phone')} className="input-modern" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Timezone</label>
                <input {...register('timezone')} className="input-modern" placeholder="e.g. EST, PST, GMT" />
            </div>
        </div>
      </div>

      {/* Experience Details Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
            <Briefcase size={12} /> Experience Details
        </h3>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Years of Experience</label>
                <input {...register('years_experience')} type="number" className="input-modern" placeholder="e.g. 15" />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Seniority Level</label>
                <select {...register('seniority_id')} className="input-modern">
                    <option value="">Select Seniority</option>
                    {seniorities?.map((s: any) => <option key={s.id} value={s.id}>{s.value}</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* Classification Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
            <CheckCircle2 size={12} /> Classification
        </h3>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">HCMS Classification</label>
                <input {...register('hcms_class')} className="input-modern" placeholder="e.g. Tier 1, Tier 2, Premium" />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Calls Completed</label>
                <input {...register('total_calls')} type="number" className="input-modern" placeholder="e.g. 25" />
            </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
            <AlignLeft size={12} /> Detailed Profile
        </h3>
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">LinkedIn URL</label>
            <input {...register('linkedin_url')} className="input-modern" placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Biography / Executive Summary</label>
            <textarea {...register('bio')} rows={4} className="input-modern min-h-[120px] pt-3" placeholder="Provide a brief summary of the expert's career..." />
        </div>
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Strength Topics (Comma separated)</label>
            <input {...register('strength_topics')} className="input-modern" placeholder="e.g. Supply Chain, Logistics, M&A" />
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
            <FileText size={12} /> Supporting Documents
        </h3>
        <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center space-y-3 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center mx-auto text-gray-400 group-hover:text-blue-500 transition-colors shadow-sm">
                <FileText size={20} />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-900">
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Upload Professional Profile (PDF)'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Max file size 50MB. Only .pdf accepted.</p>
            </div>
            <input 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                id="pdf-upload" 
                onChange={handleFileChange}
            />
            <label htmlFor="pdf-upload" className="inline-block px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:border-black transition-all cursor-pointer shadow-sm">
                {selectedFile ? 'Change File' : 'Browse Files'}
            </label>
            {selectedFile && (
                <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 inline-block px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                >
                    Remove
                </button>
            )}
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Input Validated
            </div>
            <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="btn-modern btn-modern-primary px-8"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : buttonText}
                </button>
            </div>
      </div>
    </form>
  );
}
