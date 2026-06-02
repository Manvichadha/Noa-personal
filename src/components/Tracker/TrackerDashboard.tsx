'use client';
import useSWR from 'swr';
import { ContentDraft, VideoDraft, AnyDraft } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { getPlatformStatus } from '@/lib/utils';
import './TrackerDashboard.css';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TrackerDashboard({ role }: { role: 'noa' | 'founder' }) {
  const { data: textData } = useSWR<ContentDraft[]>('/api/content-drafts', fetcher, { refreshInterval: 30000 });
  const { data: videoData } = useSWR<VideoDraft[]>('/api/video-drafts', fetcher, { refreshInterval: 30000 });

  const textItems: any[] = [];
  if (Array.isArray(textData)) {
    textData.forEach((d: any) => {
      const p = d.platformStatuses || {};
      if (d.finalDraft?.linkedin) {
        textItems.push({ ...d, _type: 'text', draftStatus: getPlatformStatus(p.linkedin, d.draftStatus), platform: 'LinkedIn', jobId: d.jobId + '-li' });
      }
      if (d.finalDraft?.x) {
        textItems.push({ ...d, _type: 'text', draftStatus: getPlatformStatus(p.x, d.draftStatus), platform: 'X', jobId: d.jobId + '-x' });
      }
      if (d.finalDraft?.instagram) {
        textItems.push({ ...d, _type: 'text', draftStatus: getPlatformStatus(p.instagram, d.draftStatus), platform: 'Instagram', jobId: d.jobId + '-insta' });
      }
    });
  }

  const allItems = [
    ...textItems,
    ...(Array.isArray(videoData) ? videoData.map((d: any) => ({ ...d, _type: 'video' as const })) : []),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let commentedCount = 0;

  if (role === 'noa') {
    pendingCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return s.includes('pending_noa') || s === 'ready_for_noa_review' || s.includes('generating');
    }).length;
    approvedCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return ['pending_founders', 'approved_founders', 'posted'].includes(s);
    }).length;
    rejectedCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return s.includes('rejected_permanently') || s === 'rejected_founders';
    }).length;
    commentedCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return s.includes('rejected_noa') || s === 'revision_requested_founders';
    }).length;
  } else {
    pendingCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return s === 'pending_founders';
    }).length;
    approvedCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return s === 'approved_founders' || s === 'posted';
    }).length;
    rejectedCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return s === 'rejected_founders';
    }).length;
    commentedCount = allItems.filter(item => {
      const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
      return s === 'revision_requested_founders';
    }).length;
  }

  const totalDrafts = pendingCount + approvedCount + rejectedCount + commentedCount;

  // Donut calculations
  const totalC = 440; // 2 * PI * 70
  const safeTotal = totalDrafts || 1;
  const valApproved = (approvedCount / safeTotal) * totalC;
  const valPending = (pendingCount / safeTotal) * totalC;
  const valRejected = (rejectedCount / safeTotal) * totalC;
  const valCommented = (commentedCount / safeTotal) * totalC;

  const topRecent = allItems.filter(item => {
    const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
    if (role === 'noa') {
      return s.includes('pending_noa') || 
             s === 'ready_for_noa_review' ||
             s.includes('generating') || 
             ['pending_founders', 'approved_founders', 'posted', 'revision_requested_founders'].includes(s) ||
             s.includes('rejected_noa') ||
             s.includes('rejected_permanently');
    } else {
      return s === 'pending_founders' ||
             s === 'approved_founders' || 
             s === 'posted' ||
             s === 'rejected_founders' ||
             s === 'revision_requested_founders';
    }
  }).slice(0, 5);

  return (
    <div className="page-container" style={{ padding: '32px 48px', maxWidth: 1400 }}>
      {/* ── HEADER ── */}
      <div className="dash-header-wrap">
        <h1 className="dash-title">Dashboard</h1>
      </div>

      <div className="dashboard-grid">
        {/* ── LEFT COLUMN ── */}
        <div className="dash-left-col">
          
          {/* Top Metrics Row */}
          <div className="metrics-row">
            {/* Total Processed */}
            <div className="metric-card">
              <div className="metric-title">Total Processed</div>
              <div className="metric-value-row">
                <div className="metric-value">{totalDrafts}</div>
                <div className="metric-sub">↗ generated</div>
              </div>
              
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: '#f3f4f6', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: totalDrafts > 0 ? `${(approvedCount / totalDrafts) * 100}%` : '0%', background: '#10b981', height: '100%' }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, fontWeight: 600 }}>
                {approvedCount} approved out of {totalDrafts} total
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="metric-card">
              <div className="metric-title">Pipeline Status</div>
              <div className="metric-value-row">
                <div className="metric-value">{totalDrafts}</div>
                <div className="metric-sub gray">total drafts</div>
              </div>
              
              <div className="segments-grid">
                <div className="segment-bar" style={{ background: '#10b981', height: approvedCount > 0 ? Math.max(8, (approvedCount/safeTotal)*100) + '%' : '0%' }} title="Approved" />
                <div className="segment-bar" style={{ background: '#ef4444', height: rejectedCount > 0 ? Math.max(8, (rejectedCount/safeTotal)*100) + '%' : '0%' }} title="Declined" />
                <div className="segment-bar" style={{ background: '#f59e0b', height: pendingCount > 0 ? Math.max(8, (pendingCount/safeTotal)*100) + '%' : '0%' }} title="Pending" />
                <div className="segment-bar" style={{ background: '#0ea5e9', height: commentedCount > 0 ? Math.max(8, (commentedCount/safeTotal)*100) + '%' : '0%' }} title="Commented" />
              </div>
              
              <div className="segment-legend">
                <div className="segment-legend-item">
                  <div className="legend-dot" style={{ background: '#10b981' }} /> Approved ({approvedCount})
                </div>
                <div className="segment-legend-item">
                  <div className="legend-dot" style={{ background: '#ef4444' }} /> Declined ({rejectedCount})
                </div>
                <div className="segment-legend-item">
                  <div className="legend-dot" style={{ background: '#f59e0b' }} /> Pending ({pendingCount})
                </div>
                <div className="segment-legend-item">
                  <div className="legend-dot" style={{ background: '#0ea5e9' }} /> Commented ({commentedCount})
                </div>
              </div>
            </div>
          </div>

          {/* Recent Drafts */}
          <div className="recent-card">
            <div className="recent-header">
              <div className="recent-title">Recent Drafts</div>
              <Link href={role === 'noa' ? "/noa/text" : "/founders/text"} className="recent-view-all">View all ❯</Link>
            </div>
            
            <div className="recent-list">
              {topRecent.map(item => {
                const dateStr = item.updatedAt ? format(new Date(item.updatedAt), "MMM d, hh:mm a") : '—';
                const initial = item._type === 'text' ? 'T' : 'V';
                
                const s = typeof item.draftStatus === 'string' ? item.draftStatus : '';
                let badgeClass = 'pending';
                let badgeLabel = 'PENDING';
                if (s === 'approved_founders' || s === 'posted') {
                  badgeClass = 'ready'; badgeLabel = 'APPROVED';
                } else if (s.includes('reject')) {
                  badgeClass = 'error'; badgeLabel = 'REJECTED';
                } else if (s === 'revision_requested_founders') {
                  badgeClass = 'commented'; badgeLabel = 'COMMENTED';
                }

                const draftName = item._type === 'text' 
                  ? ((item as ContentDraft).platform || 'Text Draft')
                  : (s.includes('prompt') ? 'Video Prompt' : 'Video Draft');

                return (
                  <Link href={item._type === 'text' ? (role === 'noa' ? '/noa/text' : '/founders/text') : (role === 'noa' ? '/noa/video' : '/founders/video')} key={item.jobId} className="recent-item" style={{ textDecoration: 'none' }}>
                    <div className="recent-item-left">
                      <div className="recent-item-icon">{initial}</div>
                      <div>
                        <div className="recent-item-name">{draftName}</div>
                        <div className="recent-item-meta">{dateStr}</div>
                      </div>
                    </div>
                    <div className={`recent-badge ${badgeClass}`}>{badgeLabel}</div>
                  </Link>
                );
              })}
              {topRecent.length === 0 && (
                <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No recent drafts</div>
              )}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="dash-right-col">
          
          {/* Pipeline Overview */}
          <div className="sidebar-card">
            <div className="sidebar-title">Pipeline Overview</div>
            <div className="action-list">
              <div className="action-item">
                <div className="action-item-left">
                  <div className="action-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>✓</div>
                  Approved
                </div>
                <div className="action-item-val">{approvedCount}</div>
              </div>
              <div className="action-item">
                <div className="action-item-left">
                  <div className="action-icon-wrap" style={{ background: '#fee2e2', color: '#ef4444' }}>✕</div>
                  Declined
                </div>
                <div className="action-item-val">{rejectedCount}</div>
              </div>
              <div className="action-item">
                <div className="action-item-left">
                  <div className="action-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>⏳</div>
                  Pending {role === 'noa' ? 'Noa' : 'Founders'}
                </div>
                <div className="action-item-val">{pendingCount}</div>
              </div>
              <div className="action-item">
                <div className="action-item-left">
                  <div className="action-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>✎</div>
                  Commented
                </div>
                <div className="action-item-val">{commentedCount}</div>
              </div>
            </div>
          </div>

          {/* Drafts by Status (Donut) */}
          <div className="sidebar-card">
            <div className="sidebar-title">Drafts by Status</div>
            <div className="donut-wrap">
              <svg className="donut-chart-svg" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" className="donut-circle donut-bg" />
                <circle cx="80" cy="80" r="70" className="donut-circle" style={{ stroke: '#0ea5e9', strokeDasharray: `${valCommented} ${totalC}`, strokeDashoffset: 0 }} />
                <circle cx="80" cy="80" r="70" className="donut-circle" style={{ stroke: '#f59e0b', strokeDasharray: `${valPending} ${totalC}`, strokeDashoffset: -valCommented }} />
                <circle cx="80" cy="80" r="70" className="donut-circle" style={{ stroke: '#ef4444', strokeDasharray: `${valRejected} ${totalC}`, strokeDashoffset: -(valCommented + valPending) }} />
                <circle cx="80" cy="80" r="70" className="donut-circle" style={{ stroke: '#10b981', strokeDasharray: `${valApproved} ${totalC}`, strokeDashoffset: -(valCommented + valPending + valRejected) }} />
                <text x="80" y="75" fill="#111827" fontSize="24" fontWeight="800" textAnchor="middle" transform="rotate(90 80 80)">{totalDrafts}</text>
                <text x="80" y="95" fill="#9ca3af" fontSize="10" fontWeight="700" textAnchor="middle" transform="rotate(90 80 80)">TOTAL</text>
              </svg>

              <div className="donut-legend">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="legend-dot" style={{ background: '#10b981' }}/> Approved
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="legend-dot" style={{ background: '#ef4444' }}/> Declined
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="legend-dot" style={{ background: '#f59e0b' }}/> Pending
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="legend-dot" style={{ background: '#0ea5e9' }}/> Commented
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
