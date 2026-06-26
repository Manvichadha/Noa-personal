// src/app/page.tsx — Landing page
import Link from 'next/link';
import { FileText, Clapperboard, CheckSquare, Bot, Eye, Trophy, Rocket, Lock, Shield, RefreshCw, Radio, BarChart2 } from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '20px', backgroundColor: '#B91C1C' }}></div>
            <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '2px', color: '#111', margin: 0, lineHeight: 1 }}>VANCO</span>
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
            <span className="lp-hero-pill-dot" style={{ background: '#B91C1C' }}></span>
            AI-Powered Content Review Platform
          </div>

          <h1 className="lp-hero-h1">
            Content Generation<br />
            <span className="lp-hero-gradient" style={{ background: 'none', color: '#B91C1C', WebkitTextFillColor: 'initial' }}>& Approval Agent</span>
          </h1>

          <p className="lp-hero-sub">
            Review, approve, and shape AI-generated content before it ever reaches your audience. Built for teams who move fast without losing control.
          </p>

          <div className="lp-hero-actions">
            <Link href="/login" className="lp-btn-primary">
              Dashboard <span>→</span>
            </Link>
          </div>

          <div className="lp-hero-trust">
            <div className="lp-hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              N8N Integrated
            </div>
            <div className="lp-hero-trust-sep" />
            <div className="lp-hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Real-time Review
            </div>
            <div className="lp-hero-trust-sep" />
            <div className="lp-hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Higgsfield + Postiz
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="lp-section" style={{ background: '#f8faff' }}>
        <div className="lp-section-inner">
          <div className="lp-section-label">The Problem We Solve</div>
          <h2 className="lp-section-title">AI content without humans<br /><span style={{ color: '#B91C1C' }}>is a liability</span></h2>
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
          <p className="lp-section-sub" style={{ color: '#B91C1C' }}>
            Purpose-built dashboards for every stage of the content pipeline.
          </p>

          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} color="#B91C1C" strokeWidth={1.5} />
              </div>
              <div className="lp-feature-title">Text Review</div>
              <div className="lp-feature-desc">
                You review platform-native copy for X, LinkedIn, and Instagram before it is published.
              </div>
            </div>
            <div className="lp-feature-card featured">
              <div className="lp-feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clapperboard size={24} color="#B91C1C" strokeWidth={1.5} />
              </div>
              <div className="lp-feature-title">Video Review</div>
              <div className="lp-feature-desc">
                Approve Higgsfield prompts and embedded video previews with full playback controls.
              </div>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={24} color="#B91C1C" strokeWidth={1.5} />
              </div>
              <div className="lp-feature-title">Final Approval</div>
              <div className="lp-feature-desc">
                Approve, reject, or edit with one click. Rejections loop back to AI agents.
              </div>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={24} color="#B91C1C" strokeWidth={1.5} />
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
          <p className="lp-section-sub" style={{ color: '#B91C1C' }}>Five agents, one review gate, one seamless pipeline.</p>

          <div className="lp-steps-grid">
            <div className="lp-step-card">
              <div className="lp-step-num">Step 01</div>
              <div className="lp-step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={28} color="#B91C1C" strokeWidth={1.5} />
              </div>
              <div className="lp-step-title">AI Generates</div>
              <div className="lp-step-desc">5 agents process raw inputs into platform-native drafts in seconds.</div>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-num">Step 02</div>
              <div className="lp-step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={28} color="#B91C1C" strokeWidth={1.5} />
              </div>
              <div className="lp-step-title">You Review</div>
              <div className="lp-step-desc">You approve or reject with written feedback that feeds back to the AI.</div>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-num">Step 03</div>
              <div className="lp-step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={28} color="#B91C1C" strokeWidth={1.5} />
              </div>
              <div className="lp-step-title">You Decide</div>
              <div className="lp-step-desc">You approve or reject. Rejections trigger another AI revision cycle.</div>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-num">Step 04</div>
              <div className="lp-step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rocket size={28} color="#B91C1C" strokeWidth={1.5} />
              </div>
              <div className="lp-step-title">Postiz Posts</div>
              <div className="lp-step-desc">Approved content is automatically sent to Postiz for optimal-time publishing.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DARK SECTION ── */}
      <section className="lp-dark-wrap" id="why">
        <div className="lp-dark-section">
          <div className="lp-dark-left">
            <div className="lp-dark-mission">THE MISSION</div>
          </div>
          <div className="lp-dark-right">
            <h2 className="lp-dark-title">Your Pipeline, Your Control</h2>
            <p className="lp-dark-sub">
              <span style={{ color: '#B91C1C', fontStyle: 'italic' }}>Every piece of content is gated behind human review.</span><br /><br />
              Nothing reaches your audience without explicit approval from your team.
            </p>

            <div className="lp-dark-grid">
              <div className="lp-dark-card">
                <span className="lp-dark-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={24} color="#fff" strokeWidth={1.5} />
                </span>
                <div>
                  <div className="lp-dark-card-label">Role-Based Access</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4, fontFamily: 'ui-serif, Georgia, serif' }}>Access only what you need</div>
                </div>
              </div>
              <div className="lp-dark-card">
                <span className="lp-dark-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={24} color="#fff" strokeWidth={1.5} />
                </span>
                <div>
                  <div className="lp-dark-card-label">Feedback Loops</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4, fontFamily: 'ui-serif, Georgia, serif' }}>Every rejection goes back to the AI agents</div>
                </div>
              </div>
              <div className="lp-dark-card">
                <span className="lp-dark-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Radio size={24} color="#fff" strokeWidth={1.5} />
                </span>
                <div>
                  <div className="lp-dark-card-label">Real-time Sync</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4, fontFamily: 'ui-serif, Georgia, serif' }}>30-second polling keeps all views fresh</div>
                </div>
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
          Join the review workflow your AI content deserves. Built on N8N, Higgsfield, and Postiz.
        </p>
        <Link href="/login" className="lp-btn-purple">
          Get Started <span>→</span>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Link href="/" className="lp-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '20px', backgroundColor: '#B91C1C' }}></div>
            <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '2px', color: '#111', margin: 0, lineHeight: 1 }}>VANCO</span>
          </Link>

          <ul className="lp-footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><Link href="/login">Dashboard</Link></li>
          </ul>

          <div className="lp-footer-copy">© 2026. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
