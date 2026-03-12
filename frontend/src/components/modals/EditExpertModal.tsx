"use client";

import React, { useState, useEffect } from 'react';
import { Expert, ExpertUpdate } from '@/types/expert';
import { X, Save, AlertCircle, User, MapPin, Briefcase, Award, FileText, Phone, Mail, Globe, Calendar, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditExpertModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (expert: Expert, data: ExpertUpdate) => Promise<void>;
  isLoading?: boolean;
}

export default function EditExpertModal({ expert, isOpen, onClose, onSave, isLoading = false }: EditExpertModalProps) {
  const [formData, setFormData] = useState<ExpertUpdate>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when expert changes
  useEffect(() => {
    if (expert) {
      setFormData({
        first_name: expert.first_name,
        last_name: expert.last_name,
        primary_email: expert.primary_email,
        primary_phone: expert.primary_phone || expert.phone || '',
        linkedin_url: expert.linkedin_url,
        location: expert.location,
        timezone: expert.timezone,
        region_id: expert.region_id,
        employment_status_id: expert.employment_status_id,
        seniority: expert.seniority,
        years_experience: expert.years_experience,
        headline: expert.headline,
        bio: expert.bio,
        strength_topics: expert.strength_topics,
        sector_id: expert.sector_id,
        function_id: expert.function_id,
        company_role: expert.company_role,
        hcms_class: expert.hcms_class,
        expert_status_id: expert.expert_status_id,
        notes: expert.notes,
        total_calls: expert.total_calls,
      });
      setErrors({});
    }
  }, [expert]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.primary_email?.trim()) {
      newErrors.primary_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primary_email)) {
      newErrors.primary_email = 'Please enter a valid email address';
    }

    if (formData.linkedin_url && !formData.linkedin_url.startsWith('http')) {
      newErrors.linkedin_url = 'URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !expert) return;

    try {
      // Convert any URL objects to strings before sending to backend
      const processedData: ExpertUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        primary_email: formData.primary_email,
        primary_phone: formData.primary_phone,
        linkedin_url: formData.linkedin_url?.toString(),
        location: formData.location,
        timezone: formData.timezone,
        region_id: formData.region_id,
        employment_status_id: formData.employment_status_id,
        seniority: formData.seniority,
        years_experience: formData.years_experience,
        headline: formData.headline,
        bio: formData.bio,
        strength_topics: formData.strength_topics,
        sector_id: formData.sector_id,
        function_id: formData.function_id,
        company_role: formData.company_role,
        hcms_class: formData.hcms_class,
        expert_status_id: formData.expert_status_id,
        notes: formData.notes,
        total_calls: formData.total_calls,
      };
      
      await onSave(expert, processedData);
      onClose();
    } catch (error) {
      console.error('Failed to update expert:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: ExpertUpdate) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-1 font-sans">
                      Edit Expert
                    </h2>
                    <p className="text-sm text-gray-300 mb-2 font-sans">
                      {expert.expert_id} • {expert.first_name} {expert.last_name}
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
                </div>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans ${
                            errors.first_name ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {errors.first_name && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-xs font-sans">
                            <AlertCircle className="w-3 h-3" />
                            {errors.first_name}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans ${
                            errors.last_name ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {errors.last_name && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-xs font-sans">
                            <AlertCircle className="w-3 h-3" />
                            {errors.last_name}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.primary_email || ''}
                          onChange={(e) => handleInputChange('primary_email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans ${
                            errors.primary_email ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {errors.primary_email && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-xs font-sans">
                            <AlertCircle className="w-3 h-3" />
                            {errors.primary_email}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Phone</label>
                        <input
                          type="text"
                          value={formData.primary_phone || ''}
                          onChange={(e) => handleInputChange('primary_phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">LinkedIn URL</label>
                        <input
                          type="url"
                          value={formData.linkedin_url || ''}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans ${
                            errors.linkedin_url ? "border-red-500" : "border-gray-200"
                          }`}
                          placeholder="https://linkedin.com/in/username"
                        />
                        {errors.linkedin_url && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-xs font-sans">
                            <AlertCircle className="w-3 h-3" />
                            {errors.linkedin_url}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location & Classification */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Location & Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Location</label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Timezone</label>
                        <input
                          type="text"
                          value={formData.timezone || ''}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Region</label>
                        <select
                          value={formData.region_id || ''}
                          onChange={(e) => handleInputChange('region_id', parseInt(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        >
                          <option value="">Select region</option>
                          <option value="8">APAC</option>
                          <option value="9">EMEA</option>
                          <option value="10">Americas</option>
                          <option value="11">Global</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Employment Status</label>
                        <select
                          value={formData.employment_status_id || ''}
                          onChange={(e) => handleInputChange('employment_status_id', parseInt(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        >
                          <option value="">Select status</option>
                          <option value="12">Employed</option>
                          <option value="13">Self-Employed</option>
                          <option value="14">Retired</option>
                          <option value="15">Unemployed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Years of Experience</label>
                        <input
                          type="number"
                          value={formData.years_experience || ''}
                          onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || undefined)}
                          min="0"
                          max="60"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Professional Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">
                          Title / Headline <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.headline || ''}
                          onChange={(e) => handleInputChange('headline', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Primary Sector</label>
                          <select
                            value={formData.sector_id || ''}
                            onChange={(e) => handleInputChange('sector_id', parseInt(e.target.value) || undefined)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                          >
                            <option value="">Select sector</option>
                            <option value="1">Healthcare & Life Sciences</option>
                            <option value="2">Energy</option>
                            <option value="3">Industrials</option>
                            <option value="4">Real Estate</option>
                            <option value="5">TMT</option>
                            <option value="6">Consumer Goods</option>
                            <option value="7">Financial Services</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Expert Function</label>
                          <select
                            value={formData.function_id || ''}
                            onChange={(e) => handleInputChange('function_id', parseInt(e.target.value) || undefined)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                          >
                            <option value="">Select function</option>
                            <option value="19">Strategy</option>
                            <option value="20">Engineering</option>
                            <option value="21">Marketing</option>
                            <option value="22">Finance</option>
                            <option value="23">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Bio</label>
                        <textarea
                          value={formData.bio || ''}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Strength Topics</label>
                        <input
                          type="text"
                          value={formData.strength_topics || ''}
                          onChange={(e) => handleInputChange('strength_topics', e.target.value)}
                          placeholder="Separate with ·"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status & Classification */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 font-sans">Status & Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">HCMS Classification</label>
                        <select
                          value={formData.hcms_class || ''}
                          onChange={(e) => handleInputChange('hcms_class', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        >
                          <option value="">Select classification</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                          <option value="Under Review">Under Review</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Expert Status</label>
                        <select
                          value={formData.expert_status_id || ''}
                          onChange={(e) => handleInputChange('expert_status_id', parseInt(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        >
                          <option value="">Select status</option>
                          <option value="24">Lead</option>
                          <option value="25">Active T&Cs (Call Completed)</option>
                          <option value="26">Active T&Cs (No Call Yet)</option>
                          <option value="27">Expired T&Cs</option>
                          <option value="28">DNC</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Total Calls Completed</label>
                        <input
                          type="number"
                          value={formData.total_calls || ''}
                          onChange={(e) => handleInputChange('total_calls', parseInt(e.target.value) || undefined)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1 font-sans">Internal Notes</label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        placeholder="Internal notes…"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-sans"
                      />
                    </div>
                  </div>
                </div>
              </form>
              
              {/* Footer */}
              <div className="border-t px-6 py-4 bg-white flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black text-sm font-semibold font-sans disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
