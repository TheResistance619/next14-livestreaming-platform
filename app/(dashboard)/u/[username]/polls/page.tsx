import { getSelf } from "@/lib/auth-service";
import {
    getPollAnalytics,
    getPollHistory,
} from "@/lib/poll-service";
import { getStreamByUserId } from "@/lib/stream-service";
import { PollCreator } from "@/components/stream-player/poll-creator";
import { PollManager } from "@/components/stream-player/poll-manager";

const PollsPage = async () => {
    const self = await getSelf();

    const stream = await getStreamByUserId(self.id);

    if (!stream) {
        throw new Error("Stream not found");
    }

    const pollHistory = await getPollHistory(stream.id);
    const analytics = await getPollAnalytics(stream.id);

    const maxPollVotes = Math.max(
        ...pollHistory.map((historyPoll) =>
            historyPoll.options.reduce(
                (total, option) =>
                    total + option.votes,
                0
            )
        ),
        1
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Live Polls
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Create and manage polls for your Campfire stream.
                </p>
            </div>

            <div className="space-y-6">
                <PollManager streamId={stream.id} />

                <div className="max-w-xl">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">
                            📊 Poll Analytics
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            See how your audience has participated in your polls.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">
                                Total Polls
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {analytics.totalPolls}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">
                                Total Votes
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {analytics.totalVotes}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">
                                Avg. Votes / Poll
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {analytics.averageVotesPerPoll}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">
                                Most Participated
                            </p>

                            <p className="mt-2 line-clamp-2 text-sm font-medium">
                                {analytics.mostParticipatedPoll
                                    ? analytics.mostParticipatedPoll.question
                                    : "No polls yet"}
                            </p>

                            {analytics.mostParticipatedPoll && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {
                                        analytics
                                            .mostParticipatedPoll
                                            .votes
                                    }{" "}
                                    votes
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">
                                Most Popular Option
                            </p>

                            <p className="mt-2 line-clamp-2 text-sm font-medium">
                                {analytics.mostPopularOption
                                    ? analytics.mostPopularOption.text
                                    : "No votes yet"}
                            </p>

                            {analytics.mostPopularOption && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {
                                        analytics
                                            .mostPopularOption
                                            .votes
                                    }{" "}
                                    votes
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <PollCreator streamId={stream.id} />

                {pollHistory.length > 0 && (
                    <div className="max-w-xl rounded-lg border p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                                📊 Poll Performance
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                See which polls got your Campfire talking.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {pollHistory.map((poll) => {
                                const totalVotes =
                                    poll.options.reduce(
                                        (total, option) =>
                                            total + option.votes,
                                        0
                                    );

                                const performancePercentage =
                                    Math.round(
                                        (totalVotes /
                                            maxPollVotes) *
                                            100
                                    );

                                return (
                                    <div
                                        key={poll.id}
                                        className="rounded-md border p-4"
                                    >
                                        <div className="mb-3">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Poll Performance
                                                </span>

                                                <span className="text-xs font-semibold">
                                                    {totalVotes}{" "}
                                                    {totalVotes === 1
                                                        ? "vote"
                                                        : "votes"}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                                    style={{
                                                        width: `${performancePercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="font-medium">
                                                {poll.question}
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {totalVotes}{" "}
                                                {totalVotes === 1
                                                    ? "vote"
                                                    : "votes"}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {poll.options.map(
                                                (option) => {
                                                    const percentage =
                                                        totalVotes === 0
                                                            ? 0
                                                            : Math.round(
                                                                  (option.votes /
                                                                      totalVotes) *
                                                                      100
                                                              );

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className="space-y-1"
                                                        >
                                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                                <span className="min-w-0 truncate font-medium">
                                                                    {
                                                                        option.text
                                                                    }
                                                                </span>

                                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                                    {
                                                                        option.votes
                                                                    }{" "}
                                                                    {option.votes ===
                                                                    1
                                                                        ? "vote"
                                                                        : "votes"}{" "}
                                                                    ·{" "}
                                                                    {
                                                                        percentage
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>

                                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollsPage;