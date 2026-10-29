import { supabase } from '@/lib/supabase';
import type { TeamAchievement } from '@/types/database';

export async function fetchPublicAchievements(): Promise<TeamAchievement[]> {
  const { data, error } = await supabase
    .from('team_achievements')
    .select('*')
    .eq('is_active', true)
    .order('rank_order');

  if (error) throw error;
  return (data ?? []) as TeamAchievement[];
}

export async function fetchAdminAchievements(): Promise<TeamAchievement[]> {
  const { data, error } = await supabase
    .from('team_achievements')
    .select('*')
    .order('rank_order');

  if (error) throw error;
  return (data ?? []) as TeamAchievement[];
}

export async function fetchAdminAchievementById(id: string): Promise<TeamAchievement | null> {
  const { data, error } = await supabase
    .from('team_achievements')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as TeamAchievement | null;
}

export async function createAchievement(
  payload: Omit<Partial<TeamAchievement>, 'id' | 'created_at' | 'updated_at'>
): Promise<TeamAchievement> {
  const { data, error } = await supabase
    .from('team_achievements')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as TeamAchievement;
}

export async function updateAchievement(
  id: string,
  patch: Omit<Partial<TeamAchievement>, 'id' | 'created_at'>
): Promise<TeamAchievement> {
  const { data, error } = await supabase
    .from('team_achievements')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TeamAchievement;
}

export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await supabase
    .from('team_achievements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
