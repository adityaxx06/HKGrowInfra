import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Award } from 'lucide-react';
import { useAdminAchievements, useDeleteAchievement } from '@/hooks/useAchievements';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { imageUrl } from '@/lib/imageUrl';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';

export function AchievementsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminAchievements();
  const { mutate: remove, isPending: isDeleting } = useDeleteAchievement();

  function handleDelete() {
    if (!deleteId) return;
    remove(deleteId, {
      onSuccess: () => { toast.success('Achievement removed.'); setDeleteId(null); },
      onError: (err) => { toast.error(normaliseError(err)); setDeleteId(null); },
    });
  }

  const deleteTarget = data?.find((item) => item.id === deleteId);

  return (
    <>
      <PageMeta title="Team Achievements | Admin" description="" noindex />
      <AdminPageHeader
        title="Team Achievements"
        subtitle={`${data?.length ?? 0} achievements recorded`}
        action={
          <Button onClick={() => navigate(ROUTES.admin.achievements.new)}>
            <Plus className="h-4 w-4" /> Add Achievement
          </Button>
        }
      />

      <QueryBoundary
        isLoading={isLoading} error={error} onRetry={refetch}
        isEmpty={data?.length === 0} emptyMessage="No team achievements recorded yet."
        loadingVariant="skeleton-list" skeletonCount={5} verbose
      >
        <AdminTable
          columns={['Achievement & Title', 'Member', 'Position', 'Date', 'Status', '']}
          isEmpty={data?.length === 0}
        >
          {data?.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.photo_paths?.[0] ? (
                    <img
                      src={imageUrl(item.photo_paths[0], 'thumb')}
                      alt={item.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                      <Award className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-navy-800 line-clamp-1">{item.title}</span>
                    <span className="text-xs text-ink-secondary">{item.photo_paths?.length ?? 0} photos</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-navy-800">{item.member_name}</td>
              <td className="px-4 py-3 text-sm text-ink-secondary whitespace-pre-line">{item.position}</td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {item.achievement_date ? new Date(item.achievement_date).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3">
                <Badge tone={item.is_active ? 'green' : 'gray'}>
                  {item.is_active ? 'Active' : 'Hidden'}
                </Badge>
              </td>
              <AdminTableActions>
                <button
                  onClick={() => navigate(ROUTES.admin.achievements.edit(item.id))}
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="rounded p-2 text-ink-secondary hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AdminTableActions>
            </tr>
          ))}
        </AdminTable>
      </QueryBoundary>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Achievement"
        message={`Are you sure you want to delete "${deleteTarget?.title ?? 'this achievement'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </>
  );
}
