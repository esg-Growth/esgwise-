import { CSSProperties } from 'react';

export function Skeleton({ className = '', style }: { className?: string, style?: CSSProperties }) {
  return (
    <div
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        backgroundColor: 'rgba(200, 200, 200, 0.2)',
        borderRadius: '8px',
        width: '100%',
        height: '100%',
        ...style
      }}
      className={className}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
