import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Play, Library, Clock, Heart, FolderOpen, ListMusic,
  Settings, ChevronLeft, ChevronRight, Plus, Film,
  Music, Image, FileText, Search, Layers,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { getFileSystem } from '../../platform';
import { cn } from '../../lib/cn';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNav: NavItem[] = [
  { label: 'Library', to: '/library', icon: Library },
  { label: 'Recent', to: '/recent', icon: Clock },
  { label: 'Favorites', to: '/favorites', icon: Heart },
  { label: 'Collections', to: '/collections', icon: Layers },
  { label: 'Playlists', to: '/playlists', icon: ListMusic },
];

const categoryNav: NavItem[] = [
  { label: 'Videos', to: '/library?filter=video', icon: Film },
  { label: 'Music', to: '/library?filter=audio', icon: Music },
  { label: 'Images', to: '/library?filter=image', icon: Image },
  { label: 'Documents', to: '/library?filter=document', icon: FileText },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const collapseSidebar = useUIStore((s) => s.collapseSidebar);
  const addNotification = useUIStore((s) => s.addNotification);
  const addFiles = useLibraryStore((s) => s.addFiles);
  const collections = useLibraryStore((s) => s.collections);
  const navigate = useNavigate();

  const handleOpenFiles = async () => {
    try {
      const fs = getFileSystem();
      const files = await fs.openFile({ multiple: true });
      if (files.length > 0) {
        addFiles(files);
        if (files.length === 1) {
          navigate(`/player/${files[0].id}`, { state: { file: files[0] } });
        } else {
          navigate('/library');
          addNotification('success', `Added ${files.length} files to library`);
        }
      }
    } catch {
      addNotification('error', 'Failed to open files');
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-surface-900 border-r border-surface-800 transition-all duration-250 select-none',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-surface-800',
        collapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-900/50">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-semibold text-white text-sm tracking-wide">Beyond</span>
            <span className="font-light text-primary-400 text-sm"> Player</span>
          </div>
        )}
      </div>

      {/* Open File Button */}
      <div className={cn('px-3 py-3', collapsed && 'flex justify-center')}>
        <button
          onClick={handleOpenFiles}
          className={cn(
            'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium',
            'bg-primary-600 hover:bg-primary-500 text-white transition-colors duration-150',
            'shadow-md shadow-primary-900/30',
            collapsed && 'w-10 h-10 px-0 justify-center'
          )}
          title="Open File"
        >
          <FolderOpen className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Open File</span>}
        </button>
      </div>

      {/* Scroll area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
        {/* Main nav */}
        <div className="px-2 mb-2">
          {mainNav.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        <Divider collapsed={collapsed} label="Browse" />

        <div className="px-2 mb-2">
          {categoryNav.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <>
            <Divider collapsed={collapsed} label="Collections" />
            <div className="px-2 mb-2">
              {collections.slice(0, 5).map((col) => (
                <SidebarLink
                  key={col.id}
                  item={{ label: col.name, to: `/collections/${col.id}`, icon: Layers }}
                  collapsed={collapsed}
                  accent={col.color}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className={cn('px-2 py-3 border-t border-surface-800 space-y-1', collapsed && 'flex flex-col items-center')}>
        <SidebarLink item={{ label: 'Search', to: '/search', icon: Search }} collapsed={collapsed} />
        <SidebarLink item={{ label: 'Settings', to: '/settings', icon: Settings }} collapsed={collapsed} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => collapseSidebar(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center hover:bg-surface-600 transition-colors z-10 shadow-md"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-surface-300" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-surface-300" />
        )}
      </button>
    </aside>
  );
}

function SidebarLink({
  item,
  collapsed,
  accent,
}: {
  item: NavItem;
  collapsed: boolean;
  accent?: string;
}) {
  return (
    <NavLink
      to={item.to}
      title={item.label}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
          collapsed ? 'justify-center w-10 h-10 mx-auto' : 'w-full',
          isActive
            ? 'bg-surface-750 text-white font-medium'
            : 'text-surface-400 hover:text-white hover:bg-surface-800'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              'w-4 h-4 flex-shrink-0 transition-colors',
              isActive ? 'text-primary-400' : 'group-hover:text-primary-400'
            )}
            style={accent ? { color: accent } : undefined}
          />
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}
          {!collapsed && item.badge !== undefined && item.badge > 0 && (
            <span className="ml-auto text-2xs bg-primary-600 text-white rounded-full px-1.5 py-0.5 font-medium">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function Divider({ collapsed, label }: { collapsed: boolean; label: string }) {
  if (collapsed) {
    return <div className="my-2 mx-3 border-t border-surface-800" />;
  }
  return (
    <div className="flex items-center gap-2 px-4 py-1 mb-1">
      <span className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
