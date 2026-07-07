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
  role: 'noa';
  navItems: NavItem[];
}

const BrandLogo = () => (
  <img
    src="/bleukei-logo-dark.png"
    alt="bleukei"
    style={{ width: 64, height: 64, objectFit: 'contain' }}
  />
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

const CodeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

export { TextIcon, VideoIcon, TrackerIcon, HistoryIcon, LogoutIcon, StatusIcon, SparklesIcon, CodeIcon };

export default function Sidebar({ role, navItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem('noa_text_approved');
    localStorage.removeItem('noa_text_rejected');
    localStorage.removeItem('noa_text_edited');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Role display
  const roleLabel = 'Noa';
  const roleInitial = 'N';
  const roleColor = '#2B3CE3';

  const dashboardHome = '/noa/tracker';

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
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-sidebar-hover)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-focus)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
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
