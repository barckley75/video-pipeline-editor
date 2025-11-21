// src/components/layout/WorkflowMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PRESET_WORKFLOWS, type Workflow } from '../../types/workflows';
import { THEME_COLORS, FONT_FAMILY } from '../../constants/nodeTypes';

interface WorkflowMenuProps {
  onLoadWorkflow: (workflow: Workflow) => void;
  customWorkflows: Workflow[];
  onSaveCustom: () => void;
  onDeleteCustom: (id: string) => void;
}

export const WorkflowMenu: React.FC<WorkflowMenuProps> = ({
  onLoadWorkflow,
  customWorkflows,
  onSaveCustom,
  onDeleteCustom
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div 
        ref={menuRef}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}>

        {/* Trigger Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
            padding: '10px 20px',
            background: THEME_COLORS.EXECUTE_BUTTON.IDLE,
            color: 'rgb(254, 202, 202',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 12px rgba(59, 130, 246, 0.2)',
            fontFamily: FONT_FAMILY,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
            }}
            onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
            }}
            onMouseOut={(e) => {
            e.currentTarget.style.background = THEME_COLORS.EXECUTE_BUTTON.IDLE;
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(59, 130, 246, 0.2)';
            }}
        >
            <span>[&gt; my workflows]</span>
            <span style={{ 
            fontSize: '10px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
            }}>
            ▼
            </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                minWidth: '280px',
                background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.2)',
                zIndex: 10000,
                overflow: 'hidden',
                fontFamily: FONT_FAMILY
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
            >
            {/* Preset Workflows Section */}
            <div style={{
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <div style={{
                padding: '12px 16px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#60a5fa',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                background: 'rgba(59, 130, 246, 0.1)'
                }}>
                📌 Preset Workflows
                </div>
                {PRESET_WORKFLOWS.map((workflow) => (
                <button
                    key={workflow.id}
                    onClick={() => {
                    onLoadWorkflow(workflow);
                    setIsOpen(false);
                    }}
                    style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
                    color: '#e0f2fe',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                    }}
                    onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.color = '#93c5fd';
                    }}
                    onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#e0f2fe';
                    }}
                >
                    <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                    {workflow.name}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.7, lineHeight: '1.3' }}>
                    {workflow.description}
                    </div>
                </button>
                ))}
            </div>

            {/* Custom Workflows Section */}
            <div>
                <div style={{
                padding: '12px 16px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#34d399',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                background: 'rgba(16, 185, 129, 0.1)'
                }}>
                ⚙️ Custom Workflows
                </div>

                {customWorkflows.length === 0 ? (
                <div style={{
                    padding: '16px',
                    fontSize: '9px',
                    color: 'rgba(224, 242, 254, 0.5)',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    No custom workflows yet
                </div>
                ) : (
                customWorkflows.map((workflow) => (
                    <div
                    key={workflow.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
                        transition: 'background 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                    >
                    <button
                        onClick={() => {
                        onLoadWorkflow(workflow);
                        setIsOpen(false);
                        }}
                        style={{
                        flex: 1,
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#e0f2fe',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        fontSize: '11px'
                        }}
                    >
                        {workflow.name}
                    </button>
                    <button
                        onClick={() => onDeleteCustom(workflow.id)}
                        style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                        e.currentTarget.style.color = '#f87171';
                        }}
                        onMouseOut={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        }}
                    >
                        ×
                    </button>
                    </div>
                ))
                )}

                {/* Save Current Button */}
                <button
                onClick={() => {
                    onSaveCustom();
                    setIsOpen(false);
                }}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: 'none',
                    borderTop: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                }}
                >
                + Save Current Workflow
                </button>
            </div>
            </div>
        )}
    </div>
  );
};