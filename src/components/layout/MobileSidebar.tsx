import React from 'react';
import { Sidebar } from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Slide-over Drawer */}
      <div className="relative flex-1 max-w-xs w-full bg-navy-900 shadow-2xl animate-in slide-in-from-left duration-200">
        <Sidebar isCollapsed={false} onToggleCollapse={() => {}} onCloseMobile={onClose} />
      </div>
    </div>
  );
};
