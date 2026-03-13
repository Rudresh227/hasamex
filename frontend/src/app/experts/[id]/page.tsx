'use client';

import { useQuery } from '@tanstack/react-query';
import { expertService } from '@/services/expertService';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Linkedin, 
  Mail, 
  MapPin, 
  Globe, 
  Clock, 
  Calendar,
  Briefcase,
  ExternalLink,
  Edit2,
  Download,
  Phone,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import AuthGuard from '@/components/AuthGuard';

export default function ExpertProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: expert, isLoading } = useQuery({
    queryKey: ['expert', id],
    queryFn: () => expertService.getById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-12 text-center text-[var(--text3)]">Loading profile...</div>;
  }

  if (!expert) {
    return <div className="p-12 text-center text-[var(--text3)]">Expert not found</div>;
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <Link href="/experts" className="flex items-center gap-2 text-[var(--text3)] hover:text-[var(--navy)] transition-colors text-sm font-medium group mb-4">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Database
      </Link>

      {/* Profile Hero */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl shadow-navy/5">
        <div className="bg-gradient-to-r from-[var(--navy)] to-[var(--navy3)] p-8 text-white relative">
           {/* Decorative elements */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe size={180} />
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] border-4 border-white/10 flex items-center justify-center font-bold text-3xl logo-font shadow-2xl">
              {expert.first_name[0]}{expert.last_name[0]}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="logo-font text-3xl font-bold tracking-tight">{expert.first_name} {expert.last_name}</h1>
                <div className="flex items-center gap-1.5">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        expert.status?.value?.toLowerCase() === 'active' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-zinc-400"
                    )} />
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
                        expert.status?.value?.toLowerCase() === 'active' 
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                            : "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
                    )}>
                        {expert.status?.value || 'Inactive'}
                    </span>
                </div>
              </div>
              <p className="text-white/70 text-lg font-medium max-w-2xl">{expert.headline || 'Senior Strategy Consultant'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/50 font-medium pt-2">
                <div className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-400/60" /> {expert.region?.value || expert.location || 'Global'}</div>
                <div className="flex items-center gap-1.5"><Clock size={16} className="text-blue-400/60" /> {expert.timezone || 'UTC+0'}</div>
                <div className="flex items-center gap-1.5"><Briefcase size={16} className="text-blue-400/60" /> {expert.company_role || 'Expert'}</div>
              </div>
            </div>
            <div className="pt-4 md:pt-0 flex md:flex-col gap-3">
               <Link href={`/experts/${id}/edit`} className="btn-primary flex items-center gap-2 bg-white text-[var(--navy)] hover:bg-slate-100 border-none shadow-none text-xs px-6 py-2.5 rounded-xl font-bold transition-all">
                 <Edit2 size={14} /> Edit Profile
               </Link>
               <button className="btn-ghost text-white border-white/20 hover:bg-white/10 flex items-center gap-2 text-xs px-6 py-2.5 rounded-xl font-bold border transition-all">
                 <Download size={14} /> Download CV
               </button>
            </div>
          </div>
        </div>

        {/* Quick Actions / Summary Info */}
        <div className="bg-slate-50 border-y border-[var(--border)] px-8 py-4 flex flex-wrap gap-8 items-center">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Pricing Model</span>
                <span className="text-lg font-bold text-[var(--navy)] logo-font">
                    {expert.rates?.find(r => r.is_primary)?.currency || 'INR'} {expert.rates?.find(r => r.is_primary)?.hourly_rate.toLocaleString() || '10,000'}
                    <span className="text-xs font-normal text-[var(--text3)] ml-1">/ hr</span>
                </span>
            </div>
            <div className="h-8 w-px bg-[var(--border)]" />
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Core Function</span>
                <span className="text-lg font-bold text-[var(--navy)] logo-font">{expert.function?.value || 'Strategy'}</span>
            </div>
            <div className="h-8 w-px bg-[var(--border)]" />
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Primary Sector</span>
                <span className="text-lg font-bold text-blue-600 logo-font">{expert.sector?.value || 'Industry'}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Link href={expert.linkedin_url || '#'} target="_blank" className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Linkedin size={20} />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer">
                    <Mail size={20} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer">
                    <Phone size={20} />
                </div>
            </div>
        </div>

        {/* Profile Content */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                        <MessageSquare size={18} className="text-[var(--blue)]" />
                        <h2 className="logo-font font-bold text-lg text-[var(--navy)]">Expert Bio & Experience</h2>
                    </div>
                    <p className="text-[var(--text2)] leading-relaxed text-[15px] whitespace-pre-wrap">
                        {expert.bio || "No biography available. This expert is a seasoned professional with deep domain expertise in their primary sector. They have consistently delivered high-value strategic results for past clients and projects."}
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                        <Briefcase size={18} className="text-[var(--blue)]" />
                        <h2 className="logo-font font-bold text-lg text-[var(--navy)]">Key Strengths & Topics</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {expert.strength_topics?.split(',').map((topic, i) => (
                            <span key={i} className="px-4 py-1.5 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-700 text-sm font-medium">
                                {topic.trim()}
                            </span>
                        )) || (
                            <>
                                <span className="px-4 py-1.5 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-700 text-sm font-medium">Strategic Planning</span>
                                <span className="px-4 py-1.5 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-700 text-sm font-medium">Market Analysis</span>
                                <span className="px-4 py-1.5 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-700 text-sm font-medium">Operational Excellence</span>
                            </>
                        )}
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <section className="bg-slate-50 border border-[var(--border)] rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-bold text-[var(--text3)] uppercase tracking-wider mb-2">Project History</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center text-[var(--blue)] font-bold logo-font flex-shrink-0 shadow-sm">
                                    P{i}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[13px] font-bold text-[var(--navy)]">Enterprise Strategy Q{i}</div>
                                    <div className="text-[11px] text-[var(--text3)]">Nov 2025 • Completed</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-2 text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest border border-dashed border-blue-200 rounded-lg mt-2">
                        View All Projects
                    </button>
                </section>

                <section className="space-y-4 px-2">
                    <h3 className="text-xs font-bold text-[var(--text3)] uppercase tracking-wider">System Information</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text3)]">Database ID</span>
                            <span className="mono-font text-xs text-[var(--navy)]">USER-{expert.expert_id}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text3)]">Onboarded</span>
                            <span className="text-[var(--navy)] font-medium">Jan 12, 2026</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text3)]">Last Engaged</span>
                            <span className="text-[var(--navy)] font-medium">3 days ago</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
