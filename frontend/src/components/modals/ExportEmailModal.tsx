'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Copy, ExternalLink, Check, Users, Briefcase, MapPin, Phone, Globe } from 'lucide-react';
import { Expert, ExpertRate } from '@/types/expert';

interface ExportEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experts: Expert[];
}

// ── Build the rich HTML email string ──────────────────────────────────────────
function buildEmailHtml(experts: Expert[]): string {
  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const expertCards = experts.map((e) => {
    const primaryRate = e.rates?.find((r: ExpertRate) => r.is_primary);
    const currentRole = e.employment_history?.find((h) => h.is_current) ?? e.employment_history?.[0];
    const pastRoles = e.employment_history?.filter((h) => !h.is_current).slice(0, 2) ?? [];

    const statusColor =
      e.status?.value?.toLowerCase().includes('active') ? '#16a34a' :
      e.status?.value?.toLowerCase() === 'lead'         ? '#2563eb' :
      e.status?.value?.toLowerCase() === 'dnc'          ? '#6b7280' :
      e.status?.value?.toLowerCase() === 'expired'      ? '#dc2626' : '#374151';

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:20px;overflow:hidden;font-family:Arial,sans-serif;">
        <!-- Header strip -->
        <tr>
          <td style="background:#09090b;padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="width:40px;height:40px;background:#3f3f46;border-radius:10px;display:inline-block;text-align:center;line-height:40px;color:#ffffff;font-size:13px;font-weight:700;vertical-align:middle;">
                    ${e.first_name[0]}${e.last_name[0]}
                  </div>
                  <span style="display:inline-block;vertical-align:middle;margin-left:12px;">
                    <strong style="color:#ffffff;font-size:16px;">${e.salutation ? e.salutation + ' ' : ''}${e.first_name} ${e.last_name}</strong><br>
                    <span style="color:#71717a;font-size:11px;letter-spacing:0.08em;">${e.expert_id}</span>
                  </span>
                </td>
                <td align="right">
                  ${e.status ? `<span style="background:${statusColor}22;color:${statusColor};font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.05em;border:1px solid ${statusColor}44;">${e.status.value}</span>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Headline -->
        ${e.headline ? `
        <tr>
          <td style="padding:14px 20px 0 20px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#111827;">${e.headline}</p>
          </td>
        </tr>` : ''}

        <!-- Tags row -->
        <tr>
          <td style="padding:12px 20px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                ${e.sector ? `<td style="padding-right:8px;"><span style="background:#f3f4f6;color:#374151;font-size:10px;font-weight:700;padding:3px 10px;border-radius:6px;">${e.sector.value}</span></td>` : ''}
                ${e.function ? `<td style="padding-right:8px;"><span style="background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:700;padding:3px 10px;border-radius:6px;">${e.function.value}</span></td>` : ''}
                ${e.region ? `<td style="padding-right:8px;"><span style="background:#f0fdf4;color:#15803d;font-size:10px;font-weight:700;padding:3px 10px;border-radius:6px;">📍 ${e.region.value}</span></td>` : ''}
                ${e.seniority ? `<td><span style="background:#faf5ff;color:#7c3aed;font-size:10px;font-weight:700;padding:3px 10px;border-radius:6px;">${e.seniority}</span></td>` : ''}
              </tr>
            </table>
          </td>
        </tr>

        <!-- Key details grid -->
        <tr>
          <td style="padding:0 20px 14px 20px;">
            <table width="100%" cellpadding="0" cellspacing="6">
              <tr>
                ${primaryRate ? `
                <td width="50%" style="background:#f9fafb;border-radius:8px;padding:10px 12px;">
                  <div style="color:#9ca3af;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:2px;">Hourly Rate</div>
                  <div style="color:#111827;font-size:14px;font-weight:700;">${primaryRate.currency} ${primaryRate.hourly_rate.toLocaleString()}</div>
                </td>` : ''}
                ${e.years_experience ? `
                <td width="50%" style="background:#f9fafb;border-radius:8px;padding:10px 12px;">
                  <div style="color:#9ca3af;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:2px;">Experience</div>
                  <div style="color:#111827;font-size:14px;font-weight:700;">${e.years_experience} yrs</div>
                </td>` : ''}
              </tr>
              <tr>
                ${e.total_calls > 0 ? `
                <td width="50%" style="background:#f9fafb;border-radius:8px;padding:10px 12px;">
                  <div style="color:#9ca3af;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:2px;">Total Calls</div>
                  <div style="color:#111827;font-size:14px;font-weight:700;">${e.total_calls}</div>
                </td>` : ''}
                ${e.hcms_class ? `
                <td width="50%" style="background:#f9fafb;border-radius:8px;padding:10px 12px;">
                  <div style="color:#9ca3af;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:2px;">Class</div>
                  <div style="color:#111827;font-size:14px;font-weight:700;">${e.hcms_class}</div>
                </td>` : ''}
              </tr>
            </table>
          </td>
        </tr>

        <!-- Current role -->
        ${currentRole ? `
        <tr>
          <td style="padding:0 20px 14px 20px;">
            <div style="color:#9ca3af;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Current Role</div>
            <div style="color:#111827;font-size:13px;font-weight:600;">${currentRole.title}</div>
            <div style="color:#6b7280;font-size:12px;">${currentRole.company}${currentRole.start_year ? ` · ${currentRole.start_year}–Present` : ''}</div>
          </td>
        </tr>` : ''}

        <!-- Bio -->
        ${e.bio ? `
        <tr>
          <td style="padding:0 20px 14px 20px;">
            <div style="color:#9ca3af;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Bio</div>
            <p style="margin:0;color:#374151;font-size:12px;line-height:1.6;">${e.bio.slice(0, 300)}${e.bio.length > 300 ? '…' : ''}</p>
          </td>
        </tr>` : ''}

        <!-- Strength topics -->
        ${e.strength_topics ? `
        <tr>
          <td style="padding:0 20px 14px 20px;">
            <div style="color:#9ca3af;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Topic Strengths</div>
            <p style="margin:0;color:#374151;font-size:12px;line-height:1.6;">${e.strength_topics}</p>
          </td>
        </tr>` : ''}

        <!-- Contact footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:12px 20px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  ${e.primary_email ? `<a href="mailto:${e.primary_email}" style="color:#374151;font-size:11px;text-decoration:none;margin-right:16px;">✉ ${e.primary_email}</a>` : ''}
                  ${e.primary_phone ? `<span style="color:#6b7280;font-size:11px;margin-right:16px;">📞 ${e.primary_phone}</span>` : ''}
                </td>
                <td align="right">
                  ${e.linkedin_url ? `<a href="${e.linkedin_url}" style="background:#0077b5;color:#ffffff;font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;text-decoration:none;">LinkedIn Profile →</a>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Expert Profiles – Hasamex</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="background:#09090b;display:inline-block;padding:8px;border-radius:10px;vertical-align:middle;">
                      <span style="color:#ffffff;font-size:16px;font-weight:900;letter-spacing:-0.03em;padding:0 4px;">H</span>
                    </div>
                    <strong style="vertical-align:middle;margin-left:10px;font-size:18px;color:#09090b;letter-spacing:-0.03em;">HASAMEX</strong>
                    <span style="display:block;color:#9ca3af;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">Expert Database</span>
                  </td>
                  <td align="right">
                    <span style="color:#9ca3af;font-size:11px;">${date}</span><br>
                    <span style="color:#374151;font-size:11px;font-weight:600;">${experts.length} Expert${experts.length !== 1 ? 's' : ''} Selected</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding-bottom:20px;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#09090b;letter-spacing:-0.03em;">Expert Profile${experts.length !== 1 ? 's' : ''}</h1>
              <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Curated from the Hasamex Expert Network</p>
            </td>
          </tr>

          <!-- Expert cards -->
          <tr>
            <td>${expertCards}</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:10px;">Generated by Hasamex Expert Database · Confidential</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default function ExportEmailModal({ isOpen, onClose, experts }: ExportEmailModalProps) {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState(`Expert Profile${experts.length !== 1 ? 's' : ''} – Hasamex Network`);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');

  const html = buildEmailHtml(experts);

  const handleCopyHtml = async () => {
    try {
      // Copy as text/html so Gmail (and other rich-text editors) render it
      // instead of showing raw HTML tags when pasted
      const htmlBlob = new Blob([html], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': htmlBlob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: execCommand with a hidden contentEditable div so the
      // browser still puts HTML (not plain text) on the clipboard
      try {
        const div = document.createElement('div');
        div.contentEditable = 'true';
        div.style.position = 'fixed';
        div.style.opacity = '0';
        div.innerHTML = html;
        document.body.appendChild(div);
        const range = document.createRange();
        range.selectNodeContents(div);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand('copy');
        document.body.removeChild(div);
      } catch {
        // Last resort: plain text (raw HTML visible, but better than nothing)
        await navigator.clipboard.writeText(html);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenGmail = async () => {
    // Copy HTML to clipboard first so user can paste into Gmail compose
    await handleCopyHtml();

    // Build Gmail compose URL (pre-fills To and Subject; body must be pasted)
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      su: subject,
      ...(recipient ? { to: recipient } : {}),
    });

    window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Export to Email</h2>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {experts.length} expert{experts.length !== 1 ? 's' : ''} selected · Opens Gmail compose
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-7 pt-4">
            {(['compose', 'preview'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-black text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-4">
            {activeTab === 'compose' && (
              <div className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    To (Recipient Email)
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Optional — Gmail will pre-fill this field</p>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                  />
                </div>

                {/* Expert summary cards */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Experts Included
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {experts.map((e) => {
                      const primaryRate = e.rates?.find((r: ExpertRate) => r.is_primary);
                      return (
                        <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                            {e.first_name[0]}{e.last_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-900 truncate">{e.first_name} {e.last_name}</div>
                            <div className="text-[11px] text-gray-500 truncate">{e.headline || e.sector?.value || '—'}</div>
                          </div>
                          <div className="text-right shrink-0">
                            {primaryRate && (
                              <div className="text-[11px] font-bold text-gray-700">{primaryRate.currency} {primaryRate.hourly_rate.toLocaleString()}</div>
                            )}
                            <div className="text-[10px] text-gray-400">{e.region?.value || e.location || 'Global'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* What's included */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">What's included in the email</div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      'Full name & Expert ID', 'Headline & Status badge',
                      'Sector, Function & Region', 'Hourly rate & Experience',
                      'Bio & Strength topics', 'Current & past roles',
                      'Email & Phone contacts', 'LinkedIn profile link',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-[11px] text-blue-800">
                        <Check size={10} className="text-blue-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">How it works</div>
                  <ol className="space-y-1">
                    {[
                      'Click "Open in Gmail" below',
                      'Gmail compose window will open in a new tab',
                      'The rich HTML is copied to your clipboard',
                      'Paste (Ctrl+V / ⌘+V) in the Gmail compose body',
                      'Gmail will render the full formatted expert cards',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-amber-800">
                        <span className="font-bold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div>
                <p className="text-[11px] text-gray-400 mb-3">This is how the email will look when pasted into Gmail.</p>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <iframe
                    srcDoc={html}
                    title="Email Preview"
                    className="w-full"
                    style={{ height: '520px', border: 'none' }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-3 px-7 py-5 border-t border-gray-100 bg-[#fcfcfc]">
            <button
              onClick={handleCopyHtml}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-[11px] font-bold text-gray-600 hover:border-black hover:text-black transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy HTML'}
            </button>

            <button
              onClick={handleOpenGmail}
              className="flex-1 flex items-center justify-center gap-2.5 py-2.5 bg-black text-white rounded-xl text-[11px] font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 group"
            >
              {/* Gmail-coloured dot */}
              <span className="flex gap-[2px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
              </span>
              Open in Gmail · Copy HTML
              <ExternalLink size={12} className="opacity-60" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
