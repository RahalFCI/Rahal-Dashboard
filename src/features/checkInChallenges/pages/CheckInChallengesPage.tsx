import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import {
  getCheckInChallengeById,
  getCheckInChallengesByChallengeId,
  getCheckInChallengesByCheckInId,
} from '../api/checkInChallengeApi';

const statusBadgeClass: Record<string, string> = {
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export function CheckInChallengesPage() {
  const [idInput, setIdInput] = useState('');
  const [searchedId, setSearchedId] = useState('');

  // There's no "list all" endpoint for this resource - GetCheckInChallengeById
  // is the only way to look one up here until the by-challenge/by-checkin
  // endpoints are wired in (those return lists this page can link out to).
  const challengeQuery = useQuery({
    queryKey: ['check-in-challenge', searchedId],
    queryFn: () => getCheckInChallengeById(searchedId),
    enabled: searchedId.length > 0,
    retry: false,
  });

  const [checkInIdInput, setCheckInIdInput] = useState('');
  const [searchedCheckInId, setSearchedCheckInId] = useState('');
  const [byCheckInPage, setByCheckInPage] = useState(1);

  // GetCheckInDto (used by the CheckIns feature) never exposes the check-in's
  // own id, so there's no row to link this in from yet - the "Check-in ID"
  // field shown below in a by-id lookup result is the easiest way to get one.
  const byCheckInQuery = useQuery({
    queryKey: ['check-in-challenges', 'by-checkin', searchedCheckInId, byCheckInPage],
    queryFn: () => getCheckInChallengesByCheckInId(searchedCheckInId, byCheckInPage, 10),
    enabled: searchedCheckInId.length > 0,
  });

  const [challengeIdInput, setChallengeIdInput] = useState('');
  const [searchedChallengeId, setSearchedChallengeId] = useState('');
  const [byChallengePage, setByChallengePage] = useState(1);

  // Same situation as byCheckInQuery - the "Challenge ID" field shown in a
  // by-id lookup result above is the easiest way to get a real id to try here.
  const byChallengeQuery = useQuery({
    queryKey: ['check-in-challenges', 'by-challenge', searchedChallengeId, byChallengePage],
    queryFn: () => getCheckInChallengesByChallengeId(searchedChallengeId, byChallengePage, 10),
    enabled: searchedChallengeId.length > 0,
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Check-in challenges"
        description="Look up a single check-in challenge by its ID to see validation status and proof."
      />

      <Panel className="mb-4 p-4">
        <form
          className="flex items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSearchedId(idInput.trim());
          }}
        >
          <div className="flex-1">
            <Label htmlFor="check-in-challenge-id">Check-in challenge ID</Label>
            <Input
              id="check-in-challenge-id"
              placeholder="Paste a check-in challenge ID"
              value={idInput}
              onChange={(event) => setIdInput(event.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={idInput.trim().length === 0}>
            <Search size={16} />
            Find
          </Button>
        </form>
      </Panel>

      {searchedId ? (
        <>
          {challengeQuery.isLoading ? <LoadingState label="Looking up check-in challenge..." /> : null}
          {challengeQuery.isError ? <ErrorState onRetry={() => void challengeQuery.refetch()} /> : null}
          {challengeQuery.data ? (
            <Panel className="grid grid-cols-2 gap-4 p-4 text-sm">
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Challenge</p>
                <p className="mt-1 font-medium text-on-surface">{challengeQuery.data.challengeName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Challenge ID</p>
                <p className="mt-1 font-mono text-xs text-on-surface-variant" title={challengeQuery.data.challengeId}>
                  {challengeQuery.data.challengeId}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Explorer ID</p>
                <p className="mt-1 font-mono text-xs text-on-surface-variant" title={challengeQuery.data.explorerId}>
                  {challengeQuery.data.explorerId}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Check-in ID</p>
                <p className="mt-1 font-mono text-xs text-on-surface-variant" title={challengeQuery.data.checkInId}>
                  {challengeQuery.data.checkInId}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Status</p>
                <Badge className={`mt-1 ${statusBadgeClass[challengeQuery.data.validationStatus] ?? ''}`}>
                  {challengeQuery.data.validationStatus}
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Proof</p>
                {challengeQuery.data.proofMediaUrl ? (
                  <a
                    href={challengeQuery.data.proofMediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    View proof media
                  </a>
                ) : (
                  <p className="mt-1 text-on-surface-variant">None submitted</p>
                )}
              </div>
            </Panel>
          ) : null}
        </>
      ) : null}

      <PageHeader
        eyebrow="Admin"
        title="Check-in challenges by check-in"
        description="Look up every challenge attempt submitted for a given check-in."
      />

      <Panel className="mb-4 p-4">
        <form
          className="flex items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setByCheckInPage(1);
            setSearchedCheckInId(checkInIdInput.trim());
          }}
        >
          <div className="flex-1">
            <Label htmlFor="check-in-id">Check-in ID</Label>
            <Input
              id="check-in-id"
              placeholder="Paste a check-in ID"
              value={checkInIdInput}
              onChange={(event) => setCheckInIdInput(event.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={checkInIdInput.trim().length === 0}>
            <Search size={16} />
            Find
          </Button>
        </form>
      </Panel>

      {searchedCheckInId ? (
        <>
          {byCheckInQuery.isLoading ? <LoadingState label="Looking up check-in challenges..." /> : null}
          {byCheckInQuery.isError ? <ErrorState onRetry={() => void byCheckInQuery.refetch()} /> : null}
          {byCheckInQuery.data && byCheckInQuery.data.items.length === 0 ? (
            <EmptyState title="No challenges" description="No challenge has been attempted for this check-in." />
          ) : null}
          {byCheckInQuery.data && byCheckInQuery.data.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Challenge</th>
                    <th className="px-4 py-3">Explorer</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {byCheckInQuery.data.items.map((challenge) => (
                    <tr key={challenge.id} className="border-t border-outline/40">
                      <td className="px-4 py-3 font-medium">{challenge.challengeName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant" title={challenge.explorerId}>
                        {challenge.explorerId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusBadgeClass[challenge.validationStatus] ?? ''}>
                          {challenge.validationStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationBar page={byCheckInPage} result={byCheckInQuery.data} onPageChange={setByCheckInPage} />
            </Panel>
          ) : null}
        </>
      ) : null}

      <PageHeader
        eyebrow="Admin"
        title="Check-in challenges by challenge"
        description="Look up every attempt explorers have made at a given challenge."
      />

      <Panel className="mb-4 p-4">
        <form
          className="flex items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setByChallengePage(1);
            setSearchedChallengeId(challengeIdInput.trim());
          }}
        >
          <div className="flex-1">
            <Label htmlFor="challenge-id">Challenge ID</Label>
            <Input
              id="challenge-id"
              placeholder="Paste a challenge ID"
              value={challengeIdInput}
              onChange={(event) => setChallengeIdInput(event.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={challengeIdInput.trim().length === 0}>
            <Search size={16} />
            Find
          </Button>
        </form>
      </Panel>

      {searchedChallengeId ? (
        <>
          {byChallengeQuery.isLoading ? <LoadingState label="Looking up check-in challenges..." /> : null}
          {byChallengeQuery.isError ? <ErrorState onRetry={() => void byChallengeQuery.refetch()} /> : null}
          {byChallengeQuery.data && byChallengeQuery.data.items.length === 0 ? (
            <EmptyState title="No attempts" description="No explorer has attempted this challenge yet." />
          ) : null}
          {byChallengeQuery.data && byChallengeQuery.data.items.length > 0 ? (
            <Panel className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Explorer</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {byChallengeQuery.data.items.map((challenge) => (
                    <tr key={challenge.id} className="border-t border-outline/40">
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant" title={challenge.explorerId}>
                        {challenge.explorerId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusBadgeClass[challenge.validationStatus] ?? ''}>
                          {challenge.validationStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationBar page={byChallengePage} result={byChallengeQuery.data} onPageChange={setByChallengePage} />
            </Panel>
          ) : null}
        </>
      ) : null}
    </>
  );
}
