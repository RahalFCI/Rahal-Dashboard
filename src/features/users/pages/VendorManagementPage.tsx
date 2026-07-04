import { zodResolver } from '@hookform/resolvers/zod';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Edit, Eye, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { approveVendorProfile, listDeletedVendorProfiles, listUnapprovedVendorProfiles, listVendorProfiles } from '@/features/vendors/api/vendorProfileApi';
import { listUsers } from '@/features/users/api/usersApi';
import { createVendorCategory, deleteVendorCategory, listVendorCategories, updateVendorCategory } from '@/features/vendors/api/vendorCategoryApi';
import { VendorCategoryDetailDialog } from '@/features/vendors/components/VendorCategoryDetailDialog';
import { vendorCategorySchema, type VendorCategoryFormValues } from '@/features/vendors/schemas';
import type { VendorCategoryDto, VendorProfileDto } from '@/features/vendors/types';
import { matchesQuery, paginateClientSide } from '@/features/search/lib/clientSearch';
import { VendorSearchTable } from '@/features/search/components/VendorSearchTable';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { useToastStore } from '@/shared/stores/toastStore';

type VendorView = 'all' | 'unapproved' | 'deleted' | 'categories' | 'search';

const views: { value: VendorView; label: string }[] = [
  { value: 'all', label: 'All vendors' },
  { value: 'unapproved', label: 'Pending approval' },
  { value: 'deleted', label: 'Deleted profiles' },
  { value: 'categories', label: 'Categories' },
  { value: 'search', label: 'Search' },
];

// Moved from the old cross-feature SearchPage: fetches everything once and
// filters/paginates entirely client-side, since the backend's dedicated text
// search endpoints (/api/Search/*) depend on a Meilisearch index that is
// frequently empty or inconsistently populated.
const SEARCH_FETCH_ALL_PAGE_SIZE = 500;
const SEARCH_PAGE_SIZE = 10;

