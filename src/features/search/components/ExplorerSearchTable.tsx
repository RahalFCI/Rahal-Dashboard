import { Badge } from '@/shared/components/ui/badge';
import type { ExplorerProfileDto } from '@/features/users/api/explorerProfileApi';

interface ExplorerSearchTableProps {
  explorers: ExplorerProfileDto[];
  emailByUserId: Map<string, string>;
}

export function ExplorerSearchTable({ explorers, emailByUserId }: ExplorerSearchTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
          <tr>
            <th className="px-4 py-3 font-semibold">Explorer</th>
            <th className="px-4 py-3 font-semibold">Country</th>
            <th className="px-4 py-3 font-semibold">Level</th>
          </tr>
        </thead>
        <tbody>
          {explorers.map((explorer) => (
            <tr key={explorer.userId} className="border-t border-outline/40">
              <td className="px-4 py-3 align-middle">
                <p className="font-medium text-on-surface">{explorer.displayName}</p>
                <p className="text-xs text-on-surface-variant">{emailByUserId.get(explorer.userId) || ''}</p>
              </td>
              <td className="px-4 py-3 align-middle">{explorer.countryCode}</td>
              <td className="px-4 py-3 align-middle">
                <Badge>{explorer.isPremium ? `Premium · Level ${explorer.level}` : `Level ${explorer.level}`}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
