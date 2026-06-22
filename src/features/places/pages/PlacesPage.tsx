import { zodResolver } from '@hookform/resolvers/zod';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { Textarea } from '@/shared/components/ui/textarea';
import { queryClient } from '@/shared/api/queryClient';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { PlaceChallengesDialog } from '@/features/challenges/components/PlaceChallengesDialog';
import { PlaceCheckInsDialog } from '@/features/checkIns/components/PlaceCheckInsDialog';
import { PlaceReviewsDialog } from '@/features/placeReviews/components/PlaceReviewsDialog';
import { categorySchema, type CategoryFormValues } from '../schemas';
import { createCategory, createPlace, deleteCategory, deletePlace, listCategories, listPlaces, updateCategory, updatePlace } from '../api/placesApi';
import { CategoryPlacesDialog } from '../components/CategoryPlacesDialog';
import { PlaceDialog } from '../components/PlaceDialog';
import { PlaceTable } from '../components/PlaceTable';
import type { PlaceFormValues } from '../schemas';
import type { GetPlaceCategoryDto, GetPlaceDto } from '../types';

type PlacesView = 'places' | 'categories';

const views: { value: PlacesView; label: string }[] = [
  { value: 'places', label: 'Places' },
  { value: 'categories', label: 'Categories' },
];

export function PlacesPage() {
  const [view, setView] = useState<PlacesView>('places');
  const [page, setPage] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<GetPlaceDto | null>(null);
  const [placeDialogOpen, setPlaceDialogOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<GetPlaceCategoryDto | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<GetPlaceCategoryDto | null>(null);
  const [viewCheckInsPlace, setViewCheckInsPlace] = useState<GetPlaceDto | null>(null);
  const [viewChallengesPlace, setViewChallengesPlace] = useState<GetPlaceDto | null>(null);
  const [viewReviewsPlace, setViewReviewsPlace] = useState<GetPlaceDto | null>(null);

  const placesQuery = useQuery({ queryKey: ['places', page], queryFn: () => listPlaces(page, 10), enabled: view === 'places' });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: listCategories });

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
  }

  const upsertPlaceMutation = useMutation({
    mutationFn: (values: PlaceFormValues) => (selectedPlace ? updatePlace(selectedPlace.id, values) : createPlace(values)),
    onSuccess: () => {
      setPlaceDialogOpen(false);
      setSelectedPlace(null);
      void queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

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
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Places"
        description="Curated places and the category taxonomy used by discovery, vendor onboarding, and place creation."
        actions={
          view === 'places' ? (
            <Button
              type="button"
              onClick={() => {
                setSelectedPlace(null);
                setPlaceDialogOpen(true);
              }}
            >
              <Plus size={17} />
              New place
            </Button>
          ) : (
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
          )
        }
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

      {view === 'places' ? (
        <>
          {placesQuery.isLoading ? <LoadingState /> : null}
          {placesQuery.isError ? <ErrorState onRetry={() => void placesQuery.refetch()} /> : null}
          {placesQuery.data?.items.length === 0 ? <EmptyState title="No places yet" description="Create the first dashboard-managed place." /> : null}
          {placesQuery.data && placesQuery.data.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <PlaceTable
                places={placesQuery.data.items}
                categories={categoriesQuery.data ?? []}
                onEdit={(place) => {
                  setSelectedPlace(place);
                  setPlaceDialogOpen(true);
                }}
                onDelete={(place) => void deletePlaceMutation.mutate(place)}
                onViewCheckIns={(place) => setViewCheckInsPlace(place)}
                onViewChallenges={(place) => setViewChallengesPlace(place)}
                onViewReviews={(place) => setViewReviewsPlace(place)}
              />
              <PaginationBar page={page} result={placesQuery.data} onPageChange={setPage} />
            </Panel>
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
        </>
      )}

      <PlaceDialog
        open={placeDialogOpen}
        place={selectedPlace}
        categories={categoriesQuery.data ?? []}
        onOpenChange={setPlaceDialogOpen}
        onSubmit={(values) => upsertPlaceMutation.mutateAsync(values)}
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