export function VendorManagementPage() {
  const [view, setView] = useState<VendorView>('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);

  const vendorsQuery = useQuery({
    queryKey: ['vendor-profiles', view, page],
    queryFn: () => {
      if (view === 'unapproved') return listUnapprovedVendorProfiles(page, 10);
      if (view === 'deleted') return listDeletedVendorProfiles(page, 10);
      return listVendorProfiles(page, 10);
    },
    enabled: view !== 'categories' && view !== 'search',
  });

  // VendorProfileDto (Gamification module) has no email - it lives on the
  // AspNetUsers account in the separate Users module. Resolved client-side
  // the same way CheckInsPage resolves placeName: bulk-fetch and map by id.
  const vendorUsersQuery = useQuery({
    queryKey: ['users', 'vendor', 'for-email-lookup'],
    queryFn: () => listUsers('vendor', 1, 500, true),
    enabled: view !== 'categories',
  });
  const vendorEmailByUserId = new Map((vendorUsersQuery.data?.items ?? []).map((user) => [user.id, user.email]));

  // Search view: bulk-fetch all vendor profiles once and filter/paginate
  // client-side. Moved here from the old cross-feature SearchPage's vendors tab.
  const vendorsSearchRawQuery = useQuery({
    queryKey: ['search-source', 'vendors'],
    queryFn: () => listVendorProfiles(1, SEARCH_FETCH_ALL_PAGE_SIZE),
    enabled: view === 'search',
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const vendorSearchResult = useMemo(
    () =>
      paginateClientSide(
        (vendorsSearchRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, searchQuery)),
        searchPage,
        SEARCH_PAGE_SIZE,
      ),
    [vendorsSearchRawQuery.data, searchQuery, searchPage],
  );

  const categoriesQuery = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: listVendorCategories,
    enabled: view === 'categories',
  });

  const [editingCategory, setEditingCategory] = useState<VendorCategoryDto | null>(null);
  const [viewCategoryId, setViewCategoryId] = useState<string | null>(null);

  // Case-insensitive, live filtering against the already-fetched category
  // list. GET /VendorCategory/name/{name} (used elsewhere via
  // getVendorCategoryByName) only does an exact, case-sensitive match, so it
  // can't power a type-as-you-go, case-insensitive search.
  const [categoryNameFilter, setCategoryNameFilter] = useState('');
  const filteredCategories = (categoriesQuery.data ?? []).filter((category) => matchesQuery(category, categoryNameFilter));

  const categoryForm = useForm<VendorCategoryFormValues>({
    resolver: zodResolver(vendorCategorySchema),
    defaultValues: { name: '' },
  });

  const editCategoryForm = useForm<VendorCategoryFormValues>({
    resolver: zodResolver(vendorCategorySchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (editingCategory) editCategoryForm.reset({ name: editingCategory.name });
  }, [editingCategory, editCategoryForm]);

  function toastOnError(error: unknown) {
    // ALREADY_EXISTS/SERVER are "screen" tier (not auto-toasted by apiClient),
    // and there's no dedicated field to attach these errors to here.
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const createCategoryMutation = useMutation({
    mutationFn: (values: VendorCategoryFormValues) => createVendorCategory(values.name),
    onSuccess: () => {
      categoryForm.reset({ name: '' });
      void queryClient.invalidateQueries({ queryKey: ['vendor-categories'] });
    },
    onError: toastOnError,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (values: VendorCategoryFormValues) => updateVendorCategory(editingCategory?.id ?? '', values.name),
    onSuccess: () => {
      setEditingCategory(null);
      void queryClient.invalidateQueries({ queryKey: ['vendor-categories'] });
    },
    onError: toastOnError,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteVendorCategory(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['vendor-categories'] }),
    onError: toastOnError,
  });

  const approveMutation = useMutation({
    mutationFn: (vendor: VendorProfileDto) => approveVendorProfile(vendor.userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] }),
  });

  function changeView(nextView: string) {
    setView(nextView as VendorView);
    setPage(1);
    setSearchQuery('');
    setSearchPage(1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Vendor management"
        description="Vendor profiles, approval state, deleted profile queues, and the category taxonomy vendors choose from."
      />

      <Tabs.Root value={view} onValueChange={changeView}>
        <Tabs.List className="mb-4 flex flex-wrap gap-2">
          {views.map((item) => (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              className={cn(
                'focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant',
                view === item.value && 'bg-primary text-white',
              )}
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {view === 'categories' ? (
        <>
          <Panel className="mb-4 p-4">
            <form
              className="flex items-end gap-3"
              onSubmit={categoryForm.handleSubmit((values) => createCategoryMutation.mutateAsync(values))}
            >
              <div className="flex-1">
                <Label htmlFor="vendor-category-name">New category name</Label>
                <Input id="vendor-category-name" placeholder="e.g. Restaurant" {...categoryForm.register('name')} />
                <FieldError message={categoryForm.formState.errors.name?.message} />
              </div>
              <Button disabled={categoryForm.formState.isSubmitting}>
                <Plus size={17} />
                Add category
              </Button>
            </form>
          </Panel>

          <Panel className="mb-4 p-4">
            <Label htmlFor="vendor-category-name-filter">Filter categories by name</Label>
            <Input
              id="vendor-category-name-filter"
              placeholder="Type to filter, e.g. restaurant"
              value={categoryNameFilter}
              onChange={(event) => setCategoryNameFilter(event.target.value)}
            />
          </Panel>

          {categoriesQuery.isLoading ? <LoadingState /> : null}
          {categoriesQuery.isError ? <ErrorState onRetry={() => void categoriesQuery.refetch()} /> : null}
          {categoriesQuery.data?.length === 0 ? (
            <EmptyState title="No vendor categories yet" description="Create the first category vendors can select." />
          ) : null}
          {categoriesQuery.data && categoriesQuery.data.length > 0 && filteredCategories.length === 0 ? (
            <EmptyState title="No matches" description={`No category name matches "${categoryNameFilter}".`} />
          ) : null}
          {filteredCategories.length > 0 ? (
            <Panel className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="border-t border-outline/40">
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="View category details"
                            onClick={() => setViewCategoryId(category.id)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Edit category"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete category"
                            onClick={() => void deleteCategoryMutation.mutate(category.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          ) : null}

          <Dialog
            open={editingCategory !== null}
            onOpenChange={(open) => {
              if (!open) setEditingCategory(null);
            }}
            title="Edit category"
          >
            <form className="grid gap-4" onSubmit={editCategoryForm.handleSubmit((values) => updateCategoryMutation.mutateAsync(values))}>
              <div>
                <Label htmlFor="edit-vendor-category-name">Name</Label>
                <Input id="edit-vendor-category-name" {...editCategoryForm.register('name')} />
                <FieldError message={editCategoryForm.formState.errors.name?.message} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
                <Button disabled={editCategoryForm.formState.isSubmitting}>Save category</Button>
              </div>
            </form>
          </Dialog>

          <VendorCategoryDetailDialog
            categoryId={viewCategoryId}
            open={viewCategoryId !== null}
            onOpenChange={(open) => {
              if (!open) setViewCategoryId(null);
            }}
          />
        </>
      ) : view === 'search' ? (
        <>
          <Panel className="mb-4 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Type any letter or number in a vendor name..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchPage(1);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                aria-label="Refresh results"
                disabled={vendorsSearchRawQuery.isFetching}
                onClick={() => void vendorsSearchRawQuery.refetch()}
              >
                <RefreshCw size={16} className={vendorsSearchRawQuery.isFetching ? 'animate-spin' : undefined} />
                Refresh
              </Button>
            </div>
          </Panel>

          {vendorsSearchRawQuery.isLoading ? <LoadingState label="Loading records..." /> : null}
          {vendorsSearchRawQuery.isError ? <ErrorState onRetry={() => void vendorsSearchRawQuery.refetch()} /> : null}
          {!vendorsSearchRawQuery.isLoading && !vendorsSearchRawQuery.isError && searchQuery.length === 0 ? (
            <EmptyState title="Start typing to search" description="Matches appear instantly as you type any part of the name." />
          ) : null}
          {!vendorsSearchRawQuery.isLoading && !vendorsSearchRawQuery.isError && searchQuery.length > 0 && vendorSearchResult.items.length === 0 ? (
            <EmptyState title="No matches" description={`No vendors matched "${searchQuery}".`} />
          ) : null}
          {searchQuery.length > 0 && vendorSearchResult.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <VendorSearchTable vendors={vendorSearchResult.items} emailByUserId={vendorEmailByUserId} />
              <PaginationBar page={searchPage} result={vendorSearchResult} onPageChange={setSearchPage} />
            </Panel>
          ) : null}
        </>
      ) : (
        <>
          {vendorsQuery.isLoading ? <LoadingState /> : null}
          {vendorsQuery.isError ? <ErrorState onRetry={() => void vendorsQuery.refetch()} /> : null}
          {vendorsQuery.data && vendorsQuery.data.items.length === 0 ? (
            <EmptyState title="No vendors found" description="There are no vendor profiles in this view." />
          ) : null}
          {vendorsQuery.data && vendorsQuery.data.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Vendor</th>
                      <th className="px-4 py-3 font-semibold">Country</th>
                      <th className="px-4 py-3 font-semibold">Address</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {vendorsQuery.data.items.map((vendor) => (
                      <tr key={vendor.userId} className="border-t border-outline/40">
                        <td className="px-4 py-3 align-middle">
                          <p className="font-medium text-on-surface">{vendor.displayName}</p>
                          <p className="text-xs text-on-surface-variant">{vendorEmailByUserId.get(vendor.userId) || ''}</p>
                        </td>
                        <td className="px-4 py-3 align-middle">{vendor.countryCode}</td>
                        <td className="px-4 py-3 align-middle">{vendor.address}</td>
                        <td className="px-4 py-3 align-middle">
                          <Badge className={vendor.isApproved ? 'bg-green-100 text-green-700' : ''}>
                            {vendor.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex justify-end">
                            {!vendor.isApproved && view !== 'deleted' ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Approve vendor"
                                onClick={() => approveMutation.mutate(vendor)}
                              >
                                <CheckCircle2 size={16} />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar page={page} result={vendorsQuery.data} onPageChange={setPage} />
            </Panel>
          ) : null}
        </>
      )}
    </>
  );
}
