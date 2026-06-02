'use client';
// src/components/EmptyState/EmptyState.tsx

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
}

export default function EmptyState({ icon = '📭', title, body }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {body && <p className="empty-state-body">{body}</p>}
    </div>
  );
}
