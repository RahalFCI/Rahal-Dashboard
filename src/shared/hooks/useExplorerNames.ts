import { useQuery } from '@tanstack/react-query';
import { getExplorerNamesByIds } from '@/features/users/api/explorerProfileApi';

// Resolves ExplorerProfile.Id -> display name for modules (Places' check-ins,
// place reviews) that store an explorer id but have no server-side join to
// the ExplorerProfile table. Pass the explorer ids visible on the current
// page/dialog; returns a lookup map keyed by id.
export function useExplorerNames(ids: string[], enabled = true) {
  const uniqueIds = [...new Set(ids)].sort();

  const query = useQuery({
    queryKey: ['explorer-names', uniqueIds],
    queryFn: () => getExplorerNamesByIds(uniqueIds),
    enabled: enabled && uniqueIds.length > 0,
  });

  return new Map((query.data ?? []).map((explorer) => [explorer.id, explorer.displayName]));
}
