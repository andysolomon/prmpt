import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Library', to: '/library' },
    { label: 'Prompts', to: '/library/prompts' },
    { label: 'Anatomies', to: '/library/anatomies' },
    { label: 'Prompt Builder', to: '/create/prompt' },
    { label: 'Anatomy', to: '/anatomy' },
    { label: 'Admin', to: '/admin/storage' },
    { label: 'UI Builder', to: '/create/ui' },
    { label: 'Skills', to: '/library/skills' },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
    );

  return (
    <div className={cn('dark min-h-screen bg-background text-foreground', className)}>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-800 px-4 py-5">
              <h1 className="text-lg font-semibold text-zinc-100">Prompt Builder</h1>
              <p className="text-xs text-zinc-400">Navigation</p>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {navItems.map((item) => (
                <NavLink key={item.to} className={navLinkClass} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
              <button
                aria-controls="mobile-sidebar"
                aria-expanded={isSidebarOpen}
                className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                type="button"
              >
                Menu
              </button>
              <p className="text-sm text-zinc-300">Prompt Builder Workspace</p>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6">{children}</main>

          <footer className="border-t border-zinc-800 py-4">
            <div className="mx-auto max-w-[1400px] px-4 text-center text-sm text-zinc-400">
              © {new Date().getFullYear()} Prompt Builder. All rights reserved.
            </div>
          </footer>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation drawer"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          />
          <aside
            className="absolute left-0 top-0 h-full w-72 border-r border-zinc-800 bg-zinc-950 p-3"
            id="mobile-sidebar"
          >
            <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">Navigation</h2>
              <button
                className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
                onClick={() => setIsSidebarOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} className={navLinkClass} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Layout;
