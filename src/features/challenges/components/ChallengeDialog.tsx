import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import type { GetPlaceDto } from '@/features/places/types';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { challengeSchema, type ChallengeFormValues } from '../schemas';

interface ChallengeDialogProps {
  open: boolean;
  places: GetPlaceDto[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ChallengeFormValues) => Promise<unknown>;
  error?: string | null;
}

// ChallengeType only has one member today, but this stays a list (rather
// than hardcoding "Photo" into the form) so a future addition to the enum
// doesn't require touching this dialog.
const CHALLENGE_TYPES = ['Photo'];
const CHALLENGE_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const defaultValues: ChallengeFormValues = {
  placeId: '',
  name: '',
  description: '',
  validationPrompt: '',
  type: CHALLENGE_TYPES[0],
  difficulty: '',
  minimumLevelRequired: 1,
  xpReward: 0,
};

export function ChallengeDialog({ open, places, onOpenChange, onSubmit, error }: ChallengeDialogProps) {
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema) as Resolver<ChallengeFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create challenge">
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <div>
          <Label htmlFor="challenge-place">Place</Label>
          <Select id="challenge-place" {...form.register('placeId')}>
            <option value="">Choose a place</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </Select>
          <FieldError message={form.formState.errors.placeId?.message} />
        </div>
        <div>
          <Label htmlFor="challenge-name">Name</Label>
          <Input id="challenge-name" {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="challenge-description">Description</Label>
          <Textarea id="challenge-description" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
        <div>
          <Label htmlFor="challenge-validation-prompt">Validation prompt</Label>
          <Textarea
            id="challenge-validation-prompt"
            placeholder="The prompt shown to whatever validates the explorer's submitted proof"
            {...form.register('validationPrompt')}
          />
          <FieldError message={form.formState.errors.validationPrompt?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="challenge-type">Type</Label>
            <Select id="challenge-type" {...form.register('type')}>
              {CHALLENGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <FieldError message={form.formState.errors.type?.message} />
          </div>
          <div>
            <Label htmlFor="challenge-difficulty">Difficulty</Label>
            <Select id="challenge-difficulty" {...form.register('difficulty')}>
              <option value="">Choose difficulty</option>
              {CHALLENGE_DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </Select>
            <FieldError message={form.formState.errors.difficulty?.message} />
          </div>
          <div>
            <Label htmlFor="challenge-min-level">Minimum level</Label>
            <Input id="challenge-min-level" type="number" min={1} {...form.register('minimumLevelRequired')} />
            <FieldError message={form.formState.errors.minimumLevelRequired?.message} />
          </div>
          <div>
            <Label htmlFor="challenge-xp-reward">XP reward</Label>
            <Input id="challenge-xp-reward" type="number" min={1} {...form.register('xpReward')} />
            <FieldError message={form.formState.errors.xpReward?.message} />
          </div>
        </div>
        <FieldError message={error ?? undefined} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>Create challenge</Button>
        </div>
      </form>
    </Dialog>
  );
}
