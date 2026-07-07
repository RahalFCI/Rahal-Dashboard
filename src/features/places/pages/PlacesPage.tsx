import { zodResolver } from '@hookform/resolvers/zod';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit, Eye, LayoutGrid, List, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { Textarea } from '@/shared/components/ui/textarea';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { PlaceChallengesDialog } from '@/features/challenges/components/PlaceChallengesDialog';
import { PlaceCheckInsDialog } from '@/features/checkIns/components/PlaceCheckInsDialog';
import { PlaceReviewsDialog } from '@/features/placeReviews/components/PlaceReviewsDialog';
import { matchesQuery, paginateClientSide } from '@/features/search/lib/clientSearch';
import { LocationSearchForm, type LocationSearchValues } from '@/features/search/components/LocationSearchForm';
import { categorySchema, type CategoryFormValues } from '../schemas';
import {
  addPlacePhoto,
  createCategory,
  createPlace,
  deleteCategory,
  deletePlace,
  listCategories,
  listPlaces,
  searchPlacesByLocation,
  updateCategory,
  updatePlace,
} from '../api/placesApi';
import { CategoryPlacesDialog } from '../components/CategoryPlacesDialog';
import { PlaceCardList, type PlaceListLayout } from '../components/PlaceCardList';
import { PlaceDialog } from '../components/PlaceDialog';
import { PlaceTable } from '../components/PlaceTable';
import type { PlaceFormValues } from '../schemas';
import type { GetPlaceCategoryDto, GetPlaceDto } from '../types';

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something went wrong.';
}

type PlacesView = 'places' | 'categories' | 'search' | 'nearby';

const views: { value: PlacesView; label: string }[] = [
  { value: 'places', label: 'Places' },
  { value: 'categories', label: 'Categories' },
];

type SearchMode = 'search' | 'nearby';

const searchModes: { value: SearchMode; label: string }[] = [
  { value: 'search', label: 'Search by Name' },
  { value: 'nearby', label: 'Coordinate Search' },
];

// Moved from the old cross-feature SearchPage: fetches everything once and
// filters/paginates entirely client-side, since the backend's dedicated text
// search endpoints (/api/Search/*) depend on a Meilisearch index that is
// frequently empty or inconsistently populated.
const SEARCH_FETCH_ALL_PAGE_SIZE = 500;
const SEARCH_PAGE_SIZE = 10;

