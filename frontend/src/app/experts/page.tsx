'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expertService } from '@/services/expertService';
import { 
  Filter, 
  Plus, 
  Download, 
  Search, 
  MoreHorizontal, 
  ChevronRight,
  ArrowUpRight,
  Mail,
  Linkedin,
  Clock,
  MapPin,
  CheckCircle2,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { useSearch } from '@/lib/store';
import { Expert, ExpertRate, ExpertUpdate } from '@/types/expert';
import ViewExpertModal from '@/components/modals/ViewExpertModal';
import EditExpertModal from '@/components/modals/EditExpertModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import ExportEmailModal from '@/components/modals/ExportEmailModal';

function ExpertListPage() {
  const { addToast } = useToast();
  const { query: searchQuery } = useSearch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // ── All useState hooks must be declared before any conditional return ──

  // ── Auth: check synchronously so there is no async delay or router loop ──
  const [isAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('isLoggedIn');
  });

  // If not authenticated, hard-redirect immediately (no router soft-nav loop)
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.replace('/login');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load items-per-page preference from localStorage
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('itemsPerPage');
      return saved ? Number(saved) : 10;
    }
    return 10;
  });

  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [regionId, setRegionId] = useState<number | undefined>();
  const [statusId, setStatusId] = useState<number | undefined>();
  const [functionId, setFunctionId] = useState<number | undefined>();
  const [sectorId, setSectorId] = useState<number | undefined>();
  const [selectedExperts, setSelectedExperts] = useState<Expert[]>([]);
  const [expandedHeadlines, setExpandedHeadlines] = useState<Set<string>>(new Set());

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Handle hydration mismatch ──
  useEffect(() => {
    setMounted(true);
  }, []);


  // ── Mutations ──
  const updateExpertMutation = useMutation({
    mutationFn: ({ expert, data }: { expert: Expert; data: ExpertUpdate }) =>
      expertService.update(expert.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      addToast('Expert updated successfully', 'success');
      setEditModalOpen(false);
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update expert', 'error');
    }
  });

  const deleteExpertMutation = useMutation({
    mutationFn: (expert: Expert) => expertService.delete(expert.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      addToast('Expert deleted successfully', 'success');
      setDeleteModalOpen(false);
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to delete expert', 'error');
    }
  });

  // ── Modal handlers ──
  const handleViewExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setViewModalOpen(true);
  };

  const handleEditExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  const handleSaveExpert = async (expert: Expert, data: ExpertUpdate) => {
    await updateExpertMutation.mutateAsync({ expert, data });
  };

  const handleDeleteExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedExpert) {
      deleteExpertMutation.mutate(selectedExpert);
    }
  };

  // ── Sector badge colours ──
  const getSectorColor = (sector?: string) => {
    if (!sector) return 'bg-slate-100 text-slate-700';
    const s = sector.toLowerCase();
    if (s.includes('technology') || s.includes('software') || s.includes('it')) return 'bg-cyan-100 text-cyan-700';
    if (s.includes('finance') || s.includes('banking') || s.includes('investment')) return 'bg-emerald-100 text-emerald-700';
    if (s.includes('healthcare') || s.includes('medical') || s.includes('pharma')) return 'bg-sky-100 text-sky-600';
    if (s.includes('energy') || s.includes('oil') || s.includes('gas')) return 'bg-amber-100 text-amber-700';
    if (s.includes('retail') || s.includes('consumer') || s.includes('fmcg')) return 'bg-violet-100 text-violet-700';
    if (s.includes('industrial') || s.includes('manufacturing') || s.includes('automotive')) return 'bg-orange-100 text-orange-700';
    if (s.includes('consulting') || s.includes('services') || s.includes('professional')) return 'bg-lime-100 text-lime-700';
    if (s.includes('education') || s.includes('training') || s.includes('academic')) return 'bg-fuchsia-100 text-fuchsia-700';
    if (s.includes('government') || s.includes('public') || s.includes('policy')) return 'bg-stone-100 text-stone-700';
    return 'bg-slate-100 text-slate-700';
  };

  // ── Search debounce ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Initialise filters from URL ──
  useEffect(() => {
    const search = searchParams.get('search');
    const region = searchParams.get('region_id');
    const status = searchParams.get('expert_status_id');
    const func = searchParams.get('function_id');
    const sector = searchParams.get('sector_id');
    const pg = searchParams.get('page');

    if (search) router.push(`/experts?search=${encodeURIComponent(search)}`);
    if (region) setRegionId(Number(region));
    if (status) setStatusId(Number(status));
    if (func) setFunctionId(Number(func));
    if (sector) setSectorId(Number(sector));
    if (pg) setPage(Number(pg));
  }, []);

  // ── Sync filters to URL ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'All') params.set('sector', activeTab);
    if (regionId) params.set('region_id', regionId.toString());
    if (statusId) params.set('status_id', statusId.toString());
    if (functionId) params.set('function_id', functionId.toString());
    if (sectorId) params.set('sector_id', sectorId.toString());
    if (page > 0) params.set('page', page.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);

    const queryString = params.toString();
    router.replace(`/experts${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [activeTab, debouncedSearch, regionId, statusId, functionId, sectorId, page]);

  // ── Reset page on filter change ──
  useEffect(() => {
    if (searchParams.toString()) return;
    setPage(0);
  }, [activeTab, debouncedSearch, regionId, statusId, functionId, sectorId]);

  // ── Data queries ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['experts', debouncedSearch, regionId, statusId, functionId, sectorId, page, itemsPerPage],
    queryFn: () => expertService.getAll({
      search: debouncedSearch,
      region_id: regionId,
      expert_status_id: statusId,
      function_id: functionId,
      sector_id: sectorId,
      skip: page * itemsPerPage,
      limit: itemsPerPage
    })
  });

  const { data: sectors } = useQuery({
    queryKey: ['lookups', 'SECTOR'],
    queryFn: () => expertService.getLookups('SECTOR'),
  });

  const { data: regions } = useQuery({
    queryKey: ['lookups', 'REGION'],
    queryFn: () => expertService.getLookups('REGION'),
  });

  const { data: statuses } = useQuery({
    queryKey: ['lookups', 'STATUS'],
    queryFn: () => expertService.getLookups('STATUS'),
  });

  const { data: functions } = useQuery({
    queryKey: ['lookups', 'FUNCTION'],
    queryFn: () => expertService.getLookups('FUNCTION'),
  });

  const categories = ['All', ...(sectors?.map((s: any) => s.value) || [])];

  // ── Export handlers ──
  const handleExportCSV = () => {
    const expertsToExport = selectedExperts.length > 0 ? selectedExperts : (data?.items || []);

    if (expertsToExport.length === 0) {
      addToast('No data to export', 'error');
      return;
    }

    addToast('Generating CSV...', 'info');

    try {
      const headers = ['Expert Name', 'ID', 'Headline', 'Sector', 'Function', 'Region', 'Status', 'Rate', 'Calls'];
      const rows = expertsToExport.map(expert => [
        `"${expert.first_name} ${expert.last_name}"`,
        `"${expert.expert_id}"`,
        `"${(expert.headline || '').replace(/"/g, '""')}"`,
        `"${expert.sector?.value || ''}"`,
        `"${expert.function?.value || ''}"`,
        `"${expert.region?.value || ''}"`,
        `"${expert.status?.value || ''}"`,
        `"${expert.rates?.find((r: ExpertRate) => r.is_primary)?.hourly_rate || ''}"`,
        expert.total_calls
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `experts_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Export successful', 'success');
    } catch (error) {
      addToast('Export failed', 'error');
    }
  };

  const handleExportEmail = () => {
    if (selectedExperts.length === 0) {
      addToast('Select experts to export first', 'info');
      return;
    }
    setEmailModalOpen(true);
  };

  // ── Selection helpers ──
  const toggleSelectAll = () => {
    const currentItems = data?.items || [];
    const allSelectedOnPage = currentItems.every(item => selectedExperts.some(e => e.id === item.id));

    if (allSelectedOnPage) {
      setSelectedExperts(prev => prev.filter(e => !currentItems.some(item => item.id === e.id)));
    } else {
      setSelectedExperts(prev => {
        const newOnes = currentItems.filter(item => !prev.some(e => e.id === item.id));
        return [...prev, ...newOnes];
      });
    }
  };

  const toggleSelectRow = (expert: Expert) => {
    setSelectedExperts(prev =>
      prev.some(e => e.id === expert.id)
        ? prev.filter(e => e.id !== expert.id)
        : [...prev, expert]
    );
  };

  const toggleHeadline = (expertId: string) => {
    setExpandedHeadlines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(expertId)) {
        newSet.delete(expertId);
      } else {
        newSet.add(expertId);
      }
      return newSet;
    });
  };

  // ── Auth loading guard (after all hooks) ──
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Network', value: data?.total || 0, trend: 'Live', color: 'from-emerald-500/20', text: 'text-emerald-600' },
          { label: 'Regions', value: regions?.length || 0, trend: 'Global', color: 'from-blue-500/20', text: 'text-blue-600' },
          { label: 'Functions', value: functions?.length || 0, trend: 'Active', color: 'from-purple-500/20', text: 'text-purple-600' },
          { label: 'Sectors', value: sectors?.length || 0, trend: 'Active', color: 'from-orange-500/20', text: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative bg-white border border-gray-100 p-6 rounded-2xl shadow-xs overflow-hidden group hover:border-black/5 transition-all duration-300"
          >
            <div className={cn("absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.color, "to-transparent")} />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</span>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border bg-white/50 backdrop-blur-sm", stat.text)}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-bold font-jakarta tracking-tight text-gray-900 group-hover:scale-105 transition-transform duration-300 origin-left">
                {stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedExperts.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 border border-white/10"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-white/20">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Actions</span>
              <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedExperts.length} Selected</span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={handleExportEmail}
                className="flex items-center gap-2 text-xs font-bold hover:text-blue-400 transition-colors"
               >
                 <Mail size={14} /> Export to Email (HTML)
               </button>
               <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 text-xs font-bold hover:text-blue-400 transition-colors"
               >
                 <Download size={14} /> Export CSV
               </button>
               <button 
                onClick={() => setSelectedExperts([])}
                className="text-xs font-bold text-white/40 hover:text-white transition-colors ml-4"
               >
                 Cancel
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Filter/Tabs Container */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
           {/* Modern Filters Bar */}
           <div className="flex flex-wrap items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex bg-gray-100/50 p-1 rounded-xl gap-1">
              <span className="px-3 py-1 text-[11px] font-bold text-gray-600 tracking-wider">Filters</span>
            </div>

            <div className="w-px h-4 bg-gray-100 mx-1 hidden md:block" />

            {/* Region Dropdown */}
            <select 
              value={regionId || ''} 
              onChange={(e) => setRegionId(e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 rounded-lg border-none bg-transparent px-2 text-[11px] font-bold text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50 tracking-wider"
            >
              <option value="">All Regions</option>
              {regions?.map((r: any) => (
                <option key={r.id} value={r.id}>{r.value}</option>
              ))}
            </select>

            <div className="w-px h-4 bg-gray-100 mx-1 hidden md:block" />

            {/* Status Dropdown */}
            <select 
              value={statusId || ''} 
              onChange={(e) => setStatusId(e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 rounded-lg border-none bg-transparent px-2 text-[11px] font-bold text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50 tracking-wider"
            >
              <option value="">Status: All</option>
              {statuses?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.value}</option>
              ))}
            </select>

            <div className="w-px h-4 bg-gray-100 mx-1 hidden md:block" />

            {/* Function Dropdown */}
            <select 
              value={functionId || ''} 
              onChange={(e) => setFunctionId(e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 rounded-lg border-none bg-transparent px-2 text-[11px] font-bold text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50 tracking-wider"
            >
              <option value="">Function: All</option>
              {functions?.map((f: any) => (
                <option key={f.id} value={f.id}>{f.value}</option>
              ))}
            </select>

            <div className="w-px h-4 bg-gray-100 mx-1 hidden md:block" />

            {/* Sector Dropdown */}
            <select 
              value={sectorId || ''} 
              onChange={(e) => setSectorId(e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 rounded-lg border-none bg-transparent px-2 text-[11px] font-bold text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50 tracking-wider"
            >
              <option value="">Sector: All</option>
              {sectors?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.value}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-all uppercase tracking-wider"
            >
               <Download size={12} />
               Export
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_24px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#fcfcfc]">
              <tr>
                <th className="w-14 px-6 py-5">
                  <input 
                    type="checkbox" 
                    className="rounded-md border-gray-300 text-black focus:ring-0"
                    checked={(data?.items?.length ?? 0) > 0 && (data?.items ?? []).every(item => selectedExperts.some(e => e.id === item.id))}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="table-header-cell">Expert</th>
                <th className="table-header-cell">Title/ Headline</th>
                <th className="table-header-cell">Sector</th>
                <th className="table-header-cell">Function</th>
                <th className="table-header-cell">Region</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Rate</th>
                <th className="table-header-cell">Calls</th>
                <th className="table-header-cell text-right pr-6 tracking-[0.2em] font-bold text-[9px] text-zinc-400 font-jakarta">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={10} className="px-6 py-6 border-b border-gray-50">
                        <div className="h-5 bg-gray-100 rounded-lg w-full opacity-50" />
                      </td>
                    </tr>
                  ))
                ) : data?.items?.map((expert, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    key={expert.id} 
                    className="hover:bg-[#fcfcfc] group transition-all duration-200 cursor-default"
                  >
                    <td className="px-6 py-5">
                      <input 
                        type="checkbox" 
                        className="rounded-md border-gray-200 text-black focus:ring-0"
                        checked={selectedExperts.some(e => e.id === expert.id)}
                        onChange={() => toggleSelectRow(expert)}
                      />
                    </td>
                    <td className="table-data-cell">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-[11px] font-jakarta shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300">
                           {expert.first_name[0]}{expert.last_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 tracking-tight leading-none">{expert.first_name} {expert.last_name}</div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{expert.expert_id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-data-cell">
                      <div className="text-[12px] font-bold text-gray-900">
                        {expert.headline ? (
                          <>
                            <span className={expandedHeadlines.has(expert.id) ? '' : 'truncate block max-w-[200px]'} title={expert.headline}>
                              {expert.headline}
                            </span>
                            {expert.headline.length > 30 && (
                              <button
                                onClick={() => toggleHeadline(expert.id)}
                                className="text-blue-600 hover:text-blue-800 text-[10px] font-medium ml-1"
                              >
                                {expandedHeadlines.has(expert.id) ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">No headline specified</span>
                        )}
                      </div>
                    </td>
                    <td className="table-data-cell">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight ${getSectorColor(expert.sector?.value)}`}>
                         {expert.sector?.value || 'Industry'}
                       </span>
                    </td>
                    <td className="table-data-cell">
                      <span className="text-[12px] font-medium text-gray-500">{expert.function?.value || 'Operations'}</span>
                    </td>
                    <td className="table-data-cell">
                       <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-300" />
                          <span className="text-[11px] font-bold text-gray-500 tracking-tight truncate max-w-[100px]">{expert.region?.value || expert.location || 'Global'}</span>
                       </div>
                    </td>
                    <td className="table-data-cell">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight ${
                          expert.status?.value?.toLowerCase().includes('active')
                            ? "bg-emerald-100 text-emerald-700" :
                          expert.status?.value?.toLowerCase() === 'lead'
                            ? "bg-blue-100 text-blue-700" :
                          expert.status?.value?.toLowerCase() === 'expired'
                            ? "bg-red-100 text-red-700" :
                          expert.status?.value?.toLowerCase() === 'dnc'
                            ? "bg-gray-100 text-gray-700" :
                          "bg-zinc-100 text-zinc-600"
                        }`}>
                          {expert.status?.value || 'No Status'}
                        </span>
                    </td>
                    <td className="table-data-cell-rate">
                      <div className="text-[12px] text-gray-900">
                        {expert.rates?.find((r: ExpertRate) => r.is_primary)?.currency || 'INR'} {expert.rates?.find((r: ExpertRate) => r.is_primary)?.hourly_rate?.toLocaleString() || '10,000'} <span className="text-gray-400 text-[10px] font-normal tracking-wide">per hour</span>
                      </div>
                    </td>
                    <td className="table-data-cell text-center">
                       <span className="text-[12px] text-gray-900">{expert.total_calls || 0}</span>
                    </td>
                    <td className="table-data-cell text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                         <button
                          onClick={() => handleViewExpert(expert)}
                          className="p-2 text-gray-400 hover:text-black hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                          title="View Profile"
                        >
                          <Eye size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleEditExpert(expert)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit3 size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpert(expert)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Expert"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                        {expert.linkedin_url && (
                          <a 
                            href={expert.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-[#0077b5] hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer"
                            title="LinkedIn"
                          >
                            <Linkedin size={16} strokeWidth={2.5} />
                          </a>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="px-6 py-4 bg-[#fcfcfc] border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-900">{data?.items?.length || 0}</span> of {data?.total || 0}
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-black transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-gray-600 px-2">
                Page <span className="font-bold text-gray-900">{page + 1}</span> of <span className="font-bold text-gray-900">{Math.ceil((data?.total || 0) / itemsPerPage) || 1}</span>
              </span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={(data?.items?.length || 0) < itemsPerPage}
                className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-black transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewExpertModal
        expert={selectedExpert}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onEdit={handleEditExpert}
      />
      
      <EditExpertModal
        expert={selectedExpert}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveExpert}
        isLoading={updateExpertMutation.isPending}
      />
      
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        expertName={selectedExpert ? `${selectedExpert.first_name} ${selectedExpert.last_name}` : ''}
        isLoading={deleteExpertMutation.isPending}
      />
      <ExportEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        experts={selectedExperts}
      />
    </motion.div>
  );
}

export default ExpertListPage;
