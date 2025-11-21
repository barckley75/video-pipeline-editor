// src/components/ui/InputDialog.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FONT_FAMILY } from '../../constants/nodeTypes';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  title,
  placeholder,
  onConfirm,
  onCancel
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setValue('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: FONT_FAMILY
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(0, 20, 40, 0.98) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.5)',
          borderRadius: '12px',
          padding: '24px',
          minWidth: '400px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.3)'
        }}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#93c5fd',
          textTransform: 'uppercase',
          letterSpacing: '1.5px'
        }}>
          {title}
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '13px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#e0f2fe',
              outline: 'none',
              fontFamily: 'inherit',
              marginBottom: '16px',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                background: 'rgba(107, 114, 128, 0.3)',
                border: '1px solid rgba(107, 114, 128, 0.5)',
                borderRadius: '8px',
                color: '#e0f2fe',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!value.trim()}
              style={{
                padding: '10px 20px',
                background: value.trim() 
                  ? 'rgba(59, 130, 246, 0.3)' 
                  : 'rgba(107, 114, 128, 0.2)',
                border: `1px solid ${value.trim() 
                  ? 'rgba(59, 130, 246, 0.5)' 
                  : 'rgba(107, 114, 128, 0.3)'}`,
                borderRadius: '8px',
                color: value.trim() ? '#93c5fd' : 'rgba(156, 163, 175, 0.6)',
                cursor: value.trim() ? 'pointer' : 'not-allowed',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseOver={(e) => {
                if (value.trim()) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (value.trim()) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              Save
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '12px',
          fontSize: '9px',
          color: 'rgba(148, 163, 184, 0.7)',
          textAlign: 'center'
        }}>
          Press ESC to cancel
        </div>
      </div>
    </div>
  );
};