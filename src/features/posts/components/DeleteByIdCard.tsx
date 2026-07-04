import { useMutation } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { useToastStore } from '@/shared/stores/toastStore';

interface DeleteByIdCardProps {
  icon: ReactNode;
  heading: string;
  idInputId: string;
  idLabel: string;
  deleteFn: (id: string) => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
  successMessage: (id: string) => string;
  submitLabel: string;
}

export function DeleteByIdCard({
  icon,
  heading,
  idInputId,
  idLabel,
  deleteFn,
  confirmTitle,
  confirmDescription,
  successMessage,
  submitLabel,
}: DeleteByIdCardProps) {
  const [id, setId] = useState('');
  const [formatError, setFormatError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (targetId: string) => deleteFn(targetId),
    onSuccess: (_data, targetId) => {
      useToastStore.getState().add({ message: successMessage(targetId), variant: 'success' });
      setConfirmOpen(false);
      setId('');
    },
    // 404/403/network errors are already surfaced as a toast globally by
    // apiClientNoContent (see shared/api/client.ts); just close the confirm
    // dialog so it doesn't sit there spinning.
    onError: () => setConfirmOpen(false),
  });

  function handleDeleteClick() {
    const parsed = z.string().uuid().safeParse(id.trim());
    if (!parsed.success) {
      setFormatError(`Enter a valid ${idLabel.toLowerCase()} (GUID).`);
      return;
    }
    setFormatError(null);
    setConfirmOpen(true);
  }

  return (
    <>
      <Panel className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-semibold text-on-surface">{heading}</p>
        </div>

        <div>
          <Label htmlFor={idInputId}>{idLabel}</Label>
          <Input
            id={idInputId}
            placeholder="00000000-0000-0000-0000-000000000000"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setFormatError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDeleteClick();
            }}
            className="font-mono"
          />
          {formatError ? <p className="mt-1.5 text-sm text-error">{formatError}</p> : null}
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="danger" onClick={handleDeleteClick} disabled={!id.trim()}>
            <Trash2 size={15} />
            {submitLabel}
          </Button>
        </div>
      </Panel>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmOpen(false);
        }}
        title={confirmTitle}
        description={confirmDescription}
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(id.trim())}
          >
            {deleteMutation.isPending ? 'Deleting…' : submitLabel}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
