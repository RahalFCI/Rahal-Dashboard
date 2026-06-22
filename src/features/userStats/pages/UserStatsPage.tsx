import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Eye, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { ExplorerCheckInsDialog } from '@/features/checkIns/components/ExplorerCheckInsDialog';
import { ExplorerReviewsDialog } from '@/features/placeReviews/components/ExplorerReviewsDialog';
import { XpTransactionsDialog } from '@/features/xpTransactions/components/XpTransactionsDialog';
import { listUserStats } from '../api/userStatsApi';
import { UserStatsDetailDialog } from '../components/UserStatsDetailDialog';

export function UserStatsPage() {
  const [page, setPage] = useState(1);
  const [viewExplorerId, setViewExplorerId] = useState<string | null>(null);
  const [viewXpExplorerId, setViewXpExplorerId] = useState<string | null>(null);
  const [viewCheckInsExplorerId, setViewCheckInsExplorerId] = useState<string | null>(null);
  const [viewReviewsExplorerId, setViewReviewsExplorerId] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: ['user-stats', page],
    queryFn: () => listUserStats(page, 10),
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="User stats"
        description="Gamification progress per explorer: XP, streaks, and lifetime totals."
      />

      {statsQuery.isLoading ? <LoadingState /> : null}
      {statsQuery.isError ? <ErrorState onRetry={() => void statsQuery.refetch()} /> : null}
      {statsQuery.data?.items.length === 0 ? (
        <EmptyState title="No user stats yet" description="Stats appear once explorers start earning XP." />
      ) : null}
      {statsQuery.data && statsQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Explorer</th>
                  <th className="px-4 py-3">Available XP</th>
                  <th className="px-4 py-3">Cumulative XP</th>
                  <th className="px-4 py-3">Current streak</th>
                  <th className="px-4 py-3">Longest streak</th>
                  <th className="px-4 py-3">Check-ins</th>
                  <th className="px-4 py-3">Challenges</th>
                  <th className="px-4 py-3">Achievements</th>
                  <th className="px-4 py-3">Badges</th>
                  <th className="px-4 py-3">Last activity</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {statsQuery.data.items.map((stat) => (
                  <tr key={stat.id} className="border-t border-outline/40">
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant" title={stat.explorerId}>
                      {stat.explorerId.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">{stat.availableXp.toLocaleString()}</td>
                    <td className="px-4 py-3">{stat.cumulativeXp.toLocaleString()}</td>
                    <td className="px-4 py-3">{stat.currentStreak}</td>
                    <td className="px-4 py-3">{stat.longestStreak}</td>
                    <td className="px-4 py-3">{stat.totalCheckIns}</td>
                    <td className="px-4 py-3">{stat.totalChallengesCompleted}</td>
                    <td className="px-4 py-3">{stat.totalAchievementsEarned}</td>
                    <td className="px-4 py-3">{stat.totalBadgesEarned}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {stat.lastActivityDate ? new Date(stat.lastActivityDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View explorer stats"
                          onClick={() => setViewExplorerId(stat.explorerId)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View XP transactions for this explorer"
                          onClick={() => setViewXpExplorerId(stat.explorerId)}
                        >
                          <Zap size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View check-ins for this explorer"
                          onClick={() => setViewCheckInsExplorerId(stat.explorerId)}
                        >
                          <CheckSquare size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View reviews by this explorer"
                          onClick={() => setViewReviewsExplorerId(stat.explorerId)}
                        >
                          <Star size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} result={statsQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      <UserStatsDetailDialog
        explorerId={viewExplorerId}
        open={viewExplorerId !== null}
        onOpenChange={(open) => {
          if (!open) setViewExplorerId(null);
        }}
      />

      <XpTransactionsDialog
        explorerId={viewXpExplorerId}
        open={viewXpExplorerId !== null}
        onOpenChange={(open) => {
          if (!open) setViewXpExplorerId(null);
        }}
      />

      <ExplorerCheckInsDialog
        explorerId={viewCheckInsExplorerId}
        open={viewCheckInsExplorerId !== null}
        onOpenChange={(open) => {
          if (!open) setViewCheckInsExplorerId(null);
        }}
      />

      <ExplorerReviewsDialog
        explorerId={viewReviewsExplorerId}
        open={viewReviewsExplorerId !== null}
        onOpenChange={(open) => {
          if (!open) setViewReviewsExplorerId(null);
        }}
      />
    </>
  );
}
