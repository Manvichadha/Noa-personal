// src/app/page.tsx — Landing page
import Link from 'next/link';
import './landing.css';

export default function LandingPage() {
  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="lp-logo-name"></span>
          </Link>

          <ul className="lp-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#why">Why Us</a></li>
          </ul>

          <div className="lp-nav-actions">
            <Link href="/login" className="lp-btn-login">Login</Link>
            <Link href="/login" className="lp-btn-cta">
              Get Started <span>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-pill">
            <span className="lp-hero-pill-dot" />
            AI-Powered Content Review Platform
          </div>

          <h1 className="lp-hero-h1">
            Human-in-the-Loop
            <span className="lp-hero-gradient">Content Pipeline</span>
          </h1>

          <p className="lp-hero-sub">
            Review, approve, and shape AI-generated content before it ever reaches your audience. Built for teams who move fast without losing control.
          </p>

          <div className="lp-hero-actions">
            <Link href="/login" className="lp-btn-primary">
              Noa Dashboard <span>→</span>
            </Link>
            <Link href="/login" className="lp-btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Founder Team
            </Link>
          </div>

          <div className="lp-hero-trust">
            <div className="lp-hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              N8N Integrated
            </div>
            <div className="lp-hero-trust-sep" />
            <div className="lp-hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Real-time Review
            </div>
            <div className="lp-hero-trust-sep" />
            <div className="lp-hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Higgsfield + SocialBee
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="lp-section" style={{ background: '#f8faff' }}>
        <div className="lp-section-inner">
          <div className="lp-section-label">The Problem We Solve</div>
          <h2 className="lp-section-title">AI content without humans<br/>is a liability</h2>
          <p className="lp-section-sub">
            Publishing unreviewed AI content damages brand trust. Important edits and strategic decisions get lost without a structured review layer.
          </p>

          <div className="lp-stats-grid">
            <div className="lp-stat-card">
              <div className="lp-stat-number">5×</div>
              <div className="lp-stat-label">Faster Review Cycles</div>
              <div className="lp-stat-desc">vs. unstructured approval chains</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-number">100%</div>
              <div className="lp-stat-label">Human-Approved Output</div>
              <div className="lp-stat-desc">nothing posts without sign-off</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-number">0</div>
              <div className="lp-stat-label">Missed Feedback Loops</div>
              <div className="lp-stat-desc">every rejection reaches the AI agents</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features" style={{ background: '#fff' }}>
        <div className="lp-section-inner">
          <div className="lp-section-label">Our Solution</div>
          <h2 className="lp-section-title">Four powerful review layers</h2>
          <p className="lp-section-sub">
            Purpose-built dashboards for every stage of the content pipeline.
          </p>

          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: '#fef3c7' }}>📝</div>
              <div className="lp-feature-title">Text Review</div>
              <div className="lp-feature-desc">
                Noa reviews platform-native copy for X, LinkedIn, and Instagram before it reaches founders.
              </div>
            </div>
            <div className="lp-feature-card featured">
              <div className="lp-feature-icon" style={{ background: '#ede9fe' }}>🎬</div>
              <div className="lp-feature-title">Video Review</div>
              <div className="lp-feature-desc">
                Approve Higgsfield prompts and embedded video previews with full playback controls.
              </div>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: '#d1fae5' }}>✅</div>
              <div className="lp-feature-title">Founder Approval</div>
              <div className="lp-feature-desc">
                Final gating layer — approve, comment, or disapprove with one click. Comments loop back to AI agents.
              </div>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                  <line x1="3" y1="20" x2="21" y2="20"/>
                </svg>
              </div>
              <div className="lp-feature-title">Status Tracker</div>
              <div className="lp-feature-desc">
                Real-time pipeline visibility across all content, both text and video, in a single read-only feed.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-how-bg" id="how-it-works">
        <div className="lp-section-inner">
          <div className="lp-section-label">How It Works</div>
          <h2 className="lp-section-title">From AI generation to published post</h2>
          <p className="lp-section-sub">Five agents, two review gates, one seamless pipeline.</p>

          <div className="lp-steps-grid">
            <div className="lp-step-card">
              <div className="lp-step-num">Step 01</div>
              <div className="lp-step-icon">🤖</div>
              <div className="lp-step-title">AI Generates</div>
              <div className="lp-step-desc">5 agents process raw inputs into platform-native drafts in seconds.</div>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-num">Step 02</div>
              <div className="lp-step-icon">👀</div>
              <div className="lp-step-title">Noa Reviews</div>
              <div className="lp-step-desc">Noa approves or rejects with written feedback that feeds back to the AI.</div>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-num">Step 03</div>
              <div className="lp-step-icon">🏆</div>
              <div className="lp-step-title">Founders Decide</div>
              <div className="lp-step-desc">Founders approve, comment, or disapprove. Comments trigger another AI revision cycle.</div>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-num">Step 04</div>
              <div className="lp-step-icon">🚀</div>
              <div className="lp-step-title">SocialBee Posts</div>
              <div className="lp-step-desc">Approved content is automatically sent to SocialBee for optimal-time publishing.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DARK SECTION ── */}
      <section className="lp-dark-wrap" id="why" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="lp-dark-section">
          <div className="lp-dark-icon">🔒</div>
          <h2 className="lp-dark-title">Your Pipeline, Your Control</h2>
          <p className="lp-dark-sub">
            Every piece of content is gated behind human review. Nothing reaches your audience without explicit approval from your team.
          </p>

          <div className="lp-dark-grid">
            <div className="lp-dark-card">
              <span className="lp-dark-card-icon">🛡️</span>
              <div>
                <div className="lp-dark-card-label">Role-Based Access</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>Noa and Founders see only what they need</div>
              </div>
            </div>
            <div className="lp-dark-card">
              <span className="lp-dark-card-icon">🔄</span>
              <div>
                <div className="lp-dark-card-label">Feedback Loops</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>Every rejection goes back to the AI agents</div>
              </div>
            </div>
            <div className="lp-dark-card">
              <span className="lp-dark-card-icon">📡</span>
              <div>
                <div className="lp-dark-card-label">Real-time Sync</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>30-second polling keeps all views fresh</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="lp-cta-section">
        <h2 className="lp-cta-title">
          Ready to take control of
          <span className="lp-cta-accent">your content pipeline?</span>
        </h2>
        <p className="lp-cta-sub">
          Join the review workflow your AI content deserves. Built on N8N, Higgsfield, and SocialBee.
        </p>
        <Link href="/login" className="lp-btn-purple">
          Get Started <span>→</span>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-icon" style={{ width: 30, height: 30, borderRadius: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="lp-logo-name" style={{ fontSize: 15 }}></span>
          </Link>

          <ul className="lp-footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><Link href="/login">Noa Dashboard</Link></li>
            <li><Link href="/login">Founder Dashboard</Link></li>
          </ul>

          <div className="lp-footer-copy">© 2026. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