export function PlacesPage() {
  const [view, setView] = useState<PlacesView>('places');
  const [layout, setLayout] = useState<PlaceListLayout>('list');
  const [headerQuery, setHeaderQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<GetPlaceDto | null>(null);
  const [placeDialogOpen, setPlaceDialogOpen] = useState(false);
  // Set once a new place is created but its photo upload fails - the place
  // itself is not rolled back, so the dialog switches into a photo-retry view
  // for this id instead of losing the just-created record.
  const [createdPlaceId, setCreatedPlaceId] = useState<string | null>(null);
  const [photoErrorMessage, setPhotoErrorMessage] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<GetPlaceCategoryDto | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<GetPlaceCategoryDto | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<GetPlaceCategoryDto | null>(null);
  const [viewCheckInsPlace, setViewCheckInsPlace] = useState<GetPlaceDto | null>(null);
  const [viewChallengesPlace, setViewChallengesPlace] = useState<GetPlaceDto | null>(null);
  const [viewReviewsPlace, setViewReviewsPlace] = useState<GetPlaceDto | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [locationParams, setLocationParams] = useState<LocationSearchValues | null>(null);
  const [nearbyPage, setNearbyPage] = useState(1);

  const searchMode: SearchMode = view === 'nearby' ? 'nearby' : 'search';

  const placesQuery = useQuery({ queryKey: ['places', page], queryFn: () => listPlaces(page, 10), enabled: view === 'places' });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: listCategories });

  // Header search bar filters the currently loaded page of places client-side
  // - separate from the dedicated "Search by Name" tab, which bulk-fetches and
  // paginates across every place.
  const visiblePlaces = useMemo(() => {
    const items = placesQuery.data?.items ?? [];
    if (!headerQuery.trim()) return items;
    return items.filter((place) => matchesQuery(place, headerQuery));
  }, [placesQuery.data, headerQuery]);

  // Search view: bulk-fetch all places once and filter/paginate client-side.
  // Moved here from the old cross-feature SearchPage's places tab.
  const placesSearchRawQuery = useQuery({
    queryKey: ['search-source', 'places'],
    queryFn: () => listPlaces(1, SEARCH_FETCH_ALL_PAGE_SIZE),
    enabled: view === 'search',
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const placeSearchResult = useMemo(
    () =>
      paginateClientSide(
        (placesSearchRawQuery.data?.items ?? []).filter((item) => matchesQuery(item, searchQuery)),
        searchPage,
        SEARCH_PAGE_SIZE,
      ),
    [placesSearchRawQuery.data, searchQuery, searchPage],
  );

  // Nearby view: moved here from the old cross-feature SearchPage's nearby tab.
  const nearbyQuery = useQuery({
    queryKey: ['search-source', 'nearby', locationParams, nearbyPage],
    queryFn: () => searchPlacesByLocation({ ...locationParams!, page: nearbyPage, pageSize: SEARCH_PAGE_SIZE }),
    enabled: view === 'nearby' && locationParams !== null,
  });

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (!categoryDialogOpen) return;
    categoryForm.reset(
      selectedCategory ? { name: selectedCategory.name, description: selectedCategory.description } : { name: '', description: '' },
    );
  }, [categoryDialogOpen, categoryForm, selectedCategory]);

  function changeView(nextView: string) {
    setView(nextView as PlacesView);
    setSearchQuery('');
    setSearchPage(1);
    setLocationParams(null);
    setNearbyPage(1);
  }

  const upsertPlaceMutation = useMutation({
    mutationFn: async ({ values, photo }: { values: PlaceFormValues; photo: File | null }) => {
      if (selectedPlace) {
        await updatePlace(selectedPlace.id, values);
        return { photoFailed: false as const, placeId: selectedPlace.id };
      }
      const newPlaceId = await createPlace(values);
      if (!photo) return { photoFailed: false as const, placeId: newPlaceId };
      try {
        await addPlacePhoto(newPlaceId, photo);
        return { photoFailed: false as const, placeId: newPlaceId };
      } catch (error) {
        // The place itself was created successfully - only the photo upload
        // failed, so this isn't treated as a full mutation failure (which
        // would leave the admin thinking nothing happened).
        return { photoFailed: true as const, placeId: newPlaceId, message: errorMessage(error) };
      }
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['places'] });
      void queryClient.invalidateQueries({ queryKey: ['place-photos', result.placeId] });
      if (result.photoFailed) {
        setCreatedPlaceId(result.placeId);
        setPhotoErrorMessage(result.message);
        return;
      }
      setPlaceDialogOpen(false);
      setSelectedPlace(null);
      setCreatedPlaceId(null);
      setPhotoErrorMessage(null);
    },
  });

  const retryPhotoMutation = useMutation({
    mutationFn: (photo: File) => addPlacePhoto(createdPlaceId!, photo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['place-photos', createdPlaceId] });
      setPlaceDialogOpen(false);
      setCreatedPlaceId(null);
      setPhotoErrorMessage(null);
    },
    onError: (error) => setPhotoErrorMessage(errorMessage(error)),
  });

  function closePlaceDialog() {
    setPlaceDialogOpen(false);
    setSelectedPlace(null);
    setCreatedPlaceId(null);
    setPhotoErrorMessage(null);
  }

  const deletePlaceMutation = useMutation({
    mutationFn: (place: GetPlaceDto) => deletePlace(place.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['places'] }),
  });

  const upsertCategoryMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      selectedCategory ? updateCategory(selectedCategory.id, values) : createCategory(values),
    onSuccess: () => {
      setCategoryDialogOpen(false);
      setSelectedCategory(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      setPendingDeleteCategory(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Places"
        description="Curated places and the category taxonomy used by discovery, vendor onboarding, and place creation."
        actions={
          view === 'places' ? (
            <>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  type="search"
                  placeholder="Search destinations..."
                  value={headerQuery}
                  onChange={(event) => setHeaderQuery(event.target.value)}
                  className="mt-0 w-64 rounded-full border-0 bg-surface-low py-2 pl-10 focus:border-0"
                />
              </div>
              <Button
                type="button"
                variant="dark"
                onClick={() => {
                  setSelectedPlace(null);
                  setCreatedPlaceId(null);
                  setPhotoErrorMessage(null);
                  setPlaceDialogOpen(true);
                }}
              >
                <Plus size={17} />
                Add Place
              </Button>
            </>
          ) : view === 'categories' ? (
            <Button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setCategoryDialogOpen(true);
              }}
            >
              <Plus size={17} />
              New category
            </Button>
          ) : null
        }
      />

      <div className="mb-4">
        <div className="mb-3 inline-flex gap-1 rounded-lg bg-surface-low p-1">
          {searchModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => changeView(mode.value)}
              className={cn(
                'focus-ring rounded-md px-3 py-1.5 text-sm font-semibold text-on-surface-variant transition-colors',
                view === mode.value && 'bg-primary text-white',
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <Panel className="p-4">
          {searchMode === 'search' ? (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Type any letter or number in a place name..."
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
                disabled={placesSearchRawQuery.isFetching}
                onClick={() => void placesSearchRawQuery.refetch()}
              >
                <RefreshCw size={16} className={placesSearchRawQuery.isFetching ? 'animate-spin' : undefined} />
                Refresh
              </Button>
            </div>
          ) : (
            <LocationSearchForm
              onSubmit={(values) => {
                setLocationParams(values);
                setNearbyPage(1);
              }}
            />
          )}
        </Panel>
      </div>

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

      {view === 'search' ? (
        <>
          {placesSearchRawQuery.isLoading ? <LoadingState label="Loading records..." /> : null}
          {placesSearchRawQuery.isError ? <ErrorState onRetry={() => void placesSearchRawQuery.refetch()} /> : null}
          {!placesSearchRawQuery.isLoading && !placesSearchRawQuery.isError && searchQuery.length === 0 ? (
            <EmptyState title="Start typing to search" description="Matches appear instantly as you type any part of the name." />
          ) : null}
          {!placesSearchRawQuery.isLoading && !placesSearchRawQuery.isError && searchQuery.length > 0 && placeSearchResult.items.length === 0 ? (
            <EmptyState title="No matches" description={`No places matched "${searchQuery}".`} />
          ) : null}
          {searchQuery.length > 0 && placeSearchResult.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <PlaceTable places={placeSearchResult.items} categories={categoriesQuery.data ?? []} />
              <PaginationBar page={searchPage} result={placeSearchResult} onPageChange={setSearchPage} />
            </Panel>
          ) : null}
        </>
      ) : view === 'nearby' ? (
        <>
          {nearbyQuery.isLoading ? <LoadingState label="Searching..." /> : null}
          {nearbyQuery.isError ? <ErrorState onRetry={() => void nearbyQuery.refetch()} /> : null}
          {!nearbyQuery.isLoading && !nearbyQuery.isError && locationParams === null ? (
            <EmptyState title="Enter coordinates to search" description="Results appear after you submit a latitude, longitude, and radius." />
          ) : null}
          {!nearbyQuery.isLoading && !nearbyQuery.isError && locationParams !== null && nearbyQuery.data && nearbyQuery.data.items.length === 0 ? (
            <EmptyState title="No matches" description="No places found within that radius." />
          ) : null}
          {nearbyQuery.data && nearbyQuery.data.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <PlaceTable places={nearbyQuery.data.items} categories={categoriesQuery.data ?? []} />
              <PaginationBar page={nearbyPage} result={nearbyQuery.data} onPageChange={setNearbyPage} />
            </Panel>
          ) : null}
        </>
      ) : view === 'places' ? (
        <>
          {placesQuery.isLoading ? <LoadingState /> : null}
          {placesQuery.isError ? <ErrorState onRetry={() => void placesQuery.refetch()} /> : null}
          {placesQuery.data?.items.length === 0 ? <EmptyState title="No places yet" description="Create the first dashboard-managed place." /> : null}
          {placesQuery.data && placesQuery.data.items.length > 0 ? (
            <>
              <div className="mb-4 flex justify-end">
                <div className="inline-flex gap-1 rounded-lg bg-surface-low p-1">
                  <button
                    type="button"
                    aria-label="List view"
                    onClick={() => setLayout('list')}
                    className={cn(
                      'focus-ring grid size-8 place-items-center rounded-md text-on-surface-variant transition-colors',
                      layout === 'list' && 'bg-primary text-white',
                    )}
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Grid view"
                    onClick={() => setLayout('grid')}
                    className={cn(
                      'focus-ring grid size-8 place-items-center rounded-md text-on-surface-variant transition-colors',
                      layout === 'grid' && 'bg-primary text-white',
                    )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>

              {visiblePlaces.length === 0 ? (
                <EmptyState title="No matches" description={`No places matched "${headerQuery}".`} />
              ) : (
                <PlaceCardList
                  places={visiblePlaces}
                  categories={categoriesQuery.data ?? []}
                  layout={layout}
                  onEdit={(place) => {
                    setSelectedPlace(place);
                    setCreatedPlaceId(null);
                    setPhotoErrorMessage(null);
                    setPlaceDialogOpen(true);
                  }}
                  onDelete={(place) => void deletePlaceMutation.mutate(place)}
                  onViewCheckIns={(place) => setViewCheckInsPlace(place)}
                  onViewChallenges={(place) => setViewChallengesPlace(place)}
                  onViewReviews={(place) => setViewReviewsPlace(place)}
                />
              )}

              <div className="mt-5">
                <PaginationBar page={page} result={placesQuery.data} onPageChange={setPage} />
              </div>
            </>
          ) : null}
        </>
      ) : (
        <>
          {categoriesQuery.isLoading ? <LoadingState /> : null}
          {categoriesQuery.isError ? <ErrorState onRetry={() => void categoriesQuery.refetch()} /> : null}
          {categoriesQuery.data?.length === 0 ? <EmptyState title="No categories" description="Create categories before adding places." /> : null}
          {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
            <Panel className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Places</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesQuery.data.map((category) => (
                    <tr key={category.id} className="border-t border-outline/40">
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{category.description}</td>
                      <td className="px-4 py-3">{category.placeCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="View places in category"
                            onClick={() => setViewCategory(category)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Edit category"
                            onClick={() => {
                              setSelectedCategory(category);
                              setCategoryDialogOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete category"
                            onClick={() => setPendingDeleteCategory(category)}
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
        </>
      )}

      <PlaceDialog
        open={placeDialogOpen}
        place={selectedPlace}
        categories={categoriesQuery.data ?? []}
        createdPlaceId={createdPlaceId}
        photoError={photoErrorMessage}
        isSubmittingPhoto={retryPhotoMutation.isPending}
        onOpenChange={(open) => {
          if (open) setPlaceDialogOpen(true);
          else closePlaceDialog();
        }}
        onSubmit={(values, photo) => upsertPlaceMutation.mutateAsync({ values, photo })}
        onRetryPhoto={(photo) => retryPhotoMutation.mutateAsync(photo)}
        onSkipPhoto={closePlaceDialog}
      />

      <Dialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        title={selectedCategory ? 'Edit category' : 'Create category'}
      >
        <form className="grid gap-4" onSubmit={categoryForm.handleSubmit((values) => upsertCategoryMutation.mutateAsync(values))}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...categoryForm.register('name')} />
            <FieldError message={categoryForm.formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...categoryForm.register('description')} />
            <FieldError message={categoryForm.formState.errors.description?.message} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button>{selectedCategory ? 'Save category' : 'Create category'}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={pendingDeleteCategory !== null}
        title={pendingDeleteCategory ? `Delete "${pendingDeleteCategory.name}"?` : 'Delete category?'}
        description="This cannot be undone. The category will be permanently removed."
        isConfirming={deleteCategoryMutation.isPending}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => pendingDeleteCategory && deleteCategoryMutation.mutate(pendingDeleteCategory.id)}
      />

      <CategoryPlacesDialog
        category={viewCategory}
        open={Boolean(viewCategory)}
        onOpenChange={(open) => {
          if (!open) setViewCategory(null);
        }}
      />

      <PlaceCheckInsDialog
        placeId={viewCheckInsPlace?.id ?? null}
        placeName={viewCheckInsPlace?.name}
        open={viewCheckInsPlace !== null}
        onOpenChange={(open) => {
          if (!open) setViewCheckInsPlace(null);
        }}
      />

      <PlaceChallengesDialog
        placeId={viewChallengesPlace?.id ?? null}
        placeName={viewChallengesPlace?.name}
        open={viewChallengesPlace !== null}
        onOpenChange={(open) => {
          if (!open) setViewChallengesPlace(null);
        }}
      />

      <PlaceReviewsDialog
        placeId={viewReviewsPlace?.id ?? null}
        placeName={viewReviewsPlace?.name}
        open={viewReviewsPlace !== null}
        onOpenChange={(open) => {
          if (!open) setViewReviewsPlace(null);
        }}
      />
    </>
  );
}
