import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';
import Flash from '../components/flash';

interface User {
  name: string;
  email: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentUser?: User;
  flash: {
    notice?: string;
    error?: string;
  };
}

export default function ApplicationLayout({ children, flash }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <TooltipProvider>
        <Flash {...flash} />
        <Toaster />
        <main className="min-h-screen min-w-0 flex-1">{children}</main>
      </TooltipProvider>
    </div>
  );
}
