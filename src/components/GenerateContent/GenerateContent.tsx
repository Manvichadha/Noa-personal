'use client';
import React, { useState } from 'react';
import Toast, { ToastMessage } from '@/components/Toast/Toast';

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function GenerateContent() {
  const [activeTab, setActiveTab] = useState<'idea' | 'file' | 'url' | 'video'>('idea');
  const [ideaText, setIdeaText] = useState('');
  const [urlText, setUrlText] = useState('');
  const [videoUrlText, setVideoUrlText] = useState('');
  const [videoPromptText, setVideoPromptText] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function generateId() { return Math.random().toString(36).slice(2); }

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts(prev => [...prev, { id: generateId(), type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileDrop = (e: React.DragEvent, type: 'document' | 'video') => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (type === 'document') {
        const dropped = Array.from(e.dataTransfer.files);
        setFiles(prev => {
          const existing = new Set(prev.map(f => f.name + f.size));
          return [...prev, ...dropped.filter(f => !existing.has(f.name + f.size))];
        });
      }
      if (type === 'video') setVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 'idea' && !ideaText.trim()) return addToast('error', 'Please enter an idea.');
    if (activeTab === 'file' && files.length === 0) return addToast('error', 'Please upload at least one file.');
    if (activeTab === 'url' && !urlText.trim()) return addToast('error', 'Please enter a URL.');
    if (activeTab === 'video' && !videoFile && !videoUrlText.trim()) return addToast('error', 'Please upload a video or paste a URL.');
    if (activeTab === 'video' && !videoPromptText.trim()) return addToast('error', 'Please provide a prompt for the video (e.g. transcript or summary).');

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('inputType', activeTab);

      if (activeTab === 'idea') formData.append('inputContent', ideaText);
      if (activeTab === 'url') formData.append('inputContent', urlText);
      if (activeTab === 'file') {
        files.forEach(f => formData.append('file', f as Blob));
        formData.append('inputContent', files.map(f => f.name).join(', '));
      }
      if (activeTab === 'video') {
        if (videoFile) {
          formData.append('file', videoFile as Blob);
          formData.append('inputContent', (videoFile as File).name);
        } else if (videoUrlText) {
          formData.append('inputContent', videoUrlText);
        }
        formData.append('videoPrompt', videoPromptText);
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to start generation');

      addToast('success', 'Pipeline triggered successfully!');

      // Clear inputs after successful submission
      setIdeaText('');
      setUrlText('');
      setVideoUrlText('');
      setVideoPromptText('');
      setFiles([]);
      setVideoFile(null);

    } catch {
      addToast('error', 'Failed to trigger pipeline. Ensure the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TABS = [
    { id: 'idea', label: 'Manual Idea' },
    { id: 'file', label: 'File Upload' },
    { id: 'url', label: 'Website URL' },
    { id: 'video', label: 'Video / Audio' },
  ] as const;

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <h1 className="page-title">Generate Content</h1>
        <p className="page-subtitle">Initiate an AI generation pipeline from an idea, file, or web link.</p>
      </div>

      {/* Main Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {/* Tab Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '16px 0',
                fontSize: 13.5,
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                background: 'transparent',
                transition: 'color 0.2s ease, border-color 0.2s ease',
                letterSpacing: '-0.1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: '36px 40px' }}>

          {/* IDEA TAB */}
          {activeTab === 'idea' && (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                What do you want to write about?
              </label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Write a detailed analysis about the future of Agentic AI in 2026..."
                value={ideaText}
                onChange={e => setIdeaText(e.target.value)}
                style={{ height: 240, resize: 'vertical' }}
              />
            </div>
          )}

          {/* FILE TAB */}
          {activeTab === 'file' && (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                Upload guidelines or source material
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleFileDrop(e, 'document')}
                style={{
                  border: isDragOver ? '2px dashed var(--text-primary)' : '2px dashed #d1d5db',
                  borderRadius: 14,
                  padding: files.length > 0 ? '32px 20px 24px' : '56px 20px',
                  textAlign: 'center',
                  background: isDragOver ? 'var(--bg-sidebar-hover)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt,.md,.csv,.xlsx,.xls"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const selected = Array.from(e.target.files);
                      setFiles(prev => {
                        const existing = new Set(prev.map(f => f.name + f.size));
                        return [...prev, ...selected.filter(f => !existing.has(f.name + f.size))];
                      });
                      // Reset input so same file can be re-added after removal
                      e.target.value = '';
                    }
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <UploadIcon />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {files.length === 0 ? 'Click or drag files to this area' : 'Add more files'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 8 }}>
                  PDF, TXT, MD, CSV, XLSX, XLS &mdash; multiple files supported
                </div>
              </div>

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {files.map((f, idx) => (
                    <div
                      key={f.name + f.size + idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 10px 5px 12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 999,
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        maxWidth: 260,
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                        ({(f.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles(prev => prev.filter((_, i) => i !== idx));
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'var(--text-tertiary)',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                          lineHeight: 1,
                        }}
                        title={`Remove ${f.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL TAB */}
          {activeTab === 'url' && (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                Website or article URL
              </label>
              <input
                type="url"
                className="form-textarea"
                style={{ minHeight: 'unset', height: 48, padding: '0 16px', lineHeight: '48px' }}
                placeholder="https://example.com/article"
                value={urlText}
                onChange={e => setUrlText(e.target.value)}
              />
              <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 14, lineHeight: 1.6 }}>
                The AI will visit the website, extract the main content, and generate drafts based on it.
              </p>
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 28, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                    Video URL (YouTube / Instagram)
                  </label>
                  <input
                    type="url"
                    className="form-textarea"
                    style={{ minHeight: 'unset', height: 48, padding: '0 16px', lineHeight: '48px' }}
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrlText}
                    onChange={e => setVideoUrlText(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 600, paddingBottom: 14, letterSpacing: '0.5px' }}>
                  OR
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                    Upload video/audio file
                  </label>
                  <button
                    className="btn btn-ghost"
                    style={{ height: 48, width: '100%', justifyContent: 'center', fontSize: 13 }}
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    {videoFile ? videoFile.name : 'Choose File...'}
                  </button>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*,audio/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) setVideoFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                Processing prompt
              </label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Generate a transcript and send to mail, or generate a summary and send to Slack..."
                value={videoPromptText}
                onChange={e => setVideoPromptText(e.target.value)}
                style={{ height: 120 }}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 40px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '11px 32px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: '#111827',
              borderRadius: 10,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.55 : 1,
              transition: 'all 0.2s ease',
              letterSpacing: '-0.1px',
            }}
            onMouseEnter={e => {
              if (!isSubmitting) (e.currentTarget.style.background = '#1f2937');
            }}
            onMouseLeave={e => {
              (e.currentTarget.style.background = '#111827');
            }}
          >
            {isSubmitting ? 'Starting Pipeline...' : 'Generate'}
          </button>
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
