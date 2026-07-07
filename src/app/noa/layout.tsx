'use client';
// src/app/noa/layout.tsx
import Sidebar, { TextIcon, VideoIcon, TrackerIcon, HistoryIcon, SparklesIcon, CodeIcon } from '@/components/Sidebar/Sidebar';
import useSWR from 'swr';
import { ContentDraft } from '@/lib/types';
import { getPlatformStatus } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function NoaLayout({ children }: { children: React.ReactNode }) {
  const { data: textQueue } = useSWR('/api/content-drafts?status=ready_for_noa_review', fetcher, { refreshInterval: 30000 });
  const { data: promptQueue } = useSWR('/api/video-drafts?status=pending_noa_prompt', fetcher, { refreshInterval: 30000 });
  const { data: videoQueue } = useSWR('/api/video-drafts?status=pending_noa_video', fetcher, { refreshInterval: 30000 });

  let textCount = 0;
  if (Array.isArray(textQueue)) {
    textQueue.forEach((d: ContentDraft) => {
      const p = d.platformStatuses || {};
      const fd = (d.finalDraft as Record<string, unknown>) || {};
      const sX = getPlatformStatus(p.x, 'no_status');
      const sLI = getPlatformStatus(p.linkedin, 'no_status');
      const sInsta = getPlatformStatus(p.instagram, 'no_status');
      
      if (sX === 'ready_for_noa_review' && fd.x) textCount++;
      if (sLI === 'ready_for_noa_review' && fd.linkedin) textCount++;
      if (sInsta === 'ready_for_noa_review' && fd.instagram) textCount++;
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
      href: '/noa/generate',
      icon: <SparklesIcon />,
      label: 'Generate Content',
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
      href: '/noa/history',
      icon: <HistoryIcon />,
      label: 'History',
    },
    {
      href: '/noa/prompts',
      icon: <CodeIcon />,
      label: 'System Prompts',
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
