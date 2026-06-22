import { zodResolver } from '@hookform/resolvers/zod';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit, Info, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { listBadges } from '@/features/badges/api/badgesApi';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { Textarea } from '@/shared/components/ui/textarea';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { useToastStore } from '@/shared/stores/toastStore';
import {
  createAchievement,
  createCriteriaType,
  deleteAchievement,
  listAchievements,
  listCriteriaTypes,
  restoreAchievement,
  updateAchievement,
  updateCriteriaType,
} from '../api/achievementApi';
import { AchievementDetailDialog } from '../components/AchievementDetailDialog';
import { AchievementDialog } from '../components/AchievementDialog';
import { CriteriaTypeDetailDialog } from '../components/CriteriaTypeDetailDialog';
import { criteriaTypeSchema, type AchievementFormValues, type CriteriaTypeFormValues } from '../schemas';
import type { GetAchievementCriteriaTypeDto, GetAchievementDto } from '../types';

type AchievementsView = 'achievements' | 'criteria-types';

const views: { value: AchievementsView; label: string }[] = [
  { value: 'achievements', label: 'Achievements' },
  { value: 'criteria-types', label: 'Criteria types' },
];

export function AchievementsPage() {
  const [view, setView] = useState<AchievementsView>('achievements');
  const [page, setPage] = useState(1);
  const [selectedAchievement, setSelectedAchievement] = useState<GetAchievementDto | null>(null);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [viewAchievementId, setViewAchievementId] = useState<string | null>(null);
  const [selectedCriteriaType, setSelectedCriteriaType] = useState<GetAchievementCriteriaTypeDto | null>(null);
  const [criteriaTypeDialogOpen, setCriteriaTypeDialogOpen] = useState(false);
  const [viewCriteriaTypeId, setViewCriteriaTypeId] = useState<string | null>(null);

  function changeView(nextView: string) {
    setView(nextView as AchievementsView);
  }

  const achievementsQuery = useQuery({
    queryKey: ['achievements', page],
    queryFn: () => listAchievements(page, 10),
    enabled: view === 'achievements',
  });

  const badgesQuery = useQuery({ queryKey: ['badges', 'all-for-select'], queryFn: () => listBadges(1, 100) });
  const criteriaTypesQuery = useQuery({ queryKey: ['achievement-criteria-types'], queryFn: listCriteriaTypes });

  const criteriaTypeForm = useForm<CriteriaTypeFormValues>({
    resolver: zodResolver(criteriaTypeSchema),
    defaultValues: { name: '', description: '' },
  });

  const upsertAchievementMutation = useMutation({
    mutationFn: async (values: AchievementFormValues) => {
      if (selectedAchievement) await updateAchievement(selectedAchievement.id, values);
      else await createAchievement(values);
    },
    onSuccess: () => {
      setAchievementDialogOpen(false);
      setSelectedAchievement(null);
      void queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });

  const invalidateAchievements = () => void queryClient.invalidateQueries({ queryKey: ['achievements'] });

  function toastOnError(error: unknown) {
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const restoreAchievementMutation = useMutation({
    mutationFn: (id: string) => restoreAchievement(id),
    onSuccess: invalidateAchievements,
    onError: toastOnError,
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: (_data, id) => {
      invalidateAchievements();
      useToastStore.getState().add({
        message: 'Achievement deleted.',
        variant: 'success',
        action: { label: 'Undo', onClick: () => restoreAchievementMutation.mutate(id) },
      });
    },
    onError: toastOnError,
  });

  const upsertCriteriaTypeMutation = useMutation({
    mutationFn: async (values: CriteriaTypeFormValues) => {
      if (selectedCriteriaType) await updateCriteriaType(selectedCriteriaType.id, values);
      else await createCriteriaType(values);
    },
    onSuccess: () => {
      setCriteriaTypeDialogOpen(false);
      setSelectedCriteriaType(null);
      void queryClient.invalidateQueries({ queryKey: ['achievement-criteria-types'] });
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Achievement catalog"
        description="Achievement definitions explorers can unlock, with their XP reward and unlock criteria."
        actions={
          view === 'achievements' ? (
            <Button
              type="button"
              onClick={() => {
                setSelectedAchievement(null);
                setAchievementDialogOpen(true);
              }}
            >
              <Plus size={17} />
              New achievement
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setSelectedCriteriaType(null);
                criteriaTypeForm.reset({ name: '', description: '' });
                setCriteriaTypeDialogOpen(true);
              }}
            >
              <Plus size={17} />
              New criteria type
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

      {view === 'achievements' ? (
        <>
          {achievementsQuery.isLoading ? <LoadingState /> : null}
          {achievementsQuery.isError ? <ErrorState onRetry={() => void achievementsQuery.refetch()} /> : null}
          {achievementsQuery.data?.items.length === 0 ? (
            <EmptyState title="No achievements yet" description="Achievement definitions appear here once they are created." />
          ) : null}
          {achievementsQuery.data && achievementsQuery.data.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Badge</th>
                      <th className="px-4 py-3">XP reward</th>
                      <th className="px-4 py-3">Criteria</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievementsQuery.data.items.map((achievement) => (
                      <tr key={achievement.id} className="border-t border-outline/40">
                        <td className="px-4 py-3 font-medium">{achievement.title}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{achievement.description}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{achievement.badgeName || '—'}</td>
                        <td className="px-4 py-3">{achievement.xpReward.toLocaleString()}</td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {achievement.criteriaCode} ≥ {achievement.criteriaThreshold}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {new Date(achievement.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="View achievement details"
                              onClick={() => setViewAchievementId(achievement.id)}
                            >
                              <Info size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Edit achievement"
                              onClick={() => {
                                setSelectedAchievement(achievement);
                                setAchievementDialogOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Delete achievement"
                              onClick={() => void deleteAchievementMutation.mutate(achievement.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar page={page} result={achievementsQuery.data} onPageChange={setPage} />
            </Panel>
          ) : null}
        </>
      ) : (
        <>
          {criteriaTypesQuery.isLoading ? <LoadingState /> : null}
          {criteriaTypesQuery.isError ? <ErrorState onRetry={() => void criteriaTypesQuery.refetch()} /> : null}
          {criteriaTypesQuery.data?.length === 0 ? (
            <EmptyState title="No criteria types" description="Create criteria types before adding achievements." />
          ) : null}
          {criteriaTypesQuery.data && criteriaTypesQuery.data.length > 0 ? (
            <Panel className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {criteriaTypesQuery.data.map((criteriaType) => (
                    <tr key={criteriaType.id} className="border-t border-outline/40">
                      <td className="px-4 py-3 font-medium">{criteriaType.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{criteriaType.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="View criteria type details"
                            onClick={() => setViewCriteriaTypeId(criteriaType.id)}
                          >
                            <Info size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Edit criteria type"
                            onClick={() => {
                              setSelectedCriteriaType(criteriaType);
                              criteriaTypeForm.reset({ name: criteriaType.name, description: criteriaType.description });
                              setCriteriaTypeDialogOpen(true);
                            }}
                          >
                            <Edit size={16} />
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

      <AchievementDialog
        open={achievementDialogOpen}
        achievement={selectedAchievement}
        badges={badgesQuery.data?.items ?? []}
        criteriaTypes={criteriaTypesQuery.data ?? []}
        onOpenChange={(open) => {
          setAchievementDialogOpen(open);
          if (!open) {
            setSelectedAchievement(null);
            upsertAchievementMutation.reset();
          }
        }}
        onSubmit={(values) => upsertAchievementMutation.mutateAsync(values)}
        error={upsertAchievementMutation.isError ? upsertAchievementMutation.error.message : null}
      />

      <AchievementDetailDialog
        id={viewAchievementId}
        open={viewAchievementId !== null}
        onOpenChange={(open) => {
          if (!open) setViewAchievementId(null);
        }}
      />

      <Dialog
        open={criteriaTypeDialogOpen}
        onOpenChange={(open) => {
          setCriteriaTypeDialogOpen(open);
          if (!open) {
            setSelectedCriteriaType(null);
            upsertCriteriaTypeMutation.reset();
          }
        }}
        title={selectedCriteriaType ? 'Edit criteria type' : 'Create criteria type'}
      >
        <form
          className="grid gap-4"
          onSubmit={criteriaTypeForm.handleSubmit((values) => upsertCriteriaTypeMutation.mutateAsync(values))}
        >
          <div>
            <Label htmlFor="criteriaTypeName">Name</Label>
            <Input id="criteriaTypeName" {...criteriaTypeForm.register('name')} />
            <FieldError message={criteriaTypeForm.formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="criteriaTypeDescription">Description</Label>
            <Textarea id="criteriaTypeDescription" {...criteriaTypeForm.register('description')} />
            <FieldError message={criteriaTypeForm.formState.errors.description?.message} />
          </div>
          <FieldError
            message={upsertCriteriaTypeMutation.isError ? upsertCriteriaTypeMutation.error.message : undefined}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCriteriaTypeDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={criteriaTypeForm.formState.isSubmitting}>
              {selectedCriteriaType ? 'Save criteria type' : 'Create criteria type'}
            </Button>
          </div>
        </form>
      </Dialog>

      <CriteriaTypeDetailDialog
        id={viewCriteriaTypeId}
        open={viewCriteriaTypeId !== null}
        onOpenChange={(open) => {
          if (!open) setViewCriteriaTypeId(null);
        }}
      />
    </>
  );
}
