import Flash from '@/components/flash';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';

interface User {
  name: string;
  email: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  currentUser?: User;
  flash: {
    notice?: string;
    error?: string;
  };
  pageTitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  sidebarOpen?: boolean;
}

export default function WorkspaceLayout({
  children,
  currentUser,
  flash,
  pageTitle,
  breadcrumbs,
  sidebarOpen,
}: WorkspaceLayoutProps) {
  const { props } = usePage<{ pageTitle?: string; breadcrumbs?: BreadcrumbItem[] }>();
  const title = pageTitle || props.pageTitle || 'Starter';
  const crumbs = breadcrumbs || props.breadcrumbs || [];

  return (
    <>
      <Head title={title} />
      <TooltipProvider>
        <SidebarProvider defaultOpen={sidebarOpen ?? true}>
          <WorkspaceSidebar currentUser={currentUser} />

          <SidebarInset className="min-w-0">
            <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-4 backdrop-blur">
              <SidebarTrigger className="-ml-1" />

              {crumbs.length > 0 && (
                <>
                  <div className="bg-border h-4 w-px" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      {crumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {index === crumbs.length - 1 || !crumb.href ? (
                              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link href={crumb.href}>{crumb.label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </>
              )}
            </header>

            <main className="flex-1 p-4">
              <Flash {...flash} />
              <Toaster />
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </>
  );
}
