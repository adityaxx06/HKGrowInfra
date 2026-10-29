import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchPublicAchievements, fetchAdminAchievements, fetchAdminAchievementById,
  createAchievement, updateAchievement, deleteAchievement,
} from '@/services/achievements.service';
import type { TeamAchievement } from '@/types/database';

export function usePublicAchievements() {
  return useQuery({
    queryKey: QUERY_KEYS.achievements.list(),
    queryFn: fetchPublicAchievements,
    staleTime: STALE.static,
  });
}

export function useAdminAchievements() {
  return useQuery({
    queryKey: QUERY_KEYS.achievements.adminList(),
    queryFn: fetchAdminAchievements,
    staleTime: STALE.admin,
  });
}

export function useAdminAchievement(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.achievements.adminDetail(id),
    queryFn: () => fetchAdminAchievementById(id),
    staleTime: STALE.admin,
    enabled: !!id,
  });
}

export function useCreateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<TeamAchievement>, 'id' | 'created_at' | 'updated_at'>) =>
      createAchievement(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.achievements.all }); },
  });
}

export function useUpdateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Omit<Partial<TeamAchievement>, 'id' | 'created_at'> }) =>
      updateAchievement(id, patch),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.achievements.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.achievements.adminDetail(id) });
    },
  });
}

export function useDeleteAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.achievements.all }); },
  });
}
