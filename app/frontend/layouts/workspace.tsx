import Flash from '@/components/flash';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import type { Breadcrumb } from '@/types/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRightIcon } from 'lucide-react';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  flash: {
    notice?: string;
    error?: string;
  };
  pageTitle?: string;
  breadcrumbs?: Breadcrumb[];
  sidebarOpen?: boolean;
}

export default function WorkspaceLayout({
  children,
  flash,
  pageTitle,
  breadcrumbs,
  sidebarOpen,
}: WorkspaceLayoutProps) {
  const { props } = usePage<{ pageTitle?: string; breadcrumbs?: Breadcrumb[] }>();
  const title = pageTitle || props.pageTitle || 'Starter';
  const crumbs = breadcrumbs || props.breadcrumbs || [];

  return (
    <>
      <Head title={title} />
      <TooltipProvider>
        <SidebarProvider defaultOpen={sidebarOpen ?? true}>
          <WorkspaceSidebar />

          <SidebarInset className="min-w-0">
            <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-4 backdrop-blur">
              <SidebarTrigger className="-ml-1" />

              {crumbs.length > 0 && (
                <>
                  <div className="bg-border h-4 w-px" />
                  <nav className="flex items-center space-x-1 text-sm">
                    {crumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && (
                          <ChevronRightIcon className="text-muted-foreground mx-1 h-4 w-4" />
                        )}
                        {crumb.href ? (
                          <Link
                            href={crumb.href}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {crumb.text}
                          </Link>
                        ) : (
                          <span className="text-foreground font-medium">{crumb.text}</span>
                        )}
                      </div>
                    ))}
                  </nav>
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
