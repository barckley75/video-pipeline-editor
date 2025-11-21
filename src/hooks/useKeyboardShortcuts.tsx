// File: hooks/useKeyboardShortcuts.tsx

/**
 * ⌨️ KEYBOARD SHORTCUT MANAGER
 * 
 * Global keyboard event handler for application shortcuts.
 * Prevents shortcuts when typing in inputs.
 * 
 * COMMUNICATES WITH:
 * ├── App.tsx - Receives menu state setters
 * ├── hooks/useCopyPaste.tsx - Triggers copy/paste operations
 * └── constants/nodeTypes.tsx - Shortcut key definitions
 * 
 * SHORTCUTS:
 * - TAB: Open node menu at center
 * - ESC: Close node menu
 * - Ctrl/Cmd + C: Copy selection
 * - Ctrl/Cmd + V: Paste selection
 * - Ctrl/Cmd + D: Duplicate selection
 * - Delete/Backspace: Delete selection
 * - Ctrl/Cmd + A: Select all (future)
 * - Ctrl/Cmd + Z: Undo (future)
 * - Ctrl/Cmd + Shift + Z: Redo (future)
 * 
 * FEATURES:
 * - Ignores shortcuts when typing
 * - Cross-platform (Ctrl/Cmd detection)
 * - Event capture phase for priority
 */

import { useEffect } from 'react';
import { KEYBOARD_SHORTCUTS } from '../constants/nodeTypes';
import type { MousePosition } from '../types/pipeline';

interface KeyboardShortcutsProps {
  setMousePosition: (position: MousePosition) => void;
  setShowNodeMenu: (show: boolean) => void;
  copySelection: () => any;
  pasteSelection: (offsetX?: number, offsetY?: number) => any;
  duplicateSelection: () => any;
  deleteSelection: () => any;
  hasClipboardData: () => boolean;
  openSettings?: () => void;
}

/**
 * Enhanced keyboard shortcuts with copy/paste functionality and TAB key menu
 */
export const useKeyboardShortcuts = ({
  setMousePosition,
  setShowNodeMenu,
  copySelection,
  pasteSelection,
  duplicateSelection,
  deleteSelection,
  hasClipboardData,
  openSettings
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      
      // Prevent shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.contentEditable === 'true';
      
      if (isTyping) return;

      console.log('Key pressed:', {
        key: event.key,
        ctrlOrCmd: isCtrlOrCmd,
        shift: isShift,
        code: event.code
      });

      // Open workflow menu (Ctrl/Cmd + W)
      if (isCtrlOrCmd && event.key === 'w') {
        event.preventDefault();
        // You'll need to pass a callback to open the menu
        console.log('[Shortcut] Open workflow menu (Ctrl/Cmd + W)');
        // TODO: Implement workflow menu toggle
        return;
      }

      // Open settings (Ctrl/Cmd + ,)
      if (isCtrlOrCmd && event.key === ',') {
        event.preventDefault();
        console.log('[Shortcut] Open FFmpeg settings (Ctrl/Cmd + ,)');
        openSettings?.();
        return;
      }

      // Copy selection (Ctrl/Cmd + C)
      if (isCtrlOrCmd && event.key === 'c') {
        event.preventDefault();
        const result = copySelection();
        if (result) {
          console.log(`[Shortcut] Copied ${result.nodeCount} nodes, ${result.edgeCount} edges`);
        }
        return;
      }

      // Paste selection (Ctrl/Cmd + V)
      if (isCtrlOrCmd && event.key === 'v') {
        event.preventDefault();
        if (hasClipboardData()) {
          const result = pasteSelection();
          if (result) {
            console.log(`[Shortcut] Pasted ${result.nodeCount} nodes, ${result.edgeCount} edges`);
          }
        } else {
          console.log('[Shortcut] Nothing to paste');
        }
        return;
      }

      // Duplicate selection (Ctrl/Cmd + D)
      if (isCtrlOrCmd && event.key === 'd') {
        event.preventDefault();
        const result = duplicateSelection();
        if (result) {
          console.log(`[Shortcut] Duplicated ${result.nodeCount} nodes, ${result.edgeCount} edges`);
        }
        return;
      }

      // Delete selection (Delete or Backspace)
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        const result = deleteSelection();
        if (result && result.nodeCount > 0) {
          console.log(`[Shortcut] Deleted ${result.nodeCount} nodes, ${result.edgeCount} edges`);
        }
        return;
      }

      // Select All (Ctrl/Cmd + A) - for future implementation
      if (isCtrlOrCmd && event.key === 'a') {
        event.preventDefault();
        console.log('[Shortcut] Select All (not implemented yet)');
        // TODO: Implement select all functionality
        return;
      }

      // TAB key now opens the node menu (replaces right-click functionality)
      if (event.key === 'Tab') {
        event.preventDefault();
        
        // Set mouse position to center of the screen for menu placement
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        setMousePosition({ x: centerX, y: centerY });
        setShowNodeMenu(true);
        
        console.log('[Shortcut] TAB pressed, opening node menu at center:', { x: centerX, y: centerY });
        return;
      }

      // Close node menu (Escape)
      if (event.key === KEYBOARD_SHORTCUTS.CLOSE_NODE_MENU) {
        event.preventDefault();
        setShowNodeMenu(false);
        console.log('[Shortcut] Escape pressed, hiding menu');
        return;
      }

      // Undo (Ctrl/Cmd + Z) - for future implementation
      if (isCtrlOrCmd && event.key === 'z' && !isShift) {
        event.preventDefault();
        console.log('[Shortcut] Undo (not implemented yet)');
        // TODO: Implement undo functionality
        return;
      }

      // Redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
      if (isCtrlOrCmd && ((event.key === 'z' && isShift) || event.key === 'y')) {
        event.preventDefault();
        console.log('[Shortcut] Redo (not implemented yet)');
        // TODO: Implement redo functionality
        return;
      }
    };

    // Use capture phase to handle events before ReactFlow
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    setMousePosition, 
    setShowNodeMenu, 
    copySelection, 
    pasteSelection, 
    duplicateSelection, 
    deleteSelection,
    hasClipboardData,
    openSettings
  ]);
};