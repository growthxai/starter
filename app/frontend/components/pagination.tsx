import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { PaginationData } from '@/types/pagination';
import { Button, buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  Omit<React.ComponentProps<typeof Link>, 'size'>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  href,
  ...props
}: PaginationLinkProps) => {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className
      )}
      {...props}
    />
  );
};

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
};

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
};

interface PaginationProps {
  pagination: PaginationData;
  /**
   * Base path for pagination URLs (e.g., '/brands')
   * This should be a function from js-routes like brands_path
   */
  pathBuilder: (params: Record<string, unknown>) => string;
  /**
   * Additional query parameters to maintain across page changes
   * (e.g., { category: 'tech', sort: 'name' })
   */
  queryParams?: Record<string, unknown>;
  /**
   * Custom label for items (e.g., "brands", "projects")
   * @default "items"
   */
  itemLabel?: string;
  /**
   * Whether to preserve the scroll position when navigating to a new page
   * @default false
   */
  preserveScroll?: boolean;
  /**
   * Whether to preserve the state when navigating to a new page
   * @default false
   */
  preserveState?: boolean;
}

const Pagination = ({
  pagination,
  pathBuilder,
  queryParams = {},
  preserveScroll = false,
  preserveState = false,
}: PaginationProps) => {
  // Don't render if there's only one page
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-center">
      <PaginationRoot>
        <PaginationContent>
          {pagination.prevPage && (
            <PaginationItem>
              <PaginationPrevious
                href={pathBuilder({ ...queryParams, page: pagination.prevPage })}
                preserveScroll={preserveScroll}
                preserveState={preserveState}
              />
            </PaginationItem>
          )}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            const showPage =
              page === 1 ||
              page === pagination.totalPages ||
              (page >= pagination.page - 1 && page <= pagination.page + 1);

            if (!showPage) {
              // Show ellipsis if there's a gap
              if (page === pagination.page - 2 || page === pagination.page + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href={pathBuilder({ ...queryParams, page })}
                  isActive={page === pagination.page}
                  preserveScroll={preserveScroll}
                  preserveState={preserveState}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          {pagination.nextPage && (
            <PaginationItem>
              <PaginationNext
                href={pathBuilder({ ...queryParams, page: pagination.nextPage })}
                preserveScroll={preserveScroll}
                preserveState={preserveState}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </PaginationRoot>
    </div>
  );
};

export default Pagination;
