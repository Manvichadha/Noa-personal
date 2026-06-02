'use client';
// src/app/noa/layout.tsx
import Sidebar, { TextIcon, VideoIcon, TrackerIcon, HistoryIcon, StatusIcon } from '@/components/Sidebar/Sidebar';
import useSWR from 'swr';
import { getPlatformStatus } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function NoaLayout({ children }: { children: React.ReactNode }) {
  const { data: textQueue } = useSWR('/api/content-drafts?status=ready_for_noa_review', fetcher, { refreshInterval: 30000 });
  const { data: promptQueue } = useSWR('/api/video-drafts?status=pending_noa_prompt', fetcher, { refreshInterval: 30000 });
  const { data: videoQueue } = useSWR('/api/video-drafts?status=pending_noa_video', fetcher, { refreshInterval: 30000 });

  let textCount = 0;
  if (Array.isArray(textQueue)) {
    textQueue.forEach((d: any) => {
      const sX = getPlatformStatus(d.platformStatuses?.x, 'no_status');
      const sLI = getPlatformStatus(d.platformStatuses?.linkedin, 'no_status');
      const sInsta = getPlatformStatus(d.platformStatuses?.instagram, 'no_status');
      
      if (sX === 'ready_for_noa_review' && d.finalDraft?.x) textCount++;
      if (sLI === 'ready_for_noa_review' && d.finalDraft?.linkedin) textCount++;
      if (sInsta === 'ready_for_noa_review' && d.finalDraft?.instagram) textCount++;
    });
  }

  const videoCount = (Array.isArray(promptQueue) ? promptQueue.length : 0) + (Array.isArray(videoQueue) ? videoQueue.length : 0);

  const navItems = [
    {
      href: '/noa/tracker',
      icon: <TrackerIcon />,
      label: 'Status Tracker',
    },
    {
      href: '/noa/text',
      icon: <TextIcon />,
      label: 'Text Review',
      badge: textCount,
    },
    {
      href: '/noa/video',
      icon: <VideoIcon />,
      label: 'Video Review',
      badge: videoCount,
    },
    {
      href: '/noa/founder-status',
      icon: <StatusIcon />,
      label: 'Founder Status',
    },
    {
      href: '/noa/history',
      icon: <HistoryIcon />,
      label: 'History',
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar role="noa" navItems={navItems} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
