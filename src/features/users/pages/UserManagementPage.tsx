import { useMutation, useQuery } from '@tanstack/react-query';
import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { queryClient } from '@/shared/api/queryClient';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { deleteUser, getUser, listUsers, restoreUser, updateUser, updateUserPassword } from '../api/usersApi';
import { EditUserDialog, PasswordDialog } from '../components/UserDialogs';
import { UserTable } from '../components/UserTable';
import type { ManageableRole, UserDto, UserSummaryDto } from '../types';
import type { PasswordValues, UserEditValues } from '../schemas';

const roles: { value: ManageableRole; label: string }[] = [
  { value: 'explorer', label: 'Explorers' },
  { value: 'vendor', label: 'Vendors' },
  { value: 'admin', label: 'Admins' },
];

export function UserManagementPage() {
  const [role, setRole] = useState<ManageableRole>('explorer');
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [selected, setSelected] = useState<UserSummaryDto | null>(null);
  const [dialog, setDialog] = useState<'edit' | 'password' | null>(null);

  const usersQuery = useQuery({
    queryKey: ['users', role, page, includeDeleted],
    queryFn: () => listUsers(role, page, 10, includeDeleted),
  });

  const detailQuery = useQuery({
    queryKey: ['users', role, selected?.id],
    queryFn: () => getUser(role, selected?.id ?? ''),
    enabled: dialog === 'edit' && Boolean(selected?.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const updateMutation = useMutation({
    mutationFn: (values: UserEditValues) => updateUser(role, { ...(detailQuery.data as UserDto), ...values } as UserDto),
    onSuccess: () => {
      setDialog(null);
      void invalidate();
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordValues) => updateUserPassword(role, selected?.id ?? '', values),
    onSuccess: () => setDialog(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (user: UserSummaryDto) => deleteUser(role, user.id),
    onSuccess: () => void invalidate(),
  });

  const restoreMutation = useMutation({
    mutationFn: (user: UserSummaryDto) => restoreUser(role, user.id),
    onSuccess: () => void invalidate(),
  });

  function changeRole(nextRole: string) {
    setRole(nextRole as ManageableRole);
    setPage(1);
    setSelected(null);
    setDialog(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="User management"
        description="Role-specific user records, soft deletion, restore flow, and profile maintenance."
        actions={
          <Button type="button" variant={includeDeleted ? 'secondary' : 'ghost'} onClick={() => setIncludeDeleted((value) => !value)}>
            {includeDeleted ? 'Viewing deleted' : 'Include deleted'}
          </Button>
        }
      />

      <Tabs.Root value={role} onValueChange={changeRole}>
        <Tabs.List className="mb-4 flex flex-wrap gap-2">
          {roles.map((item) => (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              className={cn(
                'focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant',
                role === item.value && 'bg-primary text-white',
              )}
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {usersQuery.isLoading ? <LoadingState /> : null}
      {usersQuery.isError ? <ErrorState onRetry={() => void usersQuery.refetch()} /> : null}
      {usersQuery.data && usersQuery.data.items.length === 0 ? (
        <EmptyState title="No users found" description="This role has no records in the selected view." />
      ) : null}
      {usersQuery.data && usersQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <UserTable
            users={usersQuery.data.items}
            includeDeleted={includeDeleted}
            onEdit={(user) => {
              setSelected(user);
              setDialog('edit');
            }}
            onPassword={(user) => {
              setSelected(user);
              setDialog('password');
            }}
            onDelete={(user) => void deleteMutation.mutate(user)}
            onRestore={(user) => void restoreMutation.mutate(user)}
          />
          <PaginationBar page={page} result={usersQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      <EditUserDialog
        open={dialog === 'edit'}
        user={detailQuery.data}
        isLoading={detailQuery.isLoading}
        onOpenChange={(open) => setDialog(open ? 'edit' : null)}
        onSubmit={(values) => updateMutation.mutateAsync(values)}
      />
      <PasswordDialog
        open={dialog === 'password'}
        user={selected ?? undefined}
        onOpenChange={(open) => setDialog(open ? 'password' : null)}
        onSubmit={(values) => passwordMutation.mutateAsync(values)}
      />
    </>
  );
}
