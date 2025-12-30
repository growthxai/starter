import Flash from '@/components/flash';
import { Toaster } from '@/components/ui/toaster';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';

interface FullscreenLayoutProps {
  children: React.ReactNode;
  flash: {
    notice?: string;
    error?: string;
  };
  pageTitle?: string;
}

export default function FullscreenLayout({ children, flash, pageTitle }: FullscreenLayoutProps) {
  const { props } = usePage<{ pageTitle?: string }>();
  const title = pageTitle || props.pageTitle || 'Starter';

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen">
        <Flash {...flash} />
        <Toaster />
        {children}
      </div>
    </>
  );
}
