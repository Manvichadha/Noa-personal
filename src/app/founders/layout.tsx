'use client';
// src/app/founders/layout.tsx
import Sidebar, { TextIcon, VideoIcon, HistoryIcon, TrackerIcon, SparklesIcon } from '@/components/Sidebar/Sidebar';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function FoundersLayout({ children }: { children: React.ReactNode }) {
  const { data: textQueue } = useSWR('/api/content-drafts?status=pending_founders', fetcher, { refreshInterval: 30000 });
  const { data: videoQueue } = useSWR('/api/video-drafts?status=pending_founders&hasVideo=true', fetcher, { refreshInterval: 30000 });

  const textCount = Array.isArray(textQueue) ? textQueue.length : 0;
  const videoCount = Array.isArray(videoQueue) ? videoQueue.length : 0;

  const navItems = [
    {
      href: '/founders/tracker',
      icon: <TrackerIcon />,
      label: 'Status Tracker',
    },
    {
      href: '/founders/generate',
      icon: <SparklesIcon />,
      label: 'Generate Content',
    },
    {
      href: '/founders/text',
      icon: <TextIcon />,
      label: 'Text Review',
      badge: textCount,
    },
    {
      href: '/founders/video',
      icon: <VideoIcon />,
      label: 'Video Review',
      badge: videoCount,
    },
    {
      href: '/founders/history',
      icon: <HistoryIcon />,
      label: 'History',
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar role="founders" navItems={navItems} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
