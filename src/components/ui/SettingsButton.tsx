// src/components/ui/SettingsButton.tsx

/**
 * ⚙️ FLOATING SETTINGS BUTTON
 * 
 * A fixed position button that opens the FFmpeg settings dialog.
 * Positioned in the top-right corner of the viewport.
 * 
 * FEATURES:
 * - Always visible overlay
 * - Hover effects
 * - Tooltip on hover
 */

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-40 bg-gray-800 hover:bg-gray-700 border-2 border-cyan-500 rounded-lg p-3 shadow-lg transition-all hover:scale-110 group"
      title="FFmpeg Settings (Ctrl/Cmd + ,)"
    >
      <svg
        className="w-6 h-6 text-cyan-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      
      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-gray-900 border border-cyan-500 rounded text-cyan-400 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        FFmpeg Settings
      </div>
    </button>
  );
}