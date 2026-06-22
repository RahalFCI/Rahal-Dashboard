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
import { PlaceTable } from '@/features/places/components/PlaceTable';
import { listCategories, listPlaces, searchPlacesByLocation } from '@/features/places/api/placesApi';
import { UserTable } from '@/features/users/components/UserTable';
import { listAllUsers } from '@/features/users/api/usersApi';
import { listExplorerProfiles } from '@/features/users/api/explorerProfileApi';
import { listVendorProfiles } from '@/features/vendors/api/vendorProfileApi';
import { matchesQuery, paginateClientSide } from '../lib/clientSearch';
import { ExplorerSearchTable } from '../components/ExplorerSearchTable';
import { LocationSearchForm, type LocationSearchValues } from '../components/LocationSearchForm';
import { VendorSearchTable } from '../components/VendorSearchTable';

type SearchTab = 'users' | 'vendors' | 'explorers' | 'places' | 'nearby';

const tabs: { value: SearchTab; label: string }[] = [
  { value: 'users', label: 'Users' },
  { value: 'vendors', label: 'Vendors' },
  { value: 'explorers', label: 'Explorers' },
  { value: 'places', label: 'Places' },
  { value: 'nearby', label: 'Nearby places' },
];

// All data for users/vendors/explorers/places is fetched once per tab (a
// generous page size standing in for "everything") and then filtered and
// re-paginated entirely client-side, since the backend's dedicated text
// search endpoints (/api/Search/*) depend on a Meilisearch index that is
// frequently empty or inconsistently populated. These list endpoints are
// the same ones already used elsewhere in the dashboard and always return
// real data straight from the database.
const FETCH_ALL_PAGE_SIZE = 500;
const PAGE_SIZE = 10;

export function SearchPage() {
  const [tab, setTab] = useState<SearchTab>('users');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [locationParams, setLocationParams] = useState<LocationSearchValues | null>(null);

  function changeTab(nextTab: string) {
    setTab(nextTab as SearchTab);
    setQuery('');
    setLocationParams(null);
    setPage(1);
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
  }

  // The app-wide QueryClient default (staleTime: 30s) would let this page show
  // a stale snapshot for up to 30s after a record is created/edited on another
  // page, with no automatic invalidation tying those pages back to this one.
  // These four queries opt out of that and always refetch on mount so newly
  // created records are never invisible here; the Refresh button below covers
  // the case where the admin doesn't leave this page at all.
  const usersRawQuery = useQuery({
    queryKey: ['search-source', 'users'],
    queryFn: () => listAllUsers(1, FETCH_ALL_PAGE_SIZE),
    enabled: tab === 'users',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const vendorsRawQuery = useQuery({
    queryKey: ['search-source', 'vendors'],
    queryFn: () => listVendorProfiles(1, FETCH_ALL_PAGE_SIZE),
    enabled: tab === 'vendors',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const explorersRawQuery = useQuery({
    queryKey: ['search-source', 'explorers'],
    queryFn: () => listExplorerProfiles(1, FETCH_ALL_PAGE_SIZE),
    enabled: tab === 'explorers',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const placesRawQuery = useQuery({
    queryKey: ['search-source', 'places'],
    queryFn: () => listPlaces(1, FETCH_ALL_PAGE_SIZE),
    enabled: tab === 'places',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const nearbyQuery = useQuery({
    queryKey: ['search-source', 'nearby', locationParams, page],
    queryFn: () => searchPlacesByLocation({ ...locationParams!, page, pageSize: PAGE_SIZE }),
    enabled: tab === 'nearby' && locationParams !== null,
  });

  // PlaceTable needs this to display category names: the place list/search/nearby
  // endpoints all omit the PlaceCategory include, so place.categoryName is always
  // empty (see PlacesPage.tsx for the same workaround).
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    enabled: tab === 'places' || tab === 'nearby',
  });

  const users = useMemo(
    () => paginateClientSide((usersRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, query)), page, PAGE_SIZE),
    [usersRawQuery.data, query, page],
  );
  const vendors = useMemo(
    () => paginateClientSide((vendorsRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, query)), page, PAGE_SIZE),
    [vendorsRawQuery.data, query, page],
  );
  const explorers = useMemo(
    () => paginateClientSide((explorersRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, query)), page, PAGE_SIZE),
    [explorersRawQuery.data, query, page],
  );
  const places = useMemo(
    () => paginateClientSide((placesRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, query)), page, PAGE_SIZE),
    [placesRawQuery.data, query, page],
  );

  const sourceQuery = { users: usersRawQuery, vendors: vendorsRawQuery, explorers: explorersRawQuery, places: placesRawQuery, nearby: nearbyQuery }[tab];
  const hasSearchInput = tab === 'nearby' ? locationParams !== null : query.length > 0;
  const filteredResult = { users, vendors, explorers, places, nearby: nearbyQuery.data }[tab];

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Search"
        description="Search across users, vendors, explorers, places, and places near a location."
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
        {tab === 'nearby' ? (
          <LocationSearchForm
            onSubmit={(values) => {
              setLocationParams(values);
              setPage(1);
            }}
          />
        ) : (
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
        )}
      </Panel>

      {/* The raw list loads once per tab; filtering on every keystroke afterwards is instant and local. */}
      {sourceQuery.isLoading ? <LoadingState label={tab === 'nearby' ? 'Searching...' : 'Loading records...'} /> : null}
      {sourceQuery.isError ? <ErrorState onRetry={() => void sourceQuery.refetch()} /> : null}

      {!sourceQuery.isLoading && !sourceQuery.isError && !hasSearchInput ? (
        <EmptyState
          title={tab === 'nearby' ? 'Enter coordinates to search' : 'Start typing to search'}
          description={tab === 'nearby' ? 'Results appear after you submit a latitude, longitude, and radius.' : 'Matches appear instantly as you type any part of the name.'}
        />
      ) : null}
      {!sourceQuery.isLoading && !sourceQuery.isError && hasSearchInput && filteredResult && filteredResult.items.length === 0 ? (
        <EmptyState
          title="No matches"
          description={tab === 'nearby' ? 'No places found within that radius.' : `No ${tab} matched "${query}".`}
        />
      ) : null}

      {tab === 'users' && hasSearchInput && users.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <UserTable users={users.items} />
          <PaginationBar page={page} result={users} onPageChange={setPage} />
        </Panel>
      ) : null}

      {tab === 'vendors' && hasSearchInput && vendors.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <VendorSearchTable vendors={vendors.items} />
          <PaginationBar page={page} result={vendors} onPageChange={setPage} />
        </Panel>
      ) : null}

      {tab === 'explorers' && hasSearchInput && explorers.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <ExplorerSearchTable explorers={explorers.items} />
          <PaginationBar page={page} result={explorers} onPageChange={setPage} />
        </Panel>
      ) : null}

      {tab === 'places' && hasSearchInput && places.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <PlaceTable places={places.items} categories={categoriesQuery.data ?? []} />
          <PaginationBar page={page} result={places} onPageChange={setPage} />
        </Panel>
      ) : null}

      {tab === 'nearby' && nearbyQuery.data && nearbyQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <PlaceTable places={nearbyQuery.data.items} categories={categoriesQuery.data ?? []} />
          <PaginationBar page={page} result={nearbyQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}
    </>
  );
}
