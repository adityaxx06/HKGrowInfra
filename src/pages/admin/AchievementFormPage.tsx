import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminAchievement, useCreateAchievement, useUpdateAchievement } from '@/hooks/useAchievements';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { achievementSchema, type AchievementFormValues } from '@/components/forms/formSchemas';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';
import type { ImageEntry } from '@/types/database';

export function AchievementFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: item, isLoading, error, refetch } = useAdminAchievement(id ?? '');
  const { mutate: create, isPending: isCreating } = useCreateAchievement();
  const { mutate: update, isPending: isUpdating } = useUpdateAchievement();
  const isSaving = isCreating || isUpdating;

  const [photos, setPhotos] = useState<ImageEntry[]>([]);
  const [initialPhotos, setInitialPhotos] = useState<ImageEntry[]>([]);

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: { is_active: true, rank_order: 0 },
  });

  useEffect(() => {
    if (item) {
      reset({
        title:            item.title,
        member_name:      item.member_name,
        position:         item.position,
        description:      item.description,
        achievement_date: item.achievement_date ? item.achievement_date.split('T')[0] : '',
        rank_order:       item.rank_order,
        is_active:        item.is_active,
      });
      if (item.photo_paths && item.photo_paths.length > 0) {
        const mapped = item.photo_paths.map((p, idx) => ({ path: p, alt: item.title, sort: idx }));
        setPhotos(mapped);
        setInitialPhotos(mapped);
      } else {
        setPhotos([]);
        setInitialPhotos([]);
      }
    }
  }, [item, reset]);

  const photosChanged = JSON.stringify(photos) !== JSON.stringify(initialPhotos);

  function onSubmit(values: AchievementFormValues) {
    const payload = {
      ...values,
      photo_paths: photos.map((p) => p.path),
      achievement_date: values.achievement_date || null,
    };

    if (isEdit && id) {
      update({ id, patch: payload }, {
        onSuccess: () => { toast.success('Achievement updated.'); navigate(ROUTES.admin.achievements.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Achievement added.'); navigate(ROUTES.admin.achievements.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    }
  }

  return (
    <>
      <PageMeta title={`${isEdit ? 'Edit' : 'New'} Achievement | Admin`} description="" noindex />

      <QueryBoundary
        isLoading={isEdit && isLoading}
        error={isEdit ? error : null}
        onRetry={refetch}
        isEmpty={isEdit && !isLoading && !item}
        emptyMessage="Achievement not found."
        verbose
      >
        <AdminPageHeader title={isEdit ? `Edit: ${item?.title ?? '…'}` : 'Add New Achievement'} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

          <FormSection title="Achievement Details" description="Title, date, and description of the achievement.">
            <Input label="Achievement Title" required placeholder="Awarded Best Developer of the Year" error={errors.title?.message} {...register('title')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Achievement Date" type="date" error={errors.achievement_date?.message} {...register('achievement_date')} />
              <Input label="Display Order" type="number" hint="Lower numbers appear first." {...register('rank_order')} />
            </div>
            <Textarea label="Description" rows={5} required placeholder="Describe the achievement in detail..." error={errors.description?.message} {...register('description')} />
            <label className="flex cursor-pointer items-center gap-2 text-sm pt-2">
              <input type="checkbox" className="accent-navy-600" {...register('is_active')} />
              Active (visible on website)
            </label>
          </FormSection>

          <FormSection title="Team Member Info" description="Member name and position/role.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Member Full Name" required placeholder="Aarav Sharma" error={errors.member_name?.message} {...register('member_name')} />
              <Textarea label="Position / Role" required rows={2} placeholder="Senior Project Manager" error={errors.position?.message} {...register('position')} />
            </div>
          </FormSection>

          <FormSection title="Photos" description="Upload photos capturing the event, award, or ceremony (supports multiple photos for sliding gallery).">
            <ImageUploader
              entityPath={`achievements/${id ?? 'new'}`}
              images={photos}
              onChange={setPhotos}
              maxImages={10}
            />
          </FormSection>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <Button type="submit" isLoading={isSaving} disabled={!isDirty && !photosChanged && isEdit}>
              {isEdit ? 'Save Changes' : 'Add Achievement'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.admin.achievements.list)}>
              Cancel
            </Button>
          </div>
        </form>
      </QueryBoundary>
    </>
  );
}
