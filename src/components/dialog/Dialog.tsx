import { useEffect } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

function Dialog({ isOpen, onClose, title, children, width = '400px' }: DialogProps) {
  // Fecha com ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999,
        animation: 'fadeIn 0.2s ease'
      }}
    >
      {/* Painel */}
      <div 
        onClick={e => e.stopPropagation()} // evita fechar ao clicar no conteúdo
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
          width,
          maxWidth: '90vw',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            padding: '20px 24px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--primary-gold)' }}>
              {title}
            </h2>
            <span
              onClick={onClose}
              className="close"
              style={{ fontSize: '18px', cursor: 'pointer' }}
            >
              ✕
            </span>
          </div>
        )}

        {/* Conteúdo */}
        <div style={{ padding: '20px 24px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dialog;