import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { PagedResult } from '@/shared/api/types';

interface PaginationBarProps<T> {
  page: number;
  result?: PagedResult<T>;
  onPageChange: (page: number) => void;
}

export function PaginationBar<T>({ page, result, onPageChange }: PaginationBarProps<T>) {
  return (
    <div className="flex items-center justify-between border-t border-outline/50 px-4 py-3 text-sm text-on-surface-variant">
      <span>
        Page {result?.page ?? page} of {result?.totalPages || 1} · {result?.totalCount ?? 0} records
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!result?.hasPreviousPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!result?.hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
