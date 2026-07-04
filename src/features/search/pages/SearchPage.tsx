import { useQuery } from '@tanstack/react-query';
import * as Tabs from '@radix-ui/react-tabs';
import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { UserTable } from '@/features/users/components/UserTable';
import { listAllUsers } from '@/features/users/api/usersApi';
import { listExplorerProfiles } from '@/features/users/api/explorerProfileApi';
import { matchesQuery, paginateClientSide } from '../lib/clientSearch';
import { ExplorerSearchTable } from '../components/ExplorerSearchTable';

// Vendor search now lives on the Vendors page, and Places/Nearby search now
// live on the Places page. Users and Explorers have no dedicated page of
// their own in the sidebar (User management browses/edits by role, not by
// text search), so this page stays as a focused User/Explorer search.
type SearchTab = 'users' | 'explorers';

const tabs: { value: SearchTab; label: string }[] = [
  { value: 'users', label: 'Users' },
  { value: 'explorers', label: 'Explorers' },
];

// All data for users/explorers is fetched once per tab (a generous page size
// standing in for "everything") and then filtered and re-paginated entirely
// client-side, since the backend's dedicated text search endpoints
// (/api/Search/*) depend on a Meilisearch index that is frequently empty or
// inconsistently populated. These list endpoints are the same ones already
// used elsewhere in the dashboard and always return real data straight from
// the database.
const FETCH_ALL_PAGE_SIZE = 500;
const PAGE_SIZE = 10;

export function SearchPage() {
  const [tab, setTab] = useState<SearchTab>('users');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  function changeTab(nextTab: string) {
    setTab(nextTab as SearchTab);
    setQuery('');
    setPage(1);
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
  }

  // The app-wide QueryClient default (staleTime: 30s) would let this page show
  // a stale snapshot for up to 30s after a record is created/edited on another
  // page, with no automatic invalidation tying those pages back to this one.
  // These queries opt out of that and always refetch on mount so newly
  // created records are never invisible here; the Refresh button below covers
  // the case where the admin doesn't leave this page at all.
  // Also enabled for the explorers tab: ExplorerProfileDto has no email (it
  // lives on the separate Users-module account), so this same bulk fetch
  // doubles as the source for resolving each row's email by userId.
  const usersRawQuery = useQuery({
    queryKey: ['search-source', 'users'],
    queryFn: () => listAllUsers(1, FETCH_ALL_PAGE_SIZE),
    enabled: tab === 'users' || tab === 'explorers',
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const emailByUserId = useMemo(
    () => new Map((usersRawQuery.data?.items ?? []).map((user) => [user.id, user.email])),
    [usersRawQuery.data],
  );

  const explorersRawQuery = useQuery({
    queryKey: ['search-source', 'explorers'],
    queryFn: () => listExplorerProfiles(1, FETCH_ALL_PAGE_SIZE),
    enabled: tab === 'explorers',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const users = useMemo(
    () => paginateClientSide((usersRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, query)), page, PAGE_SIZE),
    [usersRawQuery.data, query, page],
  );
  const explorers = useMemo(
    () => paginateClientSide((explorersRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, query)), page, PAGE_SIZE),
    [explorersRawQuery.data, query, page],
  );

  const sourceQuery = { users: usersRawQuery, explorers: explorersRawQuery }[tab];
  const hasSearchInput = query.length > 0;
  const filteredResult = { users, explorers }[tab];

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="User & explorer search"
        description="Search across users and explorer profiles."
      />

      <Tabs.Root value={tab} onValueChange={changeTab}>
        <Tabs.List className="mb-4 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              className={cn(
                'focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant',
                tab === item.value && 'bg-primary text-white',
              )}
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <Panel className="mb-4 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              type="search"
              placeholder={`Type any letter or number in a ${tabs.find((item) => item.value === tab)?.label.toLowerCase().replace(/s$/, '')} name...`}
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            aria-label="Refresh results"
            disabled={sourceQuery.isFetching}
            onClick={() => void sourceQuery.refetch()}
          >
            <RefreshCw size={16} className={sourceQuery.isFetching ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>
      </Panel>

      {/* The raw list loads once per tab; filtering on every keystroke afterwards is instant and local. */}
      {sourceQuery.isLoading ? <LoadingState label="Loading records..." /> : null}
      {sourceQuery.isError ? <ErrorState onRetry={() => void sourceQuery.refetch()} /> : null}

      {!sourceQuery.isLoading && !sourceQuery.isError && !hasSearchInput ? (
        <EmptyState title="Start typing to search" description="Matches appear instantly as you type any part of the name." />
      ) : null}
      {!sourceQuery.isLoading && !sourceQuery.isError && hasSearchInput && filteredResult && filteredResult.items.length === 0 ? (
        <EmptyState title="No matches" description={`No ${tab} matched "${query}".`} />
      ) : null}

      {tab === 'users' && hasSearchInput && users.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <UserTable users={users.items} />
          <PaginationBar page={page} result={users} onPageChange={setPage} />
        </Panel>
      ) : null}

      {tab === 'explorers' && hasSearchInput && explorers.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <ExplorerSearchTable explorers={explorers.items} emailByUserId={emailByUserId} />
          <PaginationBar page={page} result={explorers} onPageChange={setPage} />
        </Panel>
      ) : null}
    </>
  );
}
