'use client';
// src/components/Sidebar/Sidebar.tsx
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface SidebarProps {
  role: 'noa' | 'founders';
  navItems: NavItem[];
}

const BrandLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '4px' }}>
    <div style={{ width: '3px', height: '16px', backgroundColor: '#B91C1C' }}></div>
    <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '2px', color: '#111', margin: 0, lineHeight: 1 }}>VIGIL</span>
  </div>
);

const FounderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const TextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const TrackerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const StatusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="3" y1="20" x2="21" y2="20"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063A2 2 0 0 0 14.063 15.5L12.5 21.635a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4M22 5h-4" />
  </svg>
);

export { TextIcon, VideoIcon, TrackerIcon, HistoryIcon, LogoutIcon, StatusIcon, SparklesIcon };

export default function Sidebar({ role, navItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem('noa_text_approved');
    localStorage.removeItem('noa_text_rejected');
    localStorage.removeItem('noa_text_edited');
    localStorage.removeItem('founder_text_approved');
    localStorage.removeItem('founder_text_rejected');
    localStorage.removeItem('founder_text_edited');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Role display
  const roleLabel = role === 'noa' ? 'Noa' : 'Founders';
  const roleInitial = role === 'noa' ? 'N' : 'F';
  const roleColor = role === 'noa' ? '#B91C1C' : '#111';

  const dashboardHome = role === 'noa' ? '/noa/tracker' : '/founders/tracker';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href={dashboardHome} className="sidebar-logo" title="Dashboard" style={{ textDecoration: 'none' }}>
        <BrandLogo />
      </Link>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item${isActive ? ' active' : ''}`}
              title={item.label}
            >
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-divider" />

      {/* Bottom — role avatar + logout */}
      <div className="sidebar-bottom">
        {/* Role avatar */}
        <div
          title={`Signed in as ${roleLabel}`}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: roleColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff',
            marginBottom: 6,
            boxShadow: `0 2px 8px ${roleColor}55`,
            cursor: 'default',
            flexShrink: 0,
          }}
        >
          {roleInitial}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: 'none',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5';
            (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
          }}
        >
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
