"use client";

import React from 'react';
import { Expert } from '@/types/expert';
import { X, Linkedin, Edit, MapPin, Briefcase, Clock, Phone, Mail, Globe, User, Calendar, Award, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewExpertModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expert: Expert) => void;
}

export default function ViewExpertModal({ expert, isOpen, onClose, onEdit }: ViewExpertModalProps) {
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-50 text-gray-600 border-gray-200';
    const s = status.toLowerCase();
    if (s.includes('active')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'lead') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'expired') return 'bg-red-50 text-red-700 border-red-200';
    if (s === 'dnc') return 'bg-gray-50 text-gray-600 border-gray-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <AnimatePresence>
      {isOpen && expert && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
              onClick={onClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-[60vw] max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative z-50 font-sans"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6 py-4">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(45deg, #ffffff 25%, transparent 25%), linear-gradient(-45deg, #ffffff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ffffff 75%), linear-gradient(-45deg, transparent 75%, #ffffff 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}></div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                {/* Expert Info */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border border-white/20 shadow-lg">
                    {expert.first_name?.[0]}{expert.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-1 font-sans">
                      {expert.first_name} {expert.last_name}
                    </h2>
                    <p className="text-sm text-gray-300 mb-2 font-sans">
                      {expert.headline || 'No headline specified'}
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-medium text-white border border-white/20 font-sans">
                        {expert.region?.value}
                      </span>
                      {expert.years_experience && (
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-medium text-white border border-white/20 font-sans">
                          {expert.years_experience} years
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {expert.linkedin_url && (
                      <button
                        onClick={() => window.open(expert.linkedin_url, '_blank')}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-colors cursor-pointer"
                      >
                        <Linkedin className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(expert)}
                      className="p-2 bg-white text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4 text-gray-900" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6">
                  {/* Tags Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium font-sans">
                        {expert.sector?.value || 'No Sector'}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium font-sans">
                        {expert.function?.value || 'No Function'}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium font-sans">
                        {expert.status?.value || 'No Status'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs font-medium text-gray-500 font-sans">Email</div>
                          <div className="text-sm font-semibold text-gray-900 font-sans">{expert.primary_email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs font-medium text-gray-500 font-sans">Phone</div>
                          <div className="text-sm font-semibold text-gray-900 font-sans">{expert.phone || expert.primary_phone || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs font-medium text-gray-500 font-sans">Location</div>
                          <div className="text-sm font-semibold text-gray-900 font-sans">{expert.location || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs font-medium text-gray-500 font-sans">Timezone</div>
                          <div className="text-sm font-semibold text-gray-900 font-sans">{expert.timezone || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-1 font-sans">Hourly Rate</div>
                        <div className="text-sm font-semibold text-gray-900 font-sans">
                          {expert.rates?.find(r => r.is_primary) ? 
                            `${expert.rates.find(r => r.is_primary)?.currency} ${expert.rates.find(r => r.is_primary)?.hourly_rate?.toLocaleString()} per hour` : 
                            '—'
                          }
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-1 font-sans">Total Calls</div>
                        <div className="text-sm font-semibold text-gray-900 font-sans">{expert.total_calls || 0}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-1 font-sans">HCMS Classification</div>
                        <div className="text-sm font-semibold text-gray-900 font-sans">{expert.hcms_class || '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Status</h3>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold border font-sans ${getStatusColor(expert.status?.value)}`}>
                        {expert.status?.value || 'No Status'}
                      </span>
                      {expert.files && expert.files.length > 0 && (
                        <a 
                          href={expert.files.find((f: any) => f.is_primary)?.s3_key || '#'} 
                          target="_blank"
                          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium cursor-pointer font-sans"
                        >
                          <FileText className="w-4 h-4" />
                          View Profile PDF
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Biography */}
                  {expert.bio && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Biography</h3>
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed font-sans">{expert.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Employment History */}
                  {expert.employment_history && expert.employment_history.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Employment History</h3>
                      <div className="space-y-3">
                        {expert.employment_history.map((emp: any, index: number) => (
                          <div key={emp.id || index} className="p-4 bg-white rounded-lg border border-gray-200">
                            <div className="font-semibold text-sm text-gray-900 font-sans">{emp.title}</div>
                            <div className="text-xs text-gray-600 font-sans">{emp.company}</div>
                            <div className="text-xs text-gray-500 font-sans">
                              {emp.start_year} - {emp.is_current ? 'Present' : emp.end_year}
                            </div>
                            {emp.description && (
                              <div className="text-xs text-gray-700 mt-2 font-sans">{emp.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strength Topics */}
                  {expert.strength_topics && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Strength Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {expert.strength_topics.split('·').map((topic, index) => {
                          const trimmed = topic.trim();
                          return trimmed ? (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors font-sans">
                              {trimmed}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {expert.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Internal Notes</h3>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-gray-700 font-sans">
                          <span className="font-semibold">Notes: </span>
                          {expert.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
