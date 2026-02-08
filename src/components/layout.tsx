import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Prompt Builder</h1>
          </div>
          <nav className="flex items-center gap-4">
            <button className="text-sm font-medium hover:underline">Home</button>
            <button className="text-sm font-medium hover:underline">Templates</button>
            <button className="text-sm font-medium hover:underline">History</button>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Prompt Builder. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;