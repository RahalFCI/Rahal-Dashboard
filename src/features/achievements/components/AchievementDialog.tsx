import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import type { GetBadgeDto } from '@/features/badges/types';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { achievementSchema, type AchievementFormValues } from '../schemas';
import type { GetAchievementCriteriaTypeDto, GetAchievementDto } from '../types';

interface AchievementDialogProps {
  open: boolean;
  achievement?: GetAchievementDto | null;
  badges: GetBadgeDto[];
  criteriaTypes: GetAchievementCriteriaTypeDto[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AchievementFormValues) => Promise<unknown>;
  error?: string | null;
}

const defaultValues: AchievementFormValues = {
  title: '',
  description: '',
  badgeId: '',
  xpReward: 0,
  criteriaTypeId: '',
  criteriaThreshold: 1,
};

export function AchievementDialog({
  open,
  achievement,
  badges,
  criteriaTypes,
  onOpenChange,
  onSubmit,
  error,
}: AchievementDialogProps) {
  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema) as Resolver<AchievementFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      achievement
        ? {
            title: achievement.title,
            description: achievement.description,
            badgeId: achievement.badgeId ?? '',
            xpReward: achievement.xpReward,
            criteriaTypeId: achievement.criteriaTypeId,
            criteriaThreshold: achievement.criteriaThreshold,
          }
        : defaultValues,
    );
  }, [form, open, achievement]);

  function handleSubmit(values: AchievementFormValues) {
    // UpdateAchievementDto requires a non-empty BadgeId, even though it's
    // optional on create - enforce that here since the backend can't be changed.
    if (achievement && !values.badgeId) {
      form.setError('badgeId', { message: 'Badge is required when editing an achievement.' });
      return;
    }
    return onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={achievement ? 'Edit achievement' : 'Create achievement'}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register('title')} />
          <FieldError message={form.formState.errors.title?.message} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="badgeId">Badge{achievement ? '' : ' (optional)'}</Label>
            <Select id="badgeId" {...form.register('badgeId')}>
              <option value="">{achievement ? 'Choose a badge' : 'No badge'}</option>
              {badges.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </Select>
            <FieldError message={form.formState.errors.badgeId?.message} />
          </div>
          <div>
            <Label htmlFor="xpReward">XP reward</Label>
            <Input id="xpReward" type="number" min={0} {...form.register('xpReward')} />
            <FieldError message={form.formState.errors.xpReward?.message} />
          </div>
          <div>
            <Label htmlFor="criteriaTypeId">Criteria type</Label>
            <Select id="criteriaTypeId" {...form.register('criteriaTypeId')}>
              <option value="">Choose criteria type</option>
              {criteriaTypes.map((criteriaType) => (
                <option key={criteriaType.id} value={criteriaType.id}>
                  {criteriaType.name}
                </option>
              ))}
            </Select>
            <FieldError message={form.formState.errors.criteriaTypeId?.message} />
          </div>
          <div>
            <Label htmlFor="criteriaThreshold">Criteria threshold</Label>
            <Input id="criteriaThreshold" type="number" min={1} {...form.register('criteriaThreshold')} />
            <FieldError message={form.formState.errors.criteriaThreshold?.message} />
          </div>
        </div>
        <FieldError message={error ?? undefined} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>{achievement ? 'Save achievement' : 'Create achievement'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
