// src/components/NodeUI.tsx

/**
 * 🎨 NODE UI COMPONENTS LIBRARY
 * 
 * Reusable styled input components with consistent cyberpunk aesthetic.
 * Provides form controls for all node configuration UIs.
 * 
 * COMPONENTS EXPORTED:
 * - NodeLabel: Styled label for form fields
 * - NodeInput: Text/number input with focus effects
 * - NodeSelect: Standard dropdown (native)
 * - NodeGlassySelect: Custom glassy dropdown with animations
 * - NodeButton: Interactive button with hover effects
 * - NodeInfo: Info display boxes
 * - NodeField: Form field wrapper
 * - VideoPreview: Video preview with play/stop controls
 * 
 * USED BY:
 * ├── All nodes in nodes/ directory for UI controls
 * └── Any component needing consistent styled inputs
 * 
 * STYLING:
 * - Cyan/teal theme with glowing effects
 * - Focus/hover states with smooth transitions
 * - Backdrop blur and glassmorphism
 */

import React, { useState, useRef, useEffect } from 'react';

const baseStyles = {
  label: {
    display: 'block' as const,
    fontSize: '9px',
    marginBottom: '6px',
    color: 'rgba(0, 255, 255, 0.8)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.2px',
    fontFamily: 'inherit',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.3)'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '10px',
    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '8px',
    color: 'rgba(224, 242, 254, 0.95)',
    backdropFilter: 'blur(12px)',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 255, 255, 0.1)',
    transition: 'all 0.3s ease'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '10px',
    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '8px',
    color: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 255, 255, 0.1)',
    transition: 'all 0.3s ease'
  },
  button: {
    padding: '8px 14px',
    fontSize: '10px',
    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0.05) 100%)',
    border: '1px solid rgba(0, 255, 255, 0.4)',
    borderRadius: '8px',
    color: '#e0f2fe',
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(0, 255, 255, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
    textShadow: '0 0 6px rgba(0, 255, 255, 0.5)'
  },
  info: {
    fontSize: '9px',
    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
    border: '1px solid rgba(0, 255, 255, 0.25)',
    padding: '8px 10px',
    borderRadius: '8px',
    color: 'rgba(0, 255, 255, 0.9)',
    textAlign: 'center' as const,
    letterSpacing: '0.8px',
    fontFamily: 'inherit',
    backdropFilter: 'blur(8px)',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 0 6px rgba(0, 255, 255, 0.1)'
  },
  field: {
    marginBottom: '12px'
  }
};

// Custom Glassy Dropdown Component
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setSelectedLabel(selected ? selected.label : placeholder);
  }, [value, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <div
        onClick={(e) => {
          e.stopPropagation(); // Prevent node selection
          setIsOpen(!isOpen);
        }}
        style={{
          ...baseStyles.select,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          position: 'relative',
          minWidth: '120px',
          maxWidth: '90%'
        }}
      >
        <span>{selectedLabel}</span>
        <span style={{ 
          fontSize: '12px', 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          color: 'rgba(0, 255, 255, 0.7)'
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          minWidth: '160px',
          maxWidth: '220px',
          width: 'max-content',
          background: 'linear-gradient(135deg, rgba(0, 50, 100, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 255, 0.4)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          marginTop: '2px'
        }}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={(e) => {
                e.stopPropagation(); // Prevent node selection
                handleSelect(option.value);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '10px',
                color: value === option.value ? 'rgba(0, 255, 255, 1)' : 'rgba(224, 242, 254, 0.9)',
                background: value === option.value 
                  ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 255, 255, 0.1) 100%)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
                fontFamily: 'inherit',
                textShadow: value === option.value ? '0 0 8px rgba(0, 255, 255, 0.6)' : 'none',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 100%)';
                  e.currentTarget.style.color = 'rgba(0, 255, 255, 0.9)';
                  e.currentTarget.style.textShadow = '0 0 6px rgba(0, 255, 255, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(224, 242, 254, 0.9)';
                  e.currentTarget.style.textShadow = 'none';
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NodeLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={baseStyles.label}>{children}</label>
);

export const NodeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.6)';
    e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 12px rgba(0, 255, 255, 0.3)';
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
    e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 255, 255, 0.1)';
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)';
  };

  return (
    <input 
      style={baseStyles.input} 
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props} 
    />
  );
};

// Regular select for simple cases
export const NodeSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => {
  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.6)';
    e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 12px rgba(0, 255, 255, 0.3)';
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
    e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 255, 255, 0.1)';
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)';
  };

  return (
    <select 
      style={baseStyles.select} 
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </select>
  );
};

// New Glassy Select component
export const NodeGlassySelect: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}> = ({ value, onChange, children }) => {
  // Convert children to options array
  const options = React.Children.toArray(children).map((child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children
      };
    }
    return null;
  }).filter(Boolean) as Array<{ value: string; label: string }>;

  const handleCustomChange = (newValue: string) => {
    // Create a synthetic event to match the existing onChange signature
    const syntheticEvent = {
      target: { value: newValue },
      currentTarget: { value: newValue }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  return (
    <CustomSelect
      value={value}
      onChange={handleCustomChange}
      options={options}
    />
  );
};

export const NodeButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.25) 0%, rgba(0, 255, 255, 0.1) 100%)';
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.6)';
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)';
    e.currentTarget.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.8)';
  };
  
  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0.05) 100%)';
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 255, 255, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.textShadow = '0 0 6px rgba(0, 255, 255, 0.5)';
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.7)';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 255, 255, 0.3), 0 4px 16px rgba(0, 255, 255, 0.2)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 255, 255, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)';
  };

  return (
    <button 
      style={baseStyles.button}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </button>
  );
};

export const NodeInfo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={baseStyles.info}>{children}</div>
);

export const NodeField: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={baseStyles.field}>{children}</div>
);

export const VideoPreview: React.FC<{ 
  videoUrl?: string | null; 
  isPlaying?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  error?: string | null;
}> = ({ videoUrl, isPlaying, onPlay, onStop, isLoading, error }) => {
  return (
    <div>
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '2px dashed rgba(168, 85, 247, 0.4)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        {videoUrl ? (
          <div style={{ position: 'relative' }}>
            <video
              src={videoUrl}
              style={{ width: '100%', height: '60px', objectFit: 'cover' }}
              loop
              muted
              controls={false}
            />
            {isLoading && (
              <div style={{
                position: 'absolute',
                inset: '0',
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px'
              }}>
                loading...
              </div>
            )}
            {error && (
              <div style={{
                position: 'absolute',
                inset: '0',
                background: 'rgba(239, 68, 68, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                padding: '4px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'rgba(224, 242, 254, 0.6)'
          }}>
            $ no_preview_available
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <NodeButton 
          onClick={onPlay} 
          disabled={!videoUrl || isLoading}
          style={{ flex: 1, fontSize: '10px' }}
        >
          {isPlaying ? '[pause]' : '[play]'}
        </NodeButton>
        <NodeButton 
          onClick={onStop} 
          disabled={!videoUrl || isLoading}
          style={{ flex: 1, fontSize: '10px' }}
        >
          [stop]
        </NodeButton>
      </div>
    </div>
  );
};