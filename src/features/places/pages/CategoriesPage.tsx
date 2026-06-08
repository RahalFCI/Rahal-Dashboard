import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit, Plus, Trash2 } from 'lucide-react';
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
import { categorySchema, type CategoryFormValues } from '../schemas';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../api/placesApi';
import type { GetPlaceCategoryDto } from '../types';

export function CategoriesPage() {
  const [selected, setSelected] = useState<GetPlaceCategoryDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: listCategories });
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (!dialogOpen) return;
    form.reset(selected ? { name: selected.name, description: selected.description } : { name: '', description: '' });
  }, [dialogOpen, form, selected]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });
  const upsertMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => (selected ? updateCategory(selected.id, values) : createCategory(values)),
    onSuccess: () => {
      setDialogOpen(false);
      setSelected(null);
      void invalidate();
    },
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteCategory(id), onSuccess: () => void invalidate() });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Place categories"
        description="The category taxonomy used by discovery, vendor onboarding, and place creation."
        actions={
          <Button
            type="button"
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={17} />
            New category
          </Button>
        }
      />

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
                        aria-label="Edit category"
                        onClick={() => {
                          setSelected(category);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="Delete category" onClick={() => void deleteMutation.mutate(category.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title={selected ? 'Edit category' : 'Create category'}>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => upsertMutation.mutateAsync(values))}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} />
            <FieldError message={form.formState.errors.description?.message} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button>{selected ? 'Save category' : 'Create category'}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
