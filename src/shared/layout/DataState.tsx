import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';

export function LoadingState({ label = 'Loading records...' }: { label?: string }) {
  return <Panel className="p-8 text-sm text-on-surface-variant">{label}</Panel>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Panel className="grid place-items-center p-10 text-center">
      <Inbox className="text-on-surface-variant" size={28} />
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-on-surface-variant">{description}</p>
    </Panel>
  );
}

export function ErrorState({ title = 'Could not load data', onRetry }: { title?: string; onRetry?: () => void }) {
  return (
    <Panel className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <AlertCircle className="text-red-700" size={20} />
        <p className="text-sm font-medium">{title}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Panel>
  );
}
