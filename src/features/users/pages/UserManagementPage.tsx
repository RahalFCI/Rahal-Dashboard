import { useMutation, useQuery } from '@tanstack/react-query';
import * as Tabs from '@radix-ui/react-tabs';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paginateClientSide } from '@/features/search/lib/clientSearch';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { queryClient } from '@/shared/api/queryClient';
import { ApiError } from '@/shared/api/errors';
import { useToastStore } from '@/shared/stores/toastStore';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { createUser, deleteUser, getUser, listUsers, permanentDeleteSelf, restoreUser, updateUser, updateUserPassword } from '../api/usersApi';
import { CreateUserDialog, EditUserDialog, PasswordDialog } from '../components/UserDialogs';
import { UserTable } from '../components/UserTable';
import type { ManageableRole, UserDto, UserSummaryDto } from '../types';
import type { CreateUserValues, PasswordValues, UserEditValues } from '../schemas';

const roles: { value: ManageableRole; label: string }[] = [
  { value: 'explorer', label: 'Explorers' },
  { value: 'vendor', label: 'Vendors' },
  { value: 'admin', label: 'Admins' },
];

const FETCH_ALL_PAGE_SIZE = 500;

export function UserManagementPage() {
  const navigate = useNavigate();
  const { user: currentUser, clearSession } = useAuthStore();

  const [role, setRole] = useState<ManageableRole>('explorer');
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [selected, setSelected] = useState<UserSummaryDto | null>(null);
  const [dialog, setDialog] = useState<'create' | 'edit' | 'password' | null>(null);
  const [confirmSelfDelete, setConfirmSelfDelete] = useState(false);

  // Normal (active-only) view: fetch all at once and paginate client-side.
  // GET /User returns every role mixed together — the backend's /explorers,
  // /vendors, /admins routes all share the same unfiltered handler body, so
  // role filtering only happens in filterRolePage() on the frontend. Fetching
  // just page N and filtering that page produces empty results whenever the
  // requested role's records don't fall in that slice (e.g. page 1 is all
  // explorers → vendors appear empty). Pulling 500 at once and re-paginating
  // the filtered set client-side fixes this.
  const allActiveUsersQuery = useQuery({
    queryKey: ['users', role, 'all-active'],
    queryFn: () => listUsers(role, 1, FETCH_ALL_PAGE_SIZE, false),
    enabled: !includeDeleted,
  });

  const activeResult = useMemo(
    () => paginateClientSide(allActiveUsersQuery.data?.items ?? [], page, 10),
    [allActiveUsersQuery.data, page],
  );

  // "Include deleted" view: the *-include-deleted endpoints return active and
  // deleted users mixed together with no isDeleted flag on either side, so
  // there's no way to tell them apart - or to show deleted-only - from that
  // response alone. Fetch everything from both endpoints once, cross-reference
  // by id to find the ones that are actually deleted, then paginate that
  // deleted-only set client-side so a restored row drops out of view (and out
  // of the page count) immediately instead of lingering until the next full
  // refetch lines up with the current page.
  const allIncludingDeletedQuery = useQuery({
    queryKey: ['users', role, 'all-including-deleted'],
    queryFn: () => listUsers(role, 1, FETCH_ALL_PAGE_SIZE, true),
    enabled: includeDeleted,
  });

  const activeUsersQuery = useQuery({
    queryKey: ['users', role, 'active-for-deleted-check'],
    queryFn: () => listUsers(role, 1, FETCH_ALL_PAGE_SIZE, false),
    enabled: includeDeleted,
  });

  const deletedOnlyResult = useMemo(() => {
    const activeIds = new Set((activeUsersQuery.data?.items ?? []).map((user) => user.id));
    const deletedOnly = (allIncludingDeletedQuery.data?.items ?? [])
      .filter((user) => !activeIds.has(user.id))
      .map((user) => ({ ...user, isDeleted: true }));
    return paginateClientSide(deletedOnly, page, 10);
  }, [allIncludingDeletedQuery.data, activeUsersQuery.data, page]);

  const isDeletedViewLoading = allIncludingDeletedQuery.isLoading || activeUsersQuery.isLoading;
  const isDeletedViewError = allIncludingDeletedQuery.isError || activeUsersQuery.isError;
  const result = includeDeleted ? deletedOnlyResult : activeResult;
  const isLoading = includeDeleted ? isDeletedViewLoading : allActiveUsersQuery.isLoading;
  const isError = includeDeleted ? isDeletedViewError : allActiveUsersQuery.isError;

  function refetchCurrentView() {
    if (includeDeleted) {
      void allIncludingDeletedQuery.refetch();
      void activeUsersQuery.refetch();
    } else {
      void allActiveUsersQuery.refetch();
    }
  }

  const detailQuery = useQuery({
    queryKey: ['users', role, selected?.id],
    queryFn: () => getUser(role, selected?.id ?? ''),
    enabled: dialog === 'edit' && Boolean(selected?.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  // toast tier errors are already surfaced globally by the api client; this
  // covers "screen" tier errors for actions with no form to attach them to.
  function toastOnError(error: unknown) {
    if (error instanceof ApiError) {
      useToastStore.getState().add({ message: error.message, variant: 'error' });
    }
  }

  const createMutation = useMutation({
    mutationFn: (values: CreateUserValues) => createUser(values),
    onSuccess: () => {
      setDialog(null);
      void invalidate();
    },
  });

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
    onError: toastOnError,
  });

  const restoreMutation = useMutation({
    mutationFn: (user: UserSummaryDto) => restoreUser(role, user.id),
    onSuccess: () => void invalidate(),
    onError: toastOnError,
  });

  const permanentDeleteSelfMutation = useMutation({
    mutationFn: () => permanentDeleteSelf(currentUser?.id ?? ''),
    onSuccess: () => {
      setConfirmSelfDelete(false);
      clearSession();
      queryClient.clear();
      void navigate('/login', { replace: true });
    },
    onError: (error) => {
      setConfirmSelfDelete(false);
      toastOnError(error);
    },
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
          <div className="flex gap-2">
            {role !== 'admin' ? (
              <Button type="button" onClick={() => setDialog('create')}>
                Create account
              </Button>
            ) : null}
            <Button
              type="button"
              variant={includeDeleted ? 'secondary' : 'ghost'}
              onClick={() => {
                setIncludeDeleted((value) => !value);
                setPage(1);
              }}
            >
              {includeDeleted ? 'Viewing deleted' : 'View deleted'}
            </Button>
          </div>
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

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={refetchCurrentView} /> : null}
      {!isLoading && !isError && result && result.items.length === 0 ? (
        <EmptyState
          title={includeDeleted ? 'No deleted users' : 'No users found'}
          description={includeDeleted ? 'No deleted records for this role right now.' : 'This role has no records in the selected view.'}
        />
      ) : null}
      {!isLoading && !isError && result && result.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <UserTable
            users={result.items}
            currentUserId={currentUser?.id}
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
            onPermanentDelete={() => setConfirmSelfDelete(true)}
          />
          <PaginationBar page={page} result={result} onPageChange={setPage} />
        </Panel>
      ) : null}

      {role !== 'admin' ? (
        <CreateUserDialog
          open={dialog === 'create'}
          defaultRole={role}
          onOpenChange={(open) => setDialog(open ? 'create' : null)}
          onSubmit={(values) => createMutation.mutateAsync(values)}
        />
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

      <Dialog
        open={confirmSelfDelete}
        onOpenChange={(open) => { if (!open) setConfirmSelfDelete(false); }}
        title="Permanently delete your account?"
        description="This cannot be undone. Your admin account will be removed from the database entirely, your session will end immediately, and you will not be able to log back in."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmSelfDelete(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-on-error hover:bg-error/90"
            disabled={permanentDeleteSelfMutation.isPending}
            onClick={() => permanentDeleteSelfMutation.mutate()}
          >
            Delete my account permanently
          </Button>
        </div>
      </Dialog>
    </>
  );
}
