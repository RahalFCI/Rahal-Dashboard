import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { useToastStore } from '@/shared/stores/toastStore';
import { deleteCheckIn, getCheckIn, updateCheckIn, type ValidationStatus } from '../api/checkInApi';

interface CheckInDetailDialogProps {
  explorerId: string | null;
  explorerName?: string;
  placeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusBadgeClass: Record<string, string> = {
  Verified: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

export function CheckInDetailDialog({ explorerId, explorerName, placeId, open, onOpenChange }: CheckInDetailDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const checkInQuery = useQuery({
    queryKey: ['check-in', explorerId, placeId],
    queryFn: () => getCheckIn(explorerId!, placeId!),
    enabled: open && Boolean(explorerId) && Boolean(placeId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCheckIn(explorerId!, placeId!),
    onSuccess: () => {
      setConfirmDelete(false);
      void queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      useToastStore.getState().add({ message: 'Check-in deleted.', variant: 'success' });
      onOpenChange(false);
    },
    onError: (error) => {
      setConfirmDelete(false);
      if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (validationStatus: ValidationStatus) => updateCheckIn(explorerId!, placeId!, { validationStatus }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      void queryClient.invalidateQueries({ queryKey: ['check-in', explorerId, placeId] });
      useToastStore.getState().add({ message: 'Check-in status updated.', variant: 'success' });
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Check-in details">
      {checkInQuery.isLoading ? <LoadingState label="Loading check-in..." /> : null}
      {checkInQuery.isError ? <ErrorState onRetry={() => void checkInQuery.refetch()} /> : null}
      {checkInQuery.data ? (
        <Panel className="grid gap-3 p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Place</p>
            <p className="mt-1 font-medium text-on-surface">{checkInQuery.data.placeName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Explorer</p>
            <p className="mt-1 font-medium text-on-surface" title={checkInQuery.data.explorerId}>
              {explorerName || 'Unknown explorer'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Status</p>
            <Badge className={`mt-1 ${statusBadgeClass[checkInQuery.data.validationStatusName] ?? ''}`}>
              {checkInQuery.data.validationStatusName}
            </Badge>
          </div>
          {checkInQuery.data.validationStatusName === 'Pending' ? (
            <div className="flex gap-2 border-t border-outline/40 pt-3">
              <Button
                type="button"
                variant="ghost"
                className="text-green-600 hover:text-green-600"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate('Verified')}
              >
                <CheckCircle size={16} className="mr-2" />
                Verify
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-error hover:text-error"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate('Failed')}
              >
                <XCircle size={16} className="mr-2" />
                Fail
              </Button>
            </div>
          ) : null}
          <div className="flex justify-end border-t border-outline/40 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete check-in"
              disabled={deleteMutation.isPending}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </Panel>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this check-in?"
        description="This can be undone."
        isConfirming={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />
    </Dialog>
  );
}
